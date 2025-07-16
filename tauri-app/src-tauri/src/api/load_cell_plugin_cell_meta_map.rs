use crate::{api::base::ApiResponse, cell_plugins::{cell::CellMeta, registry::CellPluginRegistry}};
use serde::Serialize;
use std::{collections::HashMap, sync::Arc};
use tauri::{command, State};
use ts_rs::TS;

#[command]
pub fn load_cell_plugin_cell_meta_map(
    state: State<'_, Arc<CellPluginRegistry>>,
) -> ApiResponse<HashMap<String, CellMeta>> {
    let cell_meta_map = state.get_all_cell_meta();
    ApiResponse {
        success: true,
        data: Some(cell_meta_map),
        error: None,
    }
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct CellMetaMap(HashMap<String, CellMeta>);
