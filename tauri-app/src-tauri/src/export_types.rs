use std::process::Command;

use crate::{
    api::{
        get_display_value::{DisplayCellResults, GetDisplayValueRequest}, load_cell_plugin_cell_meta_map::CellMetaMap, load_cell_plugin_css_map::CssMap, load_sheet::LoadSheetRequest, save_sheet::SaveSheetRequest, sql::{SQLConnectRequest, SQLTableInfoRequest}
    },
    cell_plugins::cell::CellMeta,
    sheet_plugins::fronted_sheet::FrontedSheet,
};
use ts_rs::TS;

pub fn export_ts() {
    let out_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap() // 回到 React 專案根
        .join("src")
        .join("tauri-api")
        .join("types");

    LoadSheetRequest::export_all_to(&out_dir).unwrap();

    CssMap::export_all_to(&out_dir).unwrap();

    GetDisplayValueRequest::export_all_to(&out_dir).unwrap();

    DisplayCellResults::export_all_to(&out_dir).unwrap();

    FrontedSheet::export_all_to(&out_dir).unwrap();

    CellMeta::export_all_to(&out_dir).unwrap();

    CellMetaMap::export_all_to(&out_dir).unwrap();

    SaveSheetRequest::export_all_to(&out_dir).unwrap();

    SQLConnectRequest::export_all_to(&out_dir).unwrap();

    SQLTableInfoRequest::export_all_to(&out_dir).unwrap();

    let npx = if cfg!(target_os = "windows") {
        "npx.cmd"
    } else {
        "npx"
    };
    let _ = Command::new(npx)
        .args([
            "prettier",
            "--write",
            &format!("{}/**/*.ts", out_dir.to_string_lossy()),
        ])
        .status()
        .expect("failed to format with prettier");

    println!("✅ TypeScript generated to `{}`", out_dir.to_string_lossy());
}
