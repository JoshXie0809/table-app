use std::{collections::HashMap, fs::File, io::{Read, Write}};

use duckdb::Connection;
use tempfile::NamedTempFile;
use zip::ZipArchive;

use crate::{cell_plugins::cell::CellContent, sheet_plugins::stored_sheet::{StoredSheetData, StoredSheetMeta}};

pub fn load_zip_file(path: &str) 
    -> Result<(StoredSheetMeta), String>
{
    let meta = load_meta_of_zip_file(path)?;

    println!("{:#?}", meta);
    println!("{:#?}", meta.sheet_meta.default_cell_content);

    Ok(meta)
}

pub fn load_meta_of_zip_file(path: &str) 
    -> Result<StoredSheetMeta, String>
{
    let zip_file = File::open(path).map_err(|err| err.to_string())?;
    let mut archive = ZipArchive::new(zip_file).map_err(|err| err.to_string())?;

    let meta_json_str = {
        let mut meta_json = archive.by_name("meta.json").map_err(|e| e.to_string())?;
        let mut buf = String::new();
        meta_json.read_to_string(&mut buf).map_err(|e| e.to_string())?;
        buf
    };
    
    let meta: StoredSheetMeta = serde_json::from_str(&meta_json_str).map_err(|err| err.to_string())?;
    Ok(meta)
}

pub fn load_data_of_zip_file(path: &str, data_format: &str) 
    -> Result<(), String>
{
    let zip_file = File::open(path).map_err(|err| err.to_string())?;
    let mut archive = ZipArchive::new(zip_file).map_err(|err| err.to_string())?;

    let mut duckdb_entry = archive
        .by_name("data.duckdb")
        .map_err(|err| err.to_string())?;

    // 建立一個 temp 檔案 將 db 寫入
    let mut temp_db_file = NamedTempFile::new().map_err(|err| err.to_string())?;
    std::io::copy(&mut duckdb_entry, &mut temp_db_file).map_err(|err| err.to_string())?;

    let db_path = temp_db_file.into_temp_path();
    

    // 建立 duck_db 連線
    let mut conn = Connection::open(&db_path).map_err(|err| err.to_string())?;

    let mut tx = conn.transaction().map_err(|err| err.to_string())?;
    let mut stmt = tx.prepare("select * from cells;").map_err(|err| err.to_string())?;

    stmt.execute([]).map_err(|err| err.to_string())?;
    let mut cells: HashMap<(u32, u32), CellContent> = HashMap::new();

    
    println!("✅ columns: {:?}", stmt.column_names());
    
    match data_format {
        "SparseMap" => {
            
        }

        "Dense2D" => {

        }
        _ => return  Err("error! cannot find this data_format at load_data_of_zip_file".to_string())
    }

    
    
    // 提早關閉連線，這樣才可以讓 temp file 順利刪除
    let _ = tx;
    let _ = conn;

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::io::loader::load_data_of_zip_file;


    #[test]
    fn read_file() -> Result<(), String> {
        
        let _ = load_data_of_zip_file("./test.sheetpkg.zip", "SparseMap")?;
        Ok(())
    }
}