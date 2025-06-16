use serde_json::Value;

use crate::cell_plugins::{cell::BasePayload, rendering_config::DrawingCommand};

// 在 mod.rs 中聲明子模組
pub mod cell;
pub mod text_cell; 
pub mod null_cell;

pub mod registry;  // 稍後會建立這個模組來管理所有插件
pub mod rendering_config;

pub trait CellPlugin: Send + Sync {
    // 獲取 plugnin 的識別符
    fn get_type_id(&self) -> &str;

    // 顯示在前端的名稱
    fn get_display_name(&self) -> &str;

    // 渲染表格的邏輯
    // (x, y) 表格的左上角
    fn render_cell (
        &self,
        row_index: i64, col_index: i64,
        x: f32,                  // Cell 在整個 Canvas 上的絕對 X 座標 (由前端 Layout Engine 計算)
        y: f32,                  // Cell 在整個 Canvas 上的絕對 Y 座標 (由前端 Layout Engine 計算)
        width: f32,              // Cell 的實際寬度 (由前端 Layout Engine 計算)
        height: f32,             // Cell 的實際高度 (由前端 Layout Engine 計算)
        payload: &Value
    ) -> Result<DrawingCommand, String>;

    // 用於前端， 定義 default cell 的 初始資料
    fn default_payload(&self) -> Result<BasePayload, String>;

    // // 讓 quick edit 模式可以修改的值
    // fn get_value() -> Value;

    // // 讓 quick edit 模式可以回傳的值
    // fn set_value();

}




