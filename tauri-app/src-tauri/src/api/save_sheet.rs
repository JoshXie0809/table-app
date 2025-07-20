use serde::Deserialize;
use tauri::command;
use ts_rs::TS;
use crate::{api::{base::ApiResponse, load_sheet::ICell}, io::saver::save_sheet_append_cells};

#[command]
pub fn save_sheet(
    arg: SaveSheetRequest,
) 
    -> ApiResponse<String>
{
    // 前端傳入需要更新的 cells
    let cells = arg.cells;
    let path = arg.sheet_path;
    let result = save_sheet_append_cells(&path, cells).map_err(|err| err.to_string());
    match result {
        Ok(()) => ApiResponse { success: true, data: None, error: None },
        Err(err) => ApiResponse { success: false, data: None, error: Some(err) },
    }
}

#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SaveSheetRequest {
    pub sheet_path: String,
    pub cells: Vec<ICell>,
}