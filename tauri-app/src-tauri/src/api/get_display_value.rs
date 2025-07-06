use std::sync::Arc;

use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use ts_rs::TS;

use crate::{
    api::{base::ApiResponse, load_sheet::ICell},
    cell_plugins::registry::CellPluginRegistry,
};

#[command]
pub fn get_display_value(
    arg: GetDisplayValueRequest,
    state: State<'_, Arc<CellPluginRegistry>>,
) -> ApiResponse<DisplayCellResults> {
    let plugin_registry = state.clone();

    let results: Vec<DisplayCellResult> = arg
        .cells
        .into_par_iter()
        .map(|cell| {
            let cell_data = &cell.cell_data;
            match plugin_registry.get_plugin(&cell_data.cell_type_id) {
                Some(plugin) => {
                    let display = plugin.display_cell(cell_data.payload.clone());
                    DisplayCellResult {
                        row: cell.row,
                        col: cell.col,
                        ok: true,
                        display_value: Some(display),
                        error: None,
                    }
                }
                None => DisplayCellResult {
                    row: cell.row,
                    col: cell.col,
                    ok: false,
                    display_value: None,
                    error: Some(format!(
                        "r:{}, c:{}, unknown plugin `{}`",
                        cell.row, cell.col, cell_data.cell_type_id
                    )),
                },
            }
        })
        .collect();

    ApiResponse {
        success: true,
        data: Some(DisplayCellResults(results)),
        error: None,
    }
}

#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct GetDisplayValueRequest {
    cells: Vec<ICell>,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct DisplayCellResult {
    pub row: u32,
    pub col: u32,
    pub ok: bool,
    pub display_value: Option<String>,
    pub error: Option<String>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct DisplayCellResults(pub Vec<DisplayCellResult>);
