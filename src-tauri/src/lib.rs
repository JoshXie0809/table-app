mod sheet;
use crate::sheet::Cell;



#[tauri::command]
fn get_a_cell() -> Cell 
{
    Cell::Text { value: "1234567890".to_string(), label: "".to_string() }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_a_cell
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
