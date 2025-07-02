use std::collections::HashMap;

use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};

use crate::{cell_plugins::cell::CellContent, sheet_plugins::{base_sheet::BaseSheet, stored_sheet::{StoredSheetData, StoredSheetMeta}, SheetPlugin}};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DefaultGridSheetConfig {
    #[serde(flatten)]
    pub meta: BaseSheet,
    pub cells: HashMap<String, CellContent>,
}


pub struct DefaultGridSheet;

impl DefaultGridSheet {
    fn to_key(row: u32, col: u32) -> String {
        format!("{row},{col}")
    }

    /// 將 "2,3" 拆成 (2, 3)
    fn to_rc(key: &str) -> Result<(u32, u32), String> {
        let (row_str, col_str) = key
            .split_once(',')
            .ok_or_else(|| format!("Invalid key format: {}", key))?;

        let row = row_str
            .parse::<u32>()
            .map_err(|e| format!("Invalid row: {e}"))?;

        let col = col_str
            .parse::<u32>()
            .map_err(|e| format!("Invalid col: {e}"))?;

        Ok((row, col))
    }
}


impl SheetPlugin for DefaultGridSheet {
    fn get_type_id(&self) -> &str {
        "DefaultGridSheet"
    }

    fn get_schema(&self) -> schemars::Schema {
        schema_for!(DefaultGridSheetConfig)
    }

    fn to_meta_and_data(&self, sheet_config: &serde_json::Value) 
            -> Result<(super::stored_sheet::StoredSheetMeta, super::stored_sheet::StoredSheetData), String> {

        // 把 sheet_config 還原成 DefaultGridSheetConfig
        let dgs_config: DefaultGridSheetConfig = serde_json::from_value(sheet_config.clone()).map_err(|err| err.to_string())?;
        
        let meta = dgs_config.meta;
        let stored_meta = StoredSheetMeta { 
            plugin_type: "DefaultGridSheet".to_string(),
            sheet_meta: meta,
        };

        
        let mut cells = HashMap::new();
        let cells_string  = dgs_config.cells;
        for (k, v) in cells_string {
            let key = DefaultGridSheet::to_rc(&k)?;
            cells.insert(key, v);
        }

        let sp_map: StoredSheetData = StoredSheetData::SparseMap { cells };


        Ok((stored_meta, sp_map))        
        
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use duckdb::ffi::duckdb_query;
    use schemars::schema_for;
    use serde_json::json;

    #[test]
    fn test_get_schema() {
        let schema = schema_for!(DefaultGridSheetConfig); 
        println!("{}", serde_json::to_string_pretty(&schema).unwrap());
        
    }

    use std::collections::HashMap;
    use crate::cell_plugins::text_cell::TextCellPlugin;
    use crate::cell_plugins::CellPlugin;
    use crate::sheet_plugins::base_sheet::BaseSheet;
    use crate::sheet_plugins::stored_sheet::{save_data, save_meta};

    #[test]
    fn test_default_grid_plugin_to_fronted_sheet() 
        -> Result<(), String>
    {

        let tcp = TextCellPlugin;
        let mut payload = tcp.default_payload().unwrap();
        payload.value = json!("aaa");
        
        let cell_content = CellContent {
            cell_type_id: "Text".to_string(),
            payload,
        };

        // 1. 準備一個 plugin config
        let config = DefaultGridSheetConfig {
            meta: BaseSheet {
                sheet_id: "sheet1".to_string(),
                sheet_type: "DefaultGridSheet".to_string(),
                sheet_name: "測試用".to_string(),
                row_count: 10,
                col_count: 5,
                cell_width: 100,
                cell_height: 40,
            },
            cells: {
                let mut map = HashMap::new();
                map.insert("2,3".to_string(), cell_content.clone());
                map.insert("2,31".to_string(), cell_content.clone());
                map.insert("21,3".to_string(), cell_content.clone());
                map.insert("21,31".to_string(), cell_content.clone());
                map
            },
        };

        // default grid sheet plugin
        let dgsp = DefaultGridSheet;
        let config_json = json!(config);
        let (meta, data) = dgsp.to_meta_and_data(&config_json)?;

        let path = "./test_meta.json";
        // 測試 save_meta
        save_meta(&meta, &path).map_err(|err| err.to_string())?;
        let path = "./test_data.duckdb";
        save_data(&data, &path).map_err(|err| err.to_string())?;
        
        Ok(())
    }

    #[test]
    fn read_db() -> Result<(), String> {
        let conn = duckdb::Connection::open("./test_data.duckdb")
            .map_err(|err| err.to_string())?;
        
        let mut stmt = conn.prepare("select * from cells")
            .map_err(|err| err.to_string())?;

        let mut rows = stmt.query([])
            .map_err(|err| err.to_string())?;
        
        while let Some(row) = rows.next().map_err(|err| err.to_string())? {
            let col_count = 5;    
            let mut values = Vec::new();
            for i in 0..col_count {
                let value: duckdb::types::ValueRef = row.get_ref_unwrap(i);
                values.push(format!("{:?}", value));
            }
            println!("{:?}", values);
        }

        Ok(())
    }
}
