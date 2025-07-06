use std::sync::Arc;

use serde::{Deserialize, Serialize};
use tauri::State;
use ts_rs::TS;

use super::base::ApiResponse;
use crate::{
    // cell_plugins::{cell::CellContent, registry::CellPluginRegistry},
    cell_plugins::cell::CellContent,
    io::loader::load_zip_file,
    sheet_plugins::{fronted_sheet::FrontedSheet, registry::SheetPluginRegistry},
};

#[tauri::command]
pub fn load_sheet(
    arg: LoadSheetRequest,
    registry: State<'_, Arc<SheetPluginRegistry>>,
) -> ApiResponse<FrontedSheet> {
    load_sheet_inner(arg.sheet_name, &*registry)
}

pub fn load_sheet_inner(
    sheet_name: String,
    registry: &SheetPluginRegistry,
) -> ApiResponse<FrontedSheet> {
    
    let load_result = load_zip_file(&sheet_name);

    let (meta, data) = match load_result {
        Ok(m_and_d) => m_and_d,
        Err(err) => {
            return ApiResponse {
                success: false,
                data: None,
                error: Some(err),
            }
        }
    };

    let sheet_plugin = match registry.get_plugin(&meta.sheet_meta.sheet_type) {
        Some(p) => p,
        None => {
            return ApiResponse {
                success: false,
                data: None,
                error: Some("meta-error, the plugin-type of sheet does not exist.".to_string()),
            }
        }
    };

    let sheet_config = match sheet_plugin.from_meta_and_data(meta, data) {
        Ok(cfg) => cfg,
        Err(err) => {
            return ApiResponse {
                success: false,
                data: None,
                error: Some(err),
            }
        }
    };

    let fronted_sheet = match sheet_plugin.to_fronted_sheet(&sheet_config) {
        Ok(fs) => fs,
        Err(err) => {
            return ApiResponse {
                success: false,
                data: None,
                error: Some(err),
            }
        }
    };

    ApiResponse {
        success: true,
        data: Some(fronted_sheet),
        error: None,
    }
}

#[derive(Deserialize, Serialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct ICell {
    pub row: u32,
    pub col: u32,
    pub cell_data: CellContent,
}

#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct LoadSheetRequest {
    pub sheet_name: String,
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use crate::{api::load_sheet::load_sheet_inner, sheet_plugins::registry::SheetPluginRegistry};

    #[test]
    fn test_load_sheet() {
        // 模擬 sheet registry
        let registry_sheet: Arc<SheetPluginRegistry> = Arc::new(SheetPluginRegistry::new());

        let sheet_name = "test test".to_string();

        let fronted_sheet = load_sheet_inner(sheet_name, &registry_sheet);

        println!("{:#?}", fronted_sheet);
    }
}
