
use serde::{Deserialize, Serialize};

use std::collections::HashMap;

use crate::{cell_plugins::cell::CellContent, sheet_plugins::base_sheet::BaseSheet};

#[derive(Debug, Serialize, Deserialize)]
pub struct StoredSheetMeta {
    pub plugin_type: &'static str,
    pub sheet_meta: BaseSheet,
    pub data_format: &'static str,
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

