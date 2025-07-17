use std::collections::HashMap;

use crate::cell_plugins::{
    cell::{BasePayload, CellContent},
    CellPlugin,
};

use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use plugin_macros::Plugin;

// 產生給前端的 schema
#[derive(Debug, Deserialize, Serialize, Clone, JsonSchema)]
pub struct NullPayload {
    pub value: String,
    pub display_value: Option<String>,
    pub display_style_class: Option<String>, // 回傳 css-class    
    pub extra_fields: Option<HashMap<String, Value>>,
}

#[derive(Debug, Deserialize, Serialize, Clone, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct NullCellConfig {
    pub cell_type_id: String,
    pub payload: NullPayload,
}

impl Default for NullCellConfig {
    fn default() -> Self {
        Self {
            cell_type_id: "Null".to_string(),
            payload: NullPayload {
                value: "".to_string(),
                display_value: None,
                display_style_class: None,
                extra_fields: None,
            },
        }
    }
}

#[derive(Plugin)]
pub struct NullCellPlugin;

impl CellPlugin for NullCellPlugin {
    fn get_meta(&self) -> Value {
        let mut map: HashMap<String, Value> = HashMap::new();
        map.insert("has_display_formatter".to_string(), json!(false));
        map.insert("display_style_class".to_string(), json!("cell-plugin-null"));
        json!(map)
    }

    fn get_schema(&self) -> schemars::Schema {
        schema_for!(NullCellConfig)
    }

    fn default_cell_config(&self) -> serde_json::Value {
        json!(NullCellConfig::default())
    }

    fn to_cell_content(&self, cell_config: serde_json::Value) -> Result<CellContent, String> {
        let null_cell_config: NullCellConfig =
            serde_json::from_value(cell_config).map_err(|err| err.to_string())?;
        let cell_type_id = null_cell_config.cell_type_id;
        let payload = null_cell_config.payload;
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

    fn from_cell_content(&self, cell_content: CellContent) -> Result<serde_json::Value, String> {
        let cell_type_id = cell_content.cell_type_id;
        let payload = cell_content.payload;
        let null_payload = NullPayload {
            value: payload.value.as_str().map(|s| s.to_string()).unwrap_or_default(),
            display_style_class: payload.display_style_class,
            display_value: payload.display_value,
            extra_fields: payload.extra_fields,
        };

        Ok(json!(NullCellConfig {
            cell_type_id,
            payload: null_payload
        }))
    }

    fn display_cell(&self, payload: BasePayload) -> String {
        let val = payload.value;
        val.as_str().unwrap_or("").to_string()
    }

    fn get_css(&self) -> String {
        include_str!("./style.css").to_string()
    }
}

#[cfg(test)]
mod tests {
    use plugin_core::Plugin;

    use crate::cell_plugins::null_cell::NullCellPlugin;

    #[test]
    fn test_derive_pluging() {
        let ncp = NullCellPlugin;
        println!("{}", ncp.name());
    }
}
