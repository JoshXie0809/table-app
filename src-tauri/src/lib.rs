use std::{ sync::Arc};

use tauri::{Manager};

use crate::{cell_plugins::{registry::{ CellPluginRegistry}, rendering_config::DrawingCommand}, fronted_args::CellRenderRequest};

mod cell_plugins;
mod fronted_args;

#[tauri::command]
async fn get_cell_render_data( // 注意這裡的 async
    app_handle: tauri::AppHandle, // 使用 AppHandle 訪問狀態
    request: CellRenderRequest,
) -> Result<DrawingCommand, String> {
    let registry = app_handle.try_state::<Arc<CellPluginRegistry>>();
    let registry = match registry {
        Some(state) => state,
        None => return Err(format!("cannot get Cell-Plugin"))
    };

    let cell_plugin = registry.get_plugin(&request.cell_data.cell_type_id); 
    let cell_plugin = match cell_plugin {
        Some(cplg) => cplg,
        None => return Err(format!("Cell-Type Error, Cannot find this Type"))
    };

    let res = cell_plugin.render_cell(
        request.row_index, request.col_index,
        request.x, request.y,
        request.width, request.height,
        &request.cell_data.payload,
    )?;

    Ok(res)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let registry = Arc::new(CellPluginRegistry::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(registry)
        .invoke_handler(tauri::generate_handler![
            get_cell_render_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
