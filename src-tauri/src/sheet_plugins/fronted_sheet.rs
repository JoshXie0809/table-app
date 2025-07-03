use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{cell_plugins::cell::CellContent, sheet_plugins::base_sheet::BaseSheet};

#[derive(Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct FrontedSheet {
    #[serde(flatten)]
    meta: BaseSheet,
    // (row: u32, col: u32) => "row,col"
    cells: HashMap<String, CellContent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    // (row: u32) => "row"
    row_header: Option<HashMap<String, CellContent>>, 
    
    #[serde(skip_serializing_if = "Option::is_none")]
    // (col: u32) => "col"
    col_header: Option<HashMap<String, CellContent>>,
}