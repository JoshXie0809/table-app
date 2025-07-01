use std::{ sync::Arc};

use crate::{cell_plugins::{registry::CellPluginRegistry}, sheet_plugins::registry::SheetPluginRegistry};

mod cell_plugins;
mod sheet_plugins;
mod api;
pub mod export_types;
pub mod export_json_schema;

use crate::api::load_sheet::load_sheet;
use crate::api::load_cell_plugin_css_map::load_cell_plugin_css_map;
use crate::api::get_display_value::get_display_value;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let registry_cell: Arc<CellPluginRegistry> = Arc::new(CellPluginRegistry::new());
    let registry_sheet: Arc<SheetPluginRegistry> = Arc::new(SheetPluginRegistry::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(registry_cell)
        .manage(registry_sheet)
        .invoke_handler(tauri::generate_handler![
            load_sheet, 
            load_cell_plugin_css_map,
            get_display_value,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
