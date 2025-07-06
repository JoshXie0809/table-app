use duckdb::{params, Connection, Result as DResult};
use serde_json::json;
use std::{
    fs::{self, File},
    io::Write,
    path::PathBuf,
};
use tempfile::NamedTempFile;
use zip::{write::FileOptions, ZipWriter};

use crate::{
    cell_plugins::cell::CellContent,
    sheet_plugins::stored_sheet::{StoredSheetData, StoredSheetMeta},
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

    let mut insert_cell = |row: u32, col: u32, cell: &CellContent| -> DResult<()> {
        let cell = cell.clone();
        let value_str = cell.payload.value.to_string();

        let other_payload = json!({
            "display_value": cell.payload.display_value,
            "display_style": cell.payload.display_style,
            "extra_fields": cell.payload.extra_fields,
        });

        let other_payload_str = other_payload.to_string();

        stmt.execute(params![
            row as i64,
            col as i64,
            cell.cell_type_id,
            value_str,
            other_payload_str
        ])?;

        Ok(())
    };

    let mut rows = Vec::with_capacity(100_000); // 預估筆數

    match data {
        StoredSheetData::SparseMap { cells } => {
            for (&(r, c), cell) in cells.iter() {
                let value_str = cell.payload.value.to_string();
                let other_payload_str = serde_json::to_string(&json!({
                    "display_value": cell.payload.display_value,
                    "display_style": cell.payload.display_style,
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
                            "display_style": cell.payload.display_style,
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
