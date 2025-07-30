use std::collections::HashMap;

use crate::cell_plugins::cell::{BasePayload, CellContent};

use super::CellPlugin;
use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

pub struct NumberCellPlugin;

// 產生給前端的 schema
#[derive(Debug, Deserialize, Serialize, Clone, JsonSchema)]
pub struct NumberPayload {
    pub value: f64,
    pub display_value: Option<String>,
    pub display_style_class: Option<String>, // 回傳 css-class    
    pub extra_fields: Option<HashMap<String, Value>>,
}

#[derive(Debug, Deserialize, Serialize, Clone, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct NumberCellConfig {
    #[serde(rename = "type")] // 前端的 key 是 "type"，這裡需要指定
    pub cell_type_id: String,
    pub payload: NumberPayload,
}

impl Default for NumberCellConfig {
    fn default() -> Self {
        Self {
            cell_type_id: "Number".to_string(),
            payload: NumberPayload {
                value: 0.0_f64,
                display_value: None,
                display_style_class: None,
                extra_fields: None,
            },
        }
    }
}

impl CellPlugin for NumberCellPlugin {
    fn get_meta(&self) -> Value {
        let mut map: HashMap<String, Value> = HashMap::new();
        map.insert("has_display_formatter".to_string(), json!(false));
        map.insert("display_style_class".to_string(), json!("cell-plugin-number"));
        map.insert("is_quick_editable".to_string(), json!(true));
        json!(map)
    }

    fn get_schema(&self) -> schemars::Schema {
        schema_for!(NumberCellConfig)
    }

    fn default_cell_config(&self) -> serde_json::Value {
        json!(NumberCellConfig::default())
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
        let number_payload = NumberPayload {
            value: payload.value.as_f64().unwrap_or_default(),
            display_style_class: payload.display_style_class,
            display_value: payload.display_value,
            extra_fields: payload.extra_fields,
        };

        Ok(json!(NumberCellConfig {
            cell_type_id,
            payload: number_payload
        }))
    }

    fn to_cell_content(
        &self,
        cell_config: serde_json::Value,
    ) -> Result<super::cell::CellContent, String> {
        let number_cell_config: NumberCellConfig =
            serde_json::from_value(cell_config).map_err(|err| err.to_string())?;
        let cell_type_id = number_cell_config.cell_type_id;
        let payload = number_cell_config.payload;
        let base_payload = BasePayload {
            value: json!(payload.value),
            display_value: payload.display_value,
            display_style_class: payload.display_style_class,
            extra_fields: payload.extra_fields,
        };

        Ok(CellContent {
            cell_type_id,
            payload: base_payload,
        })
    }

    fn get_css(&self) -> String {
        include_str!("./style.css")
            .to_string()
    }
}
