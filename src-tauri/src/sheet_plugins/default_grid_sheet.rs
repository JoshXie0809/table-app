use std::collections::HashMap;

use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{cell_plugins::cell::CellContent, sheet_plugins::{base_sheet::BaseSheet, fronted_sheet::FrontedSheet, stored_sheet::{StoredSheetData, StoredSheetMeta}, SheetPlugin}};

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
            -> Result<(super::stored_sheet::StoredSheetMeta, super::stored_sheet::StoredSheetData), String> 
    {
        // 把 sheet_config 還原成 DefaultGridSheetConfig
        let dgs_config: DefaultGridSheetConfig = 
            serde_json::from_value(sheet_config.clone()).map_err(|err| err.to_string())?;
        
        let sheet_meta = dgs_config.meta;
        let stored_meta = StoredSheetMeta { 
            plugin_type: "SheetPlugin".to_string(),
            sheet_meta,
            data_format: "SparseMap".to_string(),
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

    fn from_meta_and_data(&self, meta: StoredSheetMeta, data: StoredSheetData)
            -> Result<serde_json::Value, String> 
    {

        let meta = meta.sheet_meta;
        let stored_cells = 
        match data {
            StoredSheetData::SparseMap { cells } => 
                cells,
            _ =>  return Err("the DefaultGridSheet needs SparseMap format".to_string())
        };

        let mut cells: HashMap<String, CellContent> = HashMap::new();

        for ((row, col), cell_content) in stored_cells.into_iter() {
            let key = Self::to_key(row, col);
            cells.insert(key, cell_content);
        }

        let dgs_config = DefaultGridSheetConfig {
            meta,
            cells
        };

        let dgs_value = json!(dgs_config);
        
        Ok(dgs_value)
    }

    fn to_fronted_sheet(&self, sheet_config: &serde_json::Value) 
        -> Result<super::fronted_sheet::FrontedSheet, String> 
    {
        
        let dgs_config: DefaultGridSheetConfig = serde_json::from_value(sheet_config.clone())
            .map_err(|err| err.to_string())?;

        let meta = dgs_config.meta;
        let mut cells = vec![];
        
        for (k, v) in dgs_config.cells.into_iter()
        {
            cells.push((k, v));
        }

        let fronted_sheet = FrontedSheet {
            meta,
            cells,
            row_header: None,
            col_header: None,
        };

        Ok(fronted_sheet)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
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
    use crate::io::loader::load_zip_file;
    use crate::io::saver::save_to_zip_file;
    use crate::sheet_plugins::base_sheet::BaseSheet;

    #[test]
    fn test_default_grid_plugin_to_file() 
        -> Result<(), String>
    {

        let tcp = TextCellPlugin;
        
        let cell_config = tcp.default_cell_config();
        let mut cell_content = tcp.to_cell_content(cell_config)?;
        let default_cell_content = cell_content.clone();

        cell_content.payload.value = json!("aaa-12345");



        // 1. 準備一個 plugin config
        let config = DefaultGridSheetConfig {
            meta: BaseSheet {
                sheet_id: "sheet1".to_string(),
                sheet_type: "DefaultGridSheet".to_string(),
                sheet_name: "測試用".to_string(),
                has_col_header: false,
                has_row_header: false,
                row_count: 1024,
                col_count: 64,
                cell_width: 160,
                cell_height: 52,
                default_cell_content: default_cell_content,
            },
            cells: {
                let mut map = HashMap::new();
                for r in 0..1000_u32 {
                    for c in 0..5_u32 {
                        let k = format!("{},{}", r, c);
                        let v = format!("aaa-{}", k);
                        cell_content.payload.value = json!(v);
                        map.insert(k, cell_content.clone());
                    }
                }
                map
            },
        };

        // default grid sheet plugin
        let dgsp = DefaultGridSheet;
        let config_json = json!(config);
        let (meta, data) = dgsp.to_meta_and_data(&config_json)?;

        // // 測試 save_meta 和 save_date
        // let path = "./test_meta.json";
        // save_meta(&meta, &path).map_err(|err| err.to_string())?;
        // let path = "./test_data.duckdb";
        // save_data(&data, &path).map_err(|err| err.to_string())?;

        // 測試 save_to_zip_file
        let path = "./test.sheetpkg.zip";
        save_to_zip_file(&meta, &data, path)?;
        
        Ok(())
    }

    #[test]
    fn test_from_meta_and_data() 
        -> Result<(), String>
    {
        let dgs = DefaultGridSheet;
        let (meta, data) = load_zip_file("./test.sheetpkg.zip")?;
        let sheet_config = dgs.from_meta_and_data(meta, data)?;
        println!("{:#?}", sheet_config);
        let (meta, data) = dgs.to_meta_and_data(&sheet_config)?;
        println!("{:#?}, {:#?}", meta, data); 
        Ok(())
    }

}
