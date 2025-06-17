use std::{collections::HashMap, sync::Arc};

use serde::Serialize;
use serde_json::{json, Value};
use tauri::State;

use crate::cell_plugins::{cell::CellContent, registry::CellPluginRegistry};

#[tauri::command]
pub async fn load_sheet_data(sheet_name: String, state: State::<'_, Arc<CellPluginRegistry>>) 
    -> Result<FrontedSheetData, String> 
{

    let _ = sheet_name; // 正常流程要到資料庫尋找資料

    let plugin = state.get_plugin("Text");
    let plugin = match plugin {
        Some(p) => p,
        None => return Err("can not get Text plugin".to_string())
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
            if (r + c) % 37 == 0 {
                let mut pl = plugin.default_payload()?;
                pl.value = json!(format!("模擬數據 r: {}, c: {}", r, c));
                
                let cell = CellContent {
                    cell_type_id: "Text".to_string(),
                    payload: pl
                };

                cells.push(ICell { row: r, col: c, cell_data: cell });
            }
        }
    }

    Ok(
        FrontedSheetData {
            sheet_type,
            sheet_name,
            row_count,
            col_count,
            cell_width,
            cell_height,
            cells,
            fields,
        }
    )
}


#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
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
    pub fields: HashMap<String, Value>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct ICell {
    row: u32,
    col: u32,
    cell_data: CellContent
}