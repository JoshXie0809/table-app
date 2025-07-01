use schemars::Schema;

pub mod base_sheet;

pub trait SheetPlugin: Send + Sync {
    // 回傳 Sheet 的型態
    fn get_type_id(&self) -> &str;

    fn get_schema(&self) -> Schema;

}

pub mod default_grid_sheet; // 主要使用的標準網格 Sheet 實現
pub mod registry;          // SheetPluginRegistry