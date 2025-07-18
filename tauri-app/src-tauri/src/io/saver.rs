use duckdb::{params, Connection};
use serde_json::json;
use std::{
    fs::{self, File},
    io::{Read, Write},
    path::PathBuf,
};
use tempfile::NamedTempFile;
use zip::{write::FileOptions, ZipArchive, ZipWriter};
use crate::{
    api::load_sheet::ICell, sheet_plugins::stored_sheet::{StoredSheetData, StoredSheetMeta}
};

pub fn save_to_zip_file(
    meta: &StoredSheetMeta,
    data: &StoredSheetData,
    path: &str,
) -> Result<(), String> {
    let zip_file = File::create(path).map_err(|err| err.to_string())?;
    let mut zip_writer = ZipWriter::new(zip_file);

    // 不壓縮
    let options = FileOptions::<()>::default().compression_method(zip::CompressionMethod::Stored);

    let temp_meta = NamedTempFile::new().map_err(|err| err.to_string())?;
    let meta_path = temp_meta.into_temp_path();
    let meta_path_str = meta_path.to_str().ok_or("Invalid meta path")?;
    save_meta(meta, meta_path_str).map_err(|err| err.to_string())?;

    let meta_buf = fs::read(meta_path_str).map_err(|e| e.to_string())?;
    zip_writer
        .start_file("meta.json", options)
        .map_err(|e| e.to_string())?;
    zip_writer.write_all(&meta_buf).map_err(|e| e.to_string())?;

    let duckdb_path = new_duckdb_temp_path();
    let data_path = duckdb_path.to_str().unwrap();
    save_data(data, data_path).map_err(|err| err.to_string())?;

    let data_buf = fs::read(&duckdb_path).map_err(|e| e.to_string())?;
    zip_writer
        .start_file("data.duckdb", options)
        .map_err(|e| e.to_string())?;
    zip_writer.write_all(&data_buf).map_err(|e| e.to_string())?;

    std::fs::remove_file(&duckdb_path).map_err(|e| e.to_string())?;

    zip_writer.finish().map_err(|e| e.to_string())?;

    Ok(())
}

pub fn save_meta(meta: &StoredSheetMeta, path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let json = serde_json::to_string_pretty(meta)?;
    let mut file = File::create(path)?;
    file.write_all(json.as_bytes())?;
    Ok(())
}

pub fn save_data(data: &StoredSheetData, path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut conn = Connection::open(path)?;
    // 如果該 path 之前已經存在 cells table，先清掉
    conn.execute("Drop Table If Exists cells", [])?;
    // 新增 cells
    conn.execute(
        "
        Create Table cells (
            row   BigInt  Not Null,
            col   BigInt  Not Null,
            type  TEXT    Not Null,
            value TEXT    Not Null,
            other_payload JSON,
            Primary Key (row, col),
        )",
        [],
    )?;

    let tx = conn.transaction()?;
    let mut stmt = tx.prepare(
        "insert into cells (row, col, type, value, other_payload) Values (?, ?, ?, ?, ?);",
    )?;

    // let mut insert_cell = |row: u32, col: u32, cell: &CellContent| -> DResult<()> {
    //     let cell = cell.clone();
    //     let value_str = cell.payload.value.to_string();
    //     let other_payload = json!({
    //         "display_value": cell.payload.display_value,
    //         "display_style_class": cell.payload.display_style_class,
    //         "extra_fields": cell.payload.extra_fields,
    //     });
    //     let other_payload_str = other_payload.to_string();
    //     stmt.execute(params![
    //         row as i64,
    //         col as i64,
    //         cell.cell_type_id,
    //         value_str,
    //         other_payload_str
    //     ])?;
    //     Ok(())
    // };

    let mut rows = Vec::with_capacity(10_000); // 預估筆數

    match data {
        StoredSheetData::SparseMap { cells } => {
            for (&(r, c), cell) in cells.iter() {
                let value_str = cell.payload.value.to_string();
                let other_payload_str = serde_json::to_string(&json!({
                    "display_value": cell.payload.display_value,
                    "display_style_class": cell.payload.display_style_class,
                    "extra_fields": cell.payload.extra_fields,
                }))?;
                rows.push((
                    r as i64,
                    c as i64,
                    cell.cell_type_id.clone(),
                    value_str,
                    other_payload_str,
                ));
            }
        }

        StoredSheetData::Dense2D { rows: dense_rows } => {
            for (r, row) in dense_rows.iter().enumerate() {
                for (c, cell_opt) in row.iter().enumerate() {
                    if let Some(cell) = cell_opt {
                        let value_str = cell.payload.value.to_string();
                        let other_payload_str = serde_json::to_string(&json!({
                            "display_value": cell.payload.display_value,
                            "display_style_class": cell.payload.display_style_class,
                            "extra_fields": cell.payload.extra_fields,
                        }))?;

                        rows.push((
                            r as i64,
                            c as i64,
                            cell.cell_type_id.clone(),
                            value_str,
                            other_payload_str,
                        ));
                    }
                }
            }
        }
    }

    // 實際 insert（避免中間 clone/json!）
    for (r, c, ty, value, payload) in rows {
        stmt.execute(params![r, c, ty, value, payload])?;
    }

    tx.commit()?;

    Ok(())
}

