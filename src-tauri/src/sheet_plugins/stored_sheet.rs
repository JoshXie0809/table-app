use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct StoredSheet {
    pub plugin_type: String,
    pub raw_config: serde_json::Value,
}
