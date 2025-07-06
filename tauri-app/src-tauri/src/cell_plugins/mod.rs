use schemars::Schema;

use crate::cell_plugins::cell::{BasePayload, CellContent, CellMeta};

// 在 mod.rs 中聲明子模組
pub mod cell;
pub mod text_cell; 
pub mod null_cell;

pub mod registry;  // 稍後會建立這個模組來管理所有插件

pub trait CellPlugin: Send + Sync {

    fn get_meta(&self) -> CellMeta;

    fn get_schema(&self) -> Schema;

    fn to_cell_content(&self, cell_config: serde_json::Value) -> Result<CellContent, String>;

    fn from_cell_content(&self, cell_content: CellContent) -> Result<serde_json::Value, String>;

    fn default_cell_config(&self) -> serde_json::Value;

    fn display_cell(&self, payload: BasePayload) -> String;

    fn get_css(&self) -> String;
}




