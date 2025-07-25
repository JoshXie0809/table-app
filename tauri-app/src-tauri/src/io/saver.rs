use duckdb::{params, Connection};
use serde_json::json;
use std::{
    fs::{self, File},
    io::Write,
    path::{Path, PathBuf},
};

use crate::{
    api::load_sheet::ICell, sheet_plugins::stored_sheet::{StoredSheetData, StoredSheetMeta}
};

pub fn save_to_fake_extension(
    meta: &StoredSheetMeta,
    data: &StoredSheetData,
    path: &str,
) -> Result<(), String> {

    let dir_path = Path::new(path);

    // 1. 建立資料夾 (Fake Extension)
    if !dir_path.exists() {
        fs::create_dir_all(dir_path).map_err(|e| e.to_string())?;
    }

    // 2. 存 meta.json
    let meta_path = dir_path.join("meta.json");
    save_meta(meta, meta_path.to_str().unwrap()).map_err(|e| e.to_string())?;

    // 3. 存 data.duckdb
    let data_path = dir_path.join("data.duckdb");
    save_data(data, data_path.to_str().unwrap()).map_err(|e| e.to_string())?;

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

pub fn save_sheet_append_cells(
    path: &str,                  // Fake Extension 資料夾路徑
    cells: Vec<ICell>
) -> Result<(), Box<dyn std::error::Error>> {
    // 直接組合 data.duckdb 的完整路徑
    let db_path = std::path::Path::new(path).join("data.duckdb");

    // 直接連線到該 DuckDB 檔案
    let mut conn = Connection::open(&db_path)?;
    let tx = conn.transaction()?;

    let mut stmt = tx.prepare(
        "INSERT OR REPLACE INTO cells 
         (row, col, type, value, other_payload) 
         VALUES (?, ?, ?, ?, ?);"
    )?;

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
    conn.execute_batch("CHECKPOINT;")?; // 確保資料寫回檔案

    Ok(())
}
