use std::{collections::HashMap, sync::Arc};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::State;
use ts_rs::TS;

use crate::cell_plugins::{cell::CellContent, registry::CellPluginRegistry};
use super::base::ApiResponse;


#[tauri::command]
pub fn load_sheet(arg: LoadSheetRequest, state: State::<'_, Arc<CellPluginRegistry>>) 
    -> ApiResponse<FrontedSheetData> 
{
    let _ = arg.sheet_name; // 正常流程要到資料庫尋找資料

    let plugin = state.get_plugin("Text");
    let plugin = match plugin {
        Some(p) => p,
        None => return ApiResponse{
            success: false, 
            data: None,
            error: Some("can not get Text plugin".to_string()) 
        }
    };

    let sheet_type: String = "DefaultGrid".to_string();
    let sheet_name: String = "hello world".to_string();

    let row_count: u32 = 1280;
    let col_count: u32 = 128;
    let cell_width: u32 = 112;
    let cell_height: u32 =  44;
    let mut cells: Vec<ICell> = vec![];
    let fields = HashMap::new();


    for r in 0..200_u32 {
        for c in 0..100_u32 {
            if (r + c) % 1 == 0 {

                let pl = plugin.default_payload();
                let mut pl = match pl {
                    Ok(bp) => bp,
                    Err(err) => return ApiResponse {
                        success: false,
                        data: None,
                        error: Some(err),
                    },
                };

                pl.value = json!(format!("mock r: {}, c: {} ⚡⚡", r, c));
                let cell = CellContent {
                    cell_type_id: "Text".to_string(),
                    payload: pl
                };

                cells.push(ICell { row: r, col: c, cell_data: cell });
            }
        }
    }

    // 先將您準備好的資料組合成一個 FrontedSheetData 實例
    let sheet_data = FrontedSheetData {
        sheet_type,
        sheet_name,
        row_count,
        col_count,
        cell_width,
        cell_height,
        cells,
        fields,
    };

    ApiResponse {success: true, data: Some(sheet_data), error: None}
}


#[derive(Serialize, TS)]
#[serde(rename_all="camelCase")]
#[ts(export)]
pub struct FrontedSheetData 
{
    #[serde(rename = "type")]
    pub sheet_type: String,
    pub sheet_name: String,
    pub row_count: u32,
    pub col_count: u32,
    pub cell_width: u32,
    pub cell_height: u32,
    pub cells: Vec<ICell>,
    #[ts(type = "Record<string, any>")]
    pub fields: HashMap<String, Value>,
}

#[derive(Deserialize, Serialize, TS)]
#[serde(rename_all="camelCase")]
pub struct ICell {
    pub row: u32,
    pub col: u32,
    pub cell_data: CellContent
}


#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct LoadSheetRequest {
    pub sheet_name: String,
}