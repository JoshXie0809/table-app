use crate::{api::base::ApiResponse, cell_plugins::registry::CellPluginRegistry};
use serde::Serialize;
use std::{collections::HashMap, sync::Arc};
use tauri::{command, State};
use ts_rs::TS;

#[command]
pub fn load_cell_plugin_css_map(
    state: State<'_, Arc<CellPluginRegistry>>,
) -> ApiResponse<HashMap<String, String>> {
    let css_map = state.get_all_css();
    ApiResponse {
        success: true,
        data: Some(css_map),
        error: None,
    }
}

#[derive(Serialize, TS)]
#[ts(export)]
#[ts(type = "Record<string, string>")]
pub struct CssMap(HashMap<String, String>);
