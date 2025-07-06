use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{cell_plugins::cell::CellContent, sheet_plugins::base_sheet::BaseSheet};

#[derive(Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct FrontedSheet {
    #[serde(flatten)]
    pub meta: BaseSheet,

    // string "row,col": eg => "1,1", "100,1001"
    pub cells: Vec<(String, CellContent)>, // ✅ 可直接轉成 Map

    // string "row": eg => "1,0", "100,0"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub row_header: Option<Vec<(String, CellContent)>>,

    // string "col": eg => "0,2", "0,101"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub col_header: Option<Vec<(String, CellContent)>>,
}

