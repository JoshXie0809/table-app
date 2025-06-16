use crate::{cell_plugins::cell::CellContent, sheet_plugins::sheet::Sheet};

mod sheet;

pub trait SheetPlugin: Send + Sync {
    fn get_type_id(&self) -> &str;
    fn get_display_name(&self) -> &str;
    fn get_sheet_size(&self, sheet: &Sheet) -> (u32, u32); // nRow, nCol
    fn get_cell_content(&self, sheet: &Sheet, row: u32, col: u32) -> Option<CellContent>;
    fn get_column_header(&self, sheet: &Sheet, col: u32) -> String;
    fn get_row_header(&self, sheet: &Sheet, row: u32) -> String;
}


pub mod default_grid_sheet; // 主要使用的標準網格 Sheet 實現
pub mod registry;          // SheetPluginRegistry