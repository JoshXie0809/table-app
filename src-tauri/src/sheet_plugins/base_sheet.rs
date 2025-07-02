use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::cell_plugins::cell::CellContent;

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct BaseSheet {
    pub sheet_id: String,
    pub sheet_type: String,
    pub sheet_name: String,
    
    pub has_row_header: bool,
    pub has_col_header: bool,

    pub row_count: u32,
    pub col_count: u32,
    pub cell_width: u32,
    pub cell_height: u32,

    pub default_cell_content: CellContent,
}