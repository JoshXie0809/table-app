// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use table_lib::export_types::export_ts;

fn main() {
    
    let args: Vec<String> = std::env::args().collect();
    if args.get(1).map(|s| s.as_str()) == Some("export-ts") {
        export_ts();
        return;
    }

    table_lib::run()
}
