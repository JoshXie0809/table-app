use std::collections::HashMap;

use crate::cell_plugins::cell::{BasePayload, CellContent, CellMeta};

use super::CellPlugin;
use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

pub struct TextCellPlugin;

#[derive(Debug, Deserialize, Serialize, Clone, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct TextCellConfig {
    pub cell_type_id: String,
    pub payload: BasePayload,
}

impl Default for TextCellConfig {
    fn default() -> Self {
        Self {
            cell_type_id: "Text".to_string(),
            payload: BasePayload {
                value: json!(""),
                display_value: None,
                display_style: None,
                extra_fields: None,
            },
        }
    }
}

impl CellPlugin for TextCellPlugin {
    fn get_meta(&self) -> Value {
        let mut map: HashMap<String, Value> = HashMap::new();
        map.insert("has_display_formatter".to_string(), json!(false));
        map.insert("display_style_class".to_string(), json!("cell-plugin-text"));
        json!(map)
    }

    fn get_schema(&self) -> schemars::Schema {
        schema_for!(TextCellConfig)
    }

    fn default_cell_config(&self) -> serde_json::Value {
        json!(TextCellConfig::default())
    }

    fn display_cell(&self, payload: BasePayload) -> String {
        let val = payload.value;
        val.as_str().unwrap_or("").to_string()
    }

    fn from_cell_content(
        &self,
        cell_content: super::cell::CellContent,
    ) -> Result<serde_json::Value, String> {
        let payload = cell_content.payload;
        let cell_type_id = cell_content.cell_type_id;
        Ok(json!(TextCellConfig {
            cell_type_id,
            payload
        }))
    }

    fn to_cell_content(
        &self,
        cell_config: serde_json::Value,
    ) -> Result<super::cell::CellContent, String> {
        let text_cell_config: TextCellConfig =
            serde_json::from_value(cell_config).map_err(|err| err.to_string())?;
        let cell_type_id = text_cell_config.cell_type_id;
        let payload = text_cell_config.payload;
        Ok(CellContent {
            cell_type_id,
            payload,
        })
    }

    fn get_css(&self) -> String {
        include_str!("./style.css")
            .to_string()
    }
}
