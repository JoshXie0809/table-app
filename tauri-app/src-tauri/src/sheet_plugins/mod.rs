use schemars::Schema;

use crate::sheet_plugins::{
    fronted_sheet::FrontedSheet,
    stored_sheet::{StoredSheetData, StoredSheetMeta},
};
pub mod base_sheet;
pub mod fronted_sheet;
pub mod stored_sheet;

pub trait SheetPlugin: Send + Sync {
    // 回傳 Sheet 的型態
    fn get_type_id(&self) -> &str;

    fn get_schema(&self) -> Schema;

    fn to_meta_and_data(
        &self,
        sheet_config: &serde_json::Value,
    ) -> Result<(StoredSheetMeta, StoredSheetData), String>;

    fn from_meta_and_data(
        &self,
        meta: StoredSheetMeta,
        data: StoredSheetData,
    ) -> Result<serde_json::Value, String>;

    fn to_fronted_sheet(&self, sheet_config: &serde_json::Value, sheet_path: String) -> Result<FrontedSheet, String>;
}

pub mod default_grid_sheet; // 主要使用的標準網格 Sheet 實現
pub mod registry; // SheetPluginRegistry