/// 產生一個乾淨的 DuckDB 檔案路徑（尚未建立）
pub fn new_duckdb_temp_path() -> PathBuf {
    std::env::temp_dir().join(format!("{}.duckdb", uuid::Uuid::new_v4()))
}


pub fn save_sheet_append_cells(path: &str, cells: Vec<ICell>) 
    -> Result<(), Box<dyn std::error::Error>>
{
    // 步驟 1: 將 DB 從 zip 解壓縮到暫存檔案並更新。
    // 使用一個 block `{}` 來限制 `archive` 的生命週期。
    let db_temp_path = {
        let zip_file = File::open(path)?;
        let mut archive = ZipArchive::new(zip_file)?;
        let mut duckdb_entry = archive.by_name("data.duckdb")?;

        let mut temp_db_file = NamedTempFile::new()?;
        std::io::copy(&mut duckdb_entry, &mut temp_db_file)?;

        // into_temp_path() 會讓暫存檔在 db_path 被 drop 之前一直存在
        let db_path = temp_db_file.into_temp_path();

        // 建立 duck_db 連線並更新資料
        {
            let mut conn = Connection::open(&db_path)?;
            let tx = conn.transaction()?;
            let mut stmt = tx.prepare("insert or replace into cells (row, col, type, value, other_payload) Values (?, ?, ?, ?, ?);")?;
            
            for cell in cells {
                let row = cell.row;
                let col = cell.col;
                let cell = cell.cell_data;
                let value_str = cell.payload.value.to_string();
                let other_payload_str = serde_json::to_string(&json!({
                    "display_value": cell.payload.display_value,
                    "display_style_class": cell.payload.display_style_class,
                    "extra_fields": cell.payload.extra_fields,
                }))?;

                stmt.execute(params![ row, col, cell.cell_type_id, value_str, other_payload_str ])?;
            }  
            tx.commit()?;
            // conn 和 tx 在此 scope 結束時自動 drop，關閉 DB 連線
        }

        // 回傳暫存 DB 的路徑。
        // 此 scope 結束時，`archive` 和 `zip_file` 會被 drop，
        // 進而釋放對原始 zip 檔 (path) 的鎖定。
        db_path 
    };

    // 步驟 2: 建立一個新的暫存 zip 檔，並將更新後的 DB 和其他檔案寫入
    let new_zip_temp_file = NamedTempFile::new()?;
    {
        let mut zip_writer = ZipWriter::new(&new_zip_temp_file);
        let options = FileOptions::<()>::default()
            .compression_method(zip::CompressionMethod::Stored);
        
        // 重新打開原始 zip 檔以複製其他檔案 (此時已沒有鎖定問題)
        let original_zip_file = File::open(path)?;
        let mut original_archive = ZipArchive::new(original_zip_file)?;

        for i in 0..original_archive.len() {
            let file = original_archive.by_index(i)?;
            if file.name() == "data.duckdb" {
                continue; // 跳過舊的 DB
            }
            // 使用 raw_copy_file 效率更高，避免讀到記憶體中
            zip_writer.raw_copy_file(file)?;
        }

        // 新增更新後的 data.duckdb
        zip_writer.start_file("data.duckdb", options)?;
        let mut updated_db_file = File::open(&db_temp_path)?;
        std::io::copy(&mut updated_db_file, &mut zip_writer)?;
        
        zip_writer.finish()?;
    }

    // 步驟 3: 用新的 zip 檔覆蓋原始檔案
    // 此時原始檔 (path) 沒有被任何東西鎖定，可以安全覆蓋
    std::fs::copy(new_zip_temp_file.path(), path)?;

    // `db_temp_path` 和 `new_zip_temp_file` 在函式結束時被 drop，
    // 其對應的暫存檔會被自動刪除。
    Ok(())
}