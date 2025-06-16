use std::collections::HashMap;

use crate::cell_plugins::{cell::BasePayload, rendering_config::DrawingCommand};

use super::CellPlugin;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};


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

    fn render_cell(
        &self, 
        row_index: i64, 
        _col_index: i64,
        x: f32,                  // Cell 在整個 Canvas 上的絕對 X 座標 (由前端 Layout Engine 計算)
        y: f32,                  // Cell 在整個 Canvas 上的絕對 Y 座標 (由前端 Layout Engine 計算)
        width: f32,              // Cell 的實際寬度 (由前端 Layout Engine 計算)
        height: f32,             // Cell 的實際高度 (由前端 Layout Engine 計算)
        payload: &Value,
    ) -> Result<DrawingCommand, String>
    
    {
        let data: TextCellPayload = serde_json::from_value(payload.clone())
            .map_err(|e| e.to_string())?;

        let display_text = match data.label {
            Some(label_str) => label_str,
            None => data.value,
        };

        let mut canvas_commads = DrawingCommand::new();

        // #ffffff (255, 255, 255)
        // #f9f9f9 (249, 249, 249)

        // 繪製 Cell 背景 (白色)
        if row_index % 2 != 0 {
            canvas_commads.bg_fill_style = format!("#f9f9f9");
        }

        // 繪製 Cell 邊框 (#ddd)

        
        // 繪製文字內容
        canvas_commads.text = display_text;
        canvas_commads.text_x = 4.0 + x + width * 0.5;
        canvas_commads.text_y = y + height * 0.5;

        Ok(canvas_commads)
    }

    fn default_payload(&self) -> Result<BasePayload, String> {

        Ok(BasePayload {
            value: json!("".to_string()),
            label: None,
            extra_fields: HashMap::new(),
        })
    }

}