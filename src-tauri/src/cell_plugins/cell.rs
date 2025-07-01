use std::collections::HashMap;
use schemars::JsonSchema;
use serde_json::Value; // 確保導入 serde_json::Value
use serde::{Deserialize, Serialize};
use ts_rs::TS;

// 這個結構體代表前端傳來的 { type, payload } 部分
#[derive(Debug, Deserialize, Serialize, Clone, TS, JsonSchema)]
#[serde(rename_all = "camelCase")] // 前端可能是 camelCase，例如 cellType, cellPayload
pub struct CellContent {
    #[serde(rename = "type")] // 前端的 key 是 "type"，這裡需要指定
    pub cell_type_id: String, // 將前端的 "type" 映射到 Rust 的 cell_type_id
    pub payload: BasePayload,       // 前端的 "payload"
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, JsonSchema)]
#[serde(rename_all = "camelCase")] // 自動處理 camelCase 命名
pub struct BasePayload {
    #[ts(type="any")]
    pub value: Value, // value 字段可以是任何類型，所以用 Value
    #[serde(skip_serializing_if = "skip_if_outer_none")]
    #[ts(type = "string | null | undefined")]
    pub display_value: Option<Option<String>>, 
    #[serde(skip_serializing_if = "skip_if_outer_none")]
    #[ts(type = "string | null | undefined")]
    pub display_style: Option<Option<String>>, // 回傳 css-class

    // 都收集到 'extra_fields' 這個 HashMap 中。
    // 這保留了 payload 的彈性，允許不同 CellType 有不同的額外字段。
    #[ts(type="Map<string, any>")]
    pub extra_fields: HashMap<String, Value>,
}

fn skip_if_outer_none<T>(value: &Option<Option<T>>) -> bool {
    value.is_none()
}