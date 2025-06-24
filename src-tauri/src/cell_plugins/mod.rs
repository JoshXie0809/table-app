use crate::cell_plugins::{cell::BasePayload};

// 在 mod.rs 中聲明子模組
pub mod cell;
pub mod text_cell; 
pub mod null_cell;

pub mod registry;  // 稍後會建立這個模組來管理所有插件

pub trait CellPlugin: Send + Sync {
    // 獲取 plugnin 的識別符
    fn get_type_id(&self) -> &str;

    // 顯示在前端的名稱
    fn get_display_name(&self) -> &str;

    fn display_cell(&self, payload: BasePayload) -> String;

    fn get_css(&self) -> String;

    // 用於前端， 定義 default cell 的 初始資料
    fn default_payload(&self) -> Result<BasePayload, String>;

    // // 讓 quick edit 模式可以修改的值
    // fn get_value() -> Value;

    // // 讓 quick edit 模式可以回傳的值
    // fn set_value();

}




