use std::collections::HashMap;

use serde_json::Value; // 確保導入 serde_json::Value
use serde::{Deserialize, Serialize}; // 確保導入 Deserialize 和 Serialize

// 這個結構體代表前端傳來的 { type, payload } 部分
#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")] // 前端可能是 camelCase，例如 cellType, cellPayload
pub struct CellContent {
    #[serde(rename = "type")] // 前端的 key 是 "type"，這裡需要指定
    pub cell_type_id: String, // 將前端的 "type" 映射到 Rust 的 cell_type_id
    pub payload: BasePayload,       // 前端的 "payload"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] // 自動處理 camelCase 命名
pub struct BasePayload {
    pub value: Value, // value 字段可以是任何類型，所以用 Value
    pub label: Option<String>, // label 字段必須是 String

    // 都收集到 'extra_fields' 這個 HashMap 中。
    // 這保留了 payload 的彈性，允許不同 CellType 有不同的額外字段。
    pub extra_fields: HashMap<String, Value>,
}