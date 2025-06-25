use std::collections::HashMap;

use crate::cell_plugins::{cell::BasePayload};

use super::CellPlugin;
use serde::{Deserialize, Serialize};
use serde_json::{json};

pub struct TextCellPlugin;

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TextCellPayload {
    pub value: String,
    pub label: Option<String>
}



impl CellPlugin for TextCellPlugin {
    fn get_type_id(&self) -> &str { "Text" }

    fn get_display_name(&self) -> &str { "文字-Text" }

    fn display_cell(&self, payload: BasePayload) -> String {
        let val = payload.value;
        return val.to_string();       
    }    

    fn default_payload(&self) -> Result<BasePayload, String> {

        Ok(BasePayload {
            value: json!("".to_string()),
            display_style: None,
            display_value: None,
            extra_fields: HashMap::new(),
        })
    }

    fn get_css(&self) -> String {
        ".cell-plugin-text {
            font-size: 14px;
            font-family: 'Segoe UI', 'Roboto', sans-serif;
            color: #222;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.4;
        }"
        .to_string()
    }

}