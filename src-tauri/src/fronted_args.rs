// 在您的 Tauri 命令所在的檔案中，例如 src/main.rs 或 src/commands.rs

use serde_json::Value; // 確保導入 serde_json::Value
use serde::{Deserialize, Serialize}; // 確保導入 Deserialize 和 Serialize

// 這個結構體代表前端傳來的 { type, payload } 部分
#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")] // 前端可能是 camelCase，例如 cellType, cellPayload
pub struct FrontendCellData {
    #[serde(rename = "type")] // 如果前端的 key 是 "type"，這裡需要指定
    pub cell_type_id: String, // 將前端的 "type" 映射到 Rust 的 cell_type_id
    pub payload: Value,       // 前端的 "payload"
}

// 這個結構體代表前端傳來的完整命令請求
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")] // 假設其他字段如 rowIndex 也是 camelCase
pub struct CellRenderRequest {
    #[serde(flatten)] // 使用 flatten 將 FrontendCellData 的字段直接合併到這裡
    pub cell_data: FrontendCellData, // 包含 type 和 payload 的嵌套結構

    pub row_index: i64,
    pub col_index: i64,
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}