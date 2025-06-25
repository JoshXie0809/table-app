use std::sync::Arc;

use serde::{Deserialize, Serialize};
use tauri::{command, State};
use ts_rs::TS;

use crate::{api::{base::ApiResponse, load_sheet::ICell}, cell_plugins::registry::CellPluginRegistry};

#[command]
pub fn get_display_value(arg: GetDisplayValueRequest, state: State::<'_, Arc<CellPluginRegistry>>) 
    -> ApiResponse<DisplayValues>
{
    let cells = arg.cells;
    let mut ret: DisplayValues = DisplayValues(vec![]);

    for cell in cells.into_iter() {
        let c = cell.cell_data;
        let plugin = state.get_plugin(&c.cell_type_id);

        let plugin = match plugin {
            Some(p) => p,
            None => return ApiResponse {
                success: false, 
                data: None, 
                error: Some(format!("r:{}, c:{}, cell-type error", cell.row, cell.col))
            },
        };

        let dv = plugin.display_cell(c.payload);
        ret.0.push(DisplayValue {row: cell.row, col: cell.col, display_value: dv });
    }
    ApiResponse{
            success: true,
            data: Some(ret),
            error: None,
        }
}

#[derive(Deserialize, TS)]
#[serde(rename_all="camelCase")]
#[ts(export)]
pub struct GetDisplayValueRequest {
    cells: Vec<ICell>
}


#[derive(Serialize, TS)]
#[serde(rename_all="camelCase")]
#[ts(export)]
pub struct DisplayValue {
    row: u32,
    col: u32,
    display_value: String
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct DisplayValues(pub Vec<DisplayValue>);


