use std::sync::Arc;

use crate::{
    cell_plugins::registry::CellPluginRegistry, sheet_plugins::registry::SheetPluginRegistry,
};

mod cell_plugins;
mod io;
mod sheet_plugins;

mod api;
pub mod export_json_schema;
pub mod export_types;

use crate::api::get_display_value::get_display_value;
use crate::api::load_cell_plugin_css_map::load_cell_plugin_css_map;
use crate::api::load_sheet::load_sheet;
use crate::api::load_cell_plugin_cell_meta_map::load_cell_plugin_cell_meta_map;
use crate::api::save_sheet::save_sheet;
use crate::api::sql::{sql_connect, sql_list_table, sql_table_info, sql_show_all_table};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let registry_cell: Arc<CellPluginRegistry> = Arc::new(CellPluginRegistry::new());
    let registry_sheet: Arc<SheetPluginRegistry> = Arc::new(SheetPluginRegistry::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(registry_cell)
        .manage(registry_sheet)
        .invoke_handler(tauri::generate_handler![
            load_sheet,
            load_cell_plugin_css_map,
            get_display_value,
            load_cell_plugin_cell_meta_map,
            save_sheet,
            sql_connect,
            sql_list_table,
            sql_table_info,
            sql_show_all_table,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
