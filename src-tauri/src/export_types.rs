use std::process::Command;

use ts_rs::TS;
use crate::api::{
    load_cell_plugin_css_map::CssMap, load_sheet::{FrontedSheetData, LoadSheetRequest}
};

pub fn export_ts() 
{
    let out_dir = "../src/tauri-api/types".to_string();
    FrontedSheetData::
        export_all_to(&out_dir)
        .unwrap();

    LoadSheetRequest::
        export_all_to(&out_dir)
        .unwrap();
    
    CssMap::
        export_all_to(&out_dir)
        .unwrap();

    let _ = Command::new("npx.cmd")
        .args(["prettier", "--write", &format!("{}/**/*.ts", out_dir)])
        .status()
        .expect("failed to format with prettier");

    println!("✅ TypeScript generated to `{}`", out_dir);
}