use std::collections::HashMap;

use serde::{Deserialize, Serialize};

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
    Flat {
        width: u32,
        height: u32,
        data: Vec<Option<CellContent>>,
    },
    BitmapGrid {
        width: u32,
        height: u32,
        bitmap: Vec<u8>, // bitmap for present cells
        values: Vec<CellContent>,
    }
}
