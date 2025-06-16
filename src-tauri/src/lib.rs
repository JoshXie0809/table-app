use std::{ sync::Arc};

use crate::{cell_plugins::{registry::CellPluginRegistry}, sheet_plugins::registry::SheetPluginRegistry};

mod cell_plugins;
mod sheet_plugins;
mod my_api;


use crate::my_api::load_sheet_data::load_sheet_data;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let registry_cell: Arc<CellPluginRegistry> = Arc::new(CellPluginRegistry::new());
    let registry_sheet: Arc<SheetPluginRegistry> = Arc::new(SheetPluginRegistry::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(registry_cell)
        .manage(registry_sheet)
        .invoke_handler(tauri::generate_handler![
            load_sheet_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
