use crate::cell_plugins::{
    cell::{BasePayload, CellContent, CellMeta},
    CellPlugin,
};

use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};
use serde_json::json;

use plugin_macros::Plugin;

#[derive(Debug, Deserialize, Serialize, Clone, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct NullCellConfig {
    pub cell_type_id: String,
    pub payload: BasePayload,
}

impl Default for NullCellConfig {
    fn default() -> Self {
        Self {
            cell_type_id: "Null".to_string(),
            payload: BasePayload {
                value: json!(""),
                display_value: None,
                display_style: None,
                extra_fields: None,
            },
        }
    }
}

#[derive(Plugin)]
pub struct NullCellPlugin;

impl CellPlugin for NullCellPlugin {
    fn get_meta(&self) -> CellMeta {
        CellMeta {
            has_display_value: false,
            has_display_style: false,
        }
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

        Ok(CellContent {
            cell_type_id,
            payload,
        })
    }

    fn from_cell_content(&self, cell_content: CellContent) -> Result<serde_json::Value, String> {
        let cell_type_id = cell_content.cell_type_id;
        let payload = cell_content.payload;

        Ok(json!(NullCellConfig {
            cell_type_id,
            payload
        }))
    }

    fn display_cell(&self, payload: BasePayload) -> String {
        let val = payload.value;
        val.as_str().unwrap_or("").to_string()
    }

    fn get_css(&self) -> String {
        ".cell-plugin-null {
            font-size: 14px;
            font-family: monospace;
            color: #aaa;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }"
        .to_string()
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
