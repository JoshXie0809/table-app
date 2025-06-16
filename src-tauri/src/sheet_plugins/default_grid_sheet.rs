use crate::{cell_plugins::cell::CellContent, sheet_plugins::SheetPlugin};

pub struct DefaultGridSheet;

impl SheetPlugin for DefaultGridSheet {
    fn get_type_id(&self) -> &str {
        "DefaultGrid"
    }

    fn get_display_name(&self) -> &str {
        "DefaultGrid"
    }

    fn get_row_header(&self, _sheet: &super::sheet::Sheet, row: u32) -> String {
        format!("R{}", row)
    }

    fn get_column_header(&self, _sheet: &super::sheet::Sheet, col: u32) -> String {
        format!("C{}", col)
    }

    fn get_cell_content(&self, sheet: &super::sheet::Sheet, row: u32, col: u32) 
        -> Option<CellContent> 
    {
        match sheet.cells.get(&(row, col)) {
            Some(v) => return Some(v.clone()),
            None => return  None,
        };
    }

    fn get_sheet_size(&self, sheet: &super::sheet::Sheet) -> (u32, u32) {
        (sheet.row_count, sheet.col_count)
    }

}