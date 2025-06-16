use crate::cell_plugins::{rendering_config::DrawingCommand, CellPlugin};

use serde::{Deserialize, Serialize};
use serde_json::Value;



#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NullCellPayload {
    pub value: String,
    pub label: Option<String>
}

impl NullCellPayload {
    pub fn new() -> Self {
        Self {
            value: format!(""),
            label: None,
        }
    }
}


pub struct NullCellPlugin;
impl CellPlugin for NullCellPlugin {
    fn get_type_id(&self) -> &str { "Null" }

    fn get_display_name(&self) -> &str { "空-Null" }

    fn render_cell(
        &self, 
        row_index: i64, 
        _col_index: i64,
        _x: f32,                  // Cell 在整個 Canvas 上的絕對 X 座標 (由前端 Layout Engine 計算)
        _y: f32,                  // Cell 在整個 Canvas 上的絕對 Y 座標 (由前端 Layout Engine 計算)
        _width: f32,              // Cell 的實際寬度 (由前端 Layout Engine 計算)
        _height: f32,             // Cell 的實際高度 (由前端 Layout Engine 計算)
        _payload: &Value,
    ) -> Result<DrawingCommand, String>
    
    {
        let mut canvas_commads = DrawingCommand::new();

        // #ffffff (255, 255, 255)
        // #f9f9f9 (249, 249, 249)

        // 繪製 Cell 背景 (白色)
        if row_index % 2 != 0 {
            canvas_commads.bg_fill_style = format!("#f9f9f9");
        }

        // 繪製 Cell 邊框 (#ddd)

        
        // 繪製文字內容
        

        Ok(canvas_commads)
    }

    fn default_payload(&self) -> Result<Value, String> {
        let v = serde_json::to_value(NullCellPayload::new())
            .map_err(|e| e.to_string())?;

        Ok(v)
    }

}