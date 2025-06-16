use serde::{Serialize, Deserialize};
use serde_json::Value;
use std::{collections::HashMap};

use crate::cell_plugins::cell::CellContent; // 用於儲存稀疏數據

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Sheet {
    pub id: String,
    pub sheet_type: String,
    pub sheet_name: String,
    pub row_count: u32,
    pub col_count: u32,
    pub cell_width: u32,
    pub cell_height: u32,
    pub cells: HashMap<(u32, u32), CellContent>,
    pub fields: HashMap<String, Value>,
}

impl Sheet {
    pub fn new
    (
        id: String,
        sheet_type: String,
        sheet_name: String,
        row_count: u32,
        col_count: u32,
    ) -> Self
    {
        Self { 
            id, 
            sheet_type,
            sheet_name,
            row_count, 
            col_count,
            cell_width: 112,
            cell_height: 44,
            cells: HashMap::new(),
            fields: HashMap::new(),
        }
    }
}