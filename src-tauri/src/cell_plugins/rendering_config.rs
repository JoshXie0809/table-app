use serde::{Deserialize, Serialize};

// 表格呈現資料的回傳格式

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DrawingCommand {
    pub bg_fill_style: String,

    pub border_stroke_style: String,

    pub text: String,
    pub text_font: String,
    pub text_color: String,
    pub text_align: String,
    pub text_baseline: String,
    pub text_x: f32,
    pub text_y: f32,
}

impl DrawingCommand {
    pub fn new() -> Self {
        DrawingCommand {
            bg_fill_style: format!("#ffffff"),
            border_stroke_style: format!("#ddd"),

            text: format!(""),
            text_font: format!("14px system-ui, sans-serif"),
            text_color: format!("#000"),
            text_align: format!("center"),
            text_baseline: format!("middle"),
            text_x: 0.0,
            text_y: 0.0,
        }
    }
}