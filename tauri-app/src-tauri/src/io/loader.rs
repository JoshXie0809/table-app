use std::{collections::HashMap};

use duckdb::Connection;
use serde_json::Value;

use crate::{
    cell_plugins::cell::{BasePayload, CellContent},
    sheet_plugins::stored_sheet::{StoredSheetData, StoredSheetMeta},
};

pub fn load_zip_file(path: &str) -> Result<(StoredSheetMeta, StoredSheetData), String> {
    let meta = load_meta_of_file(path)?;
    let data = load_data_of_file(path, &meta)?;

    Ok((meta, data))
}

pub fn load_meta_of_file(path: &str) -> Result<StoredSheetMeta, String> {
    let meta_path = std::path::Path::new(path).join("meta.json");    
    // 讀取檔案內容
    let meta_json_str = std::fs::read_to_string(&meta_path)
        .map_err(|e| format!("Failed to read meta.json: {}", e))?;
    let meta: StoredSheetMeta =
        serde_json::from_str(&meta_json_str).map_err(|err| err.to_string())?;
    Ok(meta)
}

pub fn load_data_of_file(
    path: &str,
    meta: &StoredSheetMeta,
) -> Result<StoredSheetData, String> {
    // 1. 直接拼接 Fake Extension 資料夾內的 data.duckdb 路徑
    let db_path = std::path::Path::new(path).join("data.duckdb");

    // 建立 duck_db 連線
    let mut conn = Connection::open(&db_path).map_err(|err| err.to_string())?;

    let tx = conn.transaction().map_err(|err| err.to_string())?;
    let mut stmt = tx
        .prepare("select * from cells;")
        .map_err(|err| err.to_string())?;

    let mut db_rows = stmt.query([]).map_err(|err| err.to_string())?;

    let data_format = meta.data_format.as_str();

    let data = match data_format {
        "SparseMap" => {
            let mut cells: HashMap<(u32, u32), CellContent> = HashMap::new();

            while let Ok(Some(row)) = db_rows.next() {
                let row_index: u32 = row.get(0).map_err(|err| err.to_string())?;
                let col_index: u32 = row.get(1).map_err(|err| err.to_string())?;
                let cell_type_id: String = row.get(2).map_err(|err| err.to_string())?;
                let value_str: String = row.get(3).map_err(|err| err.to_string())?;
                let other_payload_str: String = row.get(4).map_err(|err| err.to_string())?;

                let payload = parse_payload(&value_str, &other_payload_str)?;
                let cell_content = CellContent {
                    cell_type_id,
                    payload,
                };

                cells.insert((row_index, col_index), cell_content);
            }

            StoredSheetData::SparseMap { cells }
        }

        "Dense2D" => {
            let row_count = meta.sheet_meta.row_count as usize;
            let col_count = meta.sheet_meta.col_count as usize;

            let mut rows: Vec<Vec<Option<CellContent>>> = vec![vec![None; col_count]; row_count];

            while let Ok(Some(row)) = db_rows.next() {
                let row_index: u32 = row.get(0).map_err(|err| err.to_string())?;
                let col_index: u32 = row.get(1).map_err(|err| err.to_string())?;
                let cell_type_id: String = row.get(2).map_err(|err| err.to_string())?;
                let value_str: String = row.get(3).map_err(|err| err.to_string())?;
                let other_payload_str: String = row.get(4).map_err(|err| err.to_string())?;

                let payload = parse_payload(&value_str, &other_payload_str)?;
                let cell_content = CellContent {
                    cell_type_id,
                    payload,
                };

                rows[row_index as usize][col_index as usize] = Some(cell_content);
            }

            StoredSheetData::Dense2D { rows }
        }
        _ => {
            return Err("error! cannot find this data_format at load_data_of_zip_file".to_string())
        }
    };

    // 提早關閉連線，這樣才可以讓 temp file 順利刪除
    let _ = tx;
    let _ = conn;

    Ok(data)
}

#[cfg(test)]
mod tests {
    use crate::io::loader::load_zip_file;

    #[test]
    fn read_file() -> Result<(), String> {
        let (meta, data) = load_zip_file("./test.sheetpkg")?;

        println!("{:#?}", meta);
        println!("{:#?}", data);
        Ok(())
    }
}

fn parse_payload(value_str: &str, other_payload_str: &str) -> Result<BasePayload, String> {
    let value: Value =
        serde_json::from_str(value_str).map_err(|e| format!("value parse error: {}", e))?;

    let obj: Value = serde_json::from_str(other_payload_str)
        .map_err(|e| format!("other_payload parse error: {}", e))?;

    let display_value = obj
        .get("display_value")
        .cloned()
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    let display_style_class = obj
        .get("display_style_class")
        .cloned()
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    let extra_fields = obj
        .get("extra_fields")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    Ok(BasePayload {
        value,
        display_value,
        display_style_class,
        extra_fields,
    })
}
