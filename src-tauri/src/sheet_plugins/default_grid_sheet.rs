use std::collections::HashMap;

use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};

use crate::{cell_plugins::cell::CellContent, sheet_plugins::{base_sheet::BaseSheet, SheetPlugin}};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DefaultGridSheetConfig {
    #[serde(flatten)]
    pub base: BaseSheet,
    pub cells: HashMap<String, CellContent>,
}


pub struct DefaultGridSheet;

impl SheetPlugin for DefaultGridSheet {
    fn get_type_id(&self) -> &str {
        "DefaultGridSheet"
    }

    fn get_schema(&self) -> schemars::Schema {
        schema_for!(DefaultGridSheetConfig)
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
    use std::fs::File;
    use std::io::Write;
    use crate::cell_plugins::text_cell::TextCellPlugin;
    use crate::cell_plugins::CellPlugin;
    use crate::sheet_plugins::base_sheet::BaseSheet;
    use crate::sheet_plugins::stored_sheet::StoredSheet;

    #[test]
    fn test_default_grid_plugin_to_fronted_sheet() {

        let tcp = TextCellPlugin;
        let mut payload = tcp.default_payload().unwrap();
        payload.value = json!("12345");
        
        let cell_content = CellContent {
            cell_type_id: "Text".to_string(),
            payload,
        };

        // 1. 準備一個 plugin config
        let config = DefaultGridSheetConfig {
            base: BaseSheet {
                sheet_id: "sheet1".to_string(),
                sheet_type: "DefaultGridSheet".to_string(),
                sheet_name: "測試用".to_string(),
                sheet_size: [10, 5],
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
                map.insert("23,33".to_string(), cell_content);
                map
            },
        };

        // 2. 將 config 轉成 StoredSheet
        let stored = StoredSheet {
            plugin_type: "DefaultGridSheet".to_string(),
            raw_config: serde_json::to_value(&config).unwrap(),
        };


        let json = serde_json::to_string_pretty(&stored).expect("Failed to serialize stored sheet");
        let mut file = File::create("my_sheet.json").expect("Failed to create file");
        file.write_all(json.as_bytes()).expect("Failed to write to file");



        // // 3. 準備 plugin
        // let plugin = DefaultGridSheet;

        // // 4. 驗證 raw_config 合法（schema 驗證）
        // let schema = plugin.get_schema();
        // let compiled = JsonSchema::compile(&schema.schema).unwrap();
        // assert!(compiled.is_valid(&stored.raw_config));

        // // 5. 組成 FrontedSheet
        // let fronted = FrontedSheet {
        //     plugin_type: plugin.get_type_id().to_string(),
        //     plugin_schema: schema,
        //     config: stored.raw_config.clone(),
        // };

        // // 6. 驗證結果正確
        // assert_eq!(fronted.plugin_type, "DefaultGridSheet");
        // assert!(fronted.config["cells"].get("2,3").is_some());
    }
}
