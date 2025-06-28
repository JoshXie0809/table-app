use std::collections::HashMap;

use crate::cell_plugins::{cell::BasePayload, CellPlugin};

use serde::{Deserialize, Serialize};
use serde_json::{json};



#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NullCellPayload {
    pub value: String,
    pub label: Option<String>,
}



pub struct NullCellPlugin;
impl CellPlugin for NullCellPlugin {
    fn get_type_id(&self) -> &str { "Null" }

    fn get_display_name(&self) -> &str { "空-Null" }

    fn default_payload(&self) -> Result<BasePayload, String> {
        
        Ok(BasePayload {
            value: json!("".to_string()),
            display_value: None,
            display_style: Some(None),
            extra_fields: HashMap::new()
        })
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