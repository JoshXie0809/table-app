use std::{collections::HashMap, fs::File, io::Write};

use serde::{Deserialize, Serialize};

use duckdb::{params, Connection, Result as DResult};
use serde_json::json;

use crate::{cell_plugins::cell::CellContent, sheet_plugins::base_sheet::BaseSheet};

#[derive(Debug, Serialize, Deserialize)]
pub struct StoredSheetMeta {
    pub plugin_type: String,
    pub sheet_meta: BaseSheet,
}


#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "format")]
pub enum StoredSheetData {
    Dense2D {
        rows: Vec<Vec<Option<CellContent>>>,
    },

    SparseMap {
        cells: HashMap<(u32, u32), CellContent>,
    },

}



pub fn save_meta(meta: &StoredSheetMeta, path: &str) 
    -> Result<(), Box<dyn std::error::Error>>
{
    let json = serde_json::to_string_pretty(meta)?;
    let mut file = File::create(path)?;
    file.write_all(json.as_bytes())?;
    Ok(())
}


pub fn save_data(data: &StoredSheetData, path: &str)
    -> DResult<()>
{
    let mut conn = Connection::open(path)?;
    // 如果該 path 之前已經存在 cells table，先清掉
    conn.execute("Drop Table If Exists cells", [])?;
    // 新增 cells
    conn.execute("
        Create Table cells (
            row   BigInt  Not Null,
            col   BigInt  Not Null,
            type  TEXT    Not Null,
            value TEXT    Not Null,
            other_payload JSON,
            Primary Key (row, col),
        )", 
        [])?;

    
    let tx = conn.transaction()?;
    let mut stmt = tx.prepare(
        "insert into cells (row, col, type, value, other_payload) Values (?, ?, ?, ?, ?);"
    )?;

    let mut insert_cell = 
        |row: u32, col: u32, cell: &CellContent| -> DResult<()>
    {
        let cell = cell.clone();
        let value_str = cell.payload.value.to_string();

        let other_payload = json!({
            "display_value": cell.payload.display_value,
            "display_style": cell.payload.display_style,
            "extra_fields": cell.payload.extra_fields,
        });

        let other_payload_str = other_payload.to_string();

        stmt.execute(params![row as i64, col as i64, cell.cell_type_id, value_str, other_payload_str])?;
        Ok(())
    };

    match data {
        StoredSheetData::SparseMap { cells } => {
            for (&(r, c), cell) in cells.iter() {
                insert_cell(r, c, cell)?;
            }
        }

        StoredSheetData::Dense2D { rows } => {
            for (r, row) in rows.iter().enumerate() {
                for (c, cell_opt) in row.iter().enumerate() {
                    if let Some(cell) = cell_opt {
                        insert_cell(r as u32, c as u32, cell)?;
                    }
                }
            }
        }
    }

    tx.commit()?;
    Ok(())
}
