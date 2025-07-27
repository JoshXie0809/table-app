use std::sync::{Arc, Mutex};
use serde::Deserialize;
use sql_tool::sql::conn::MyConnection;
use tauri::{command, State};
use ts_rs::TS;

use crate::api::base::ApiResponse;

#[command]
pub fn sql_connect(state: State<'_, Arc<Mutex<Option<MyConnection>>>>) 
    -> ApiResponse<String>
{
    // 嘗試獲取鎖
    let mut guard = match state.lock() {
        Ok(g) => g,
        Err(e) => return ApiResponse::error(e.to_string()),
    };
    // 如果目前沒有連線，建立新的連線
    if guard.is_none() {
        let mconn = match MyConnection::new() {
            Ok(mconn) => mconn,
            Err(e) => return ApiResponse::error(e.to_string())
        };
        *guard = Some(mconn);
    }

    ApiResponse::success(Some("Connected".to_string()))
}

#[command]
pub fn sql_attach_db (
    arg: SQLAttachDBRequest,
    state: State<'_, Arc<Mutex<Option<MyConnection>>>>
) -> ApiResponse<String>
{
    // 確保有連線
    sql_connect(state.clone());
    let mut guard = match state.lock() {
        Ok(g) => g,
        Err(e) => return ApiResponse::error(e.to_string()),
    };
    let conn = guard.as_mut().unwrap();
    let path: String = arg.path;
    let alias: String = arg.alias;

    match conn.attach_db(&path, &alias) {
        Ok(()) => ApiResponse::success(Some("Attached".to_string())),
        Err((e)) => ApiResponse::error(e.to_string())
    }

}

#[command]
pub fn sql_list_table(
    arg: SQLListTableRequest,
    state: State<'_, Arc<Mutex<Option<MyConnection>>>>
) -> ApiResponse<Vec<String>>
{
    // 確保有連線
    sql_connect(state.clone());
    let guard = match state.lock() {
        Ok(g) => g,
        Err(e) => return ApiResponse::error(e.to_string()),
    };
    let conn = guard.as_ref().unwrap();
    let path: String = arg.path;
    let table_names = match conn.list_db_tables(&path) {
        Ok(names) => names,
        Err(err) => return ApiResponse::error(err.to_string()),
    };
    ApiResponse::success(Some(table_names))
}

#[command]
pub fn sql_table_info(
    arg: SQLTableInfoRequest,
    state: State<'_, Arc<Mutex<Option<MyConnection>>>>
) 
    -> Result<tauri::ipc::Response, String>
{
    let path = arg.path;
    let table_name = arg.table_name;
    // 確保有連線
    sql_connect(state.clone());
    let guard = match state.lock() {
        Ok(g) => g,
        Err(e) => return Err(e.to_string()),
    };
    let conn = guard.as_ref().unwrap();
    let batches = match conn.table_info(&path, &table_name).map_err(|e| e.to_string())? 
    {
        Some(b) => b,
        None => return Err("there is no row in table_info".into())
    };

    let mut buffer = vec![];
    let schema = match batches.get(0) {
        Some(batch) => batch.schema(),
        None => return Err("there is no row in table_info".into()),
    };
    let mut writer = arrow::ipc::writer::StreamWriter::try_new(&mut buffer, &schema)
        .map_err(|err| err.to_string())?;
    for batch in &batches {
        writer.write(batch).map_err(|err| err.to_string())?;
    }
    Ok(tauri::ipc::Response::new( buffer ))
}

#[command]
pub fn sql_show_all_table(
    arg: SQLTableInfoRequest,
    state: State<'_, Arc<Mutex<Option<MyConnection>>>>
) 
    -> Result<tauri::ipc::Response, String>
{
    let path = arg.path;
    let table_name = arg.table_name;
    // 確保有連線
    sql_connect(state.clone());
    let guard = match state.lock() {
        Ok(g) => g,
        Err(e) => return Err(e.to_string()),
    };
    let conn = guard.as_ref().unwrap();
    
    let batches = match conn.show_all_table(&path, &table_name).map_err(|e| e.to_string())? {
        Some(b) => b,
        None => return Err("there is no row in table_info".into())
    };
    let mut buffer = vec![];
    let schema = match batches.get(0) {
        Some(batch) => batch.schema(),
        None => return Err("there is no row in table_info".into()),
    };
    let mut writer = arrow::ipc::writer::StreamWriter::try_new(&mut buffer, &schema)
        .map_err(|err| err.to_string())?;
    for batch in &batches {
        writer.write(batch).map_err(|err| err.to_string())?;
    }
    Ok(tauri::ipc::Response::new( buffer ))
}


#[command]
pub fn sql_query(
    arg: SQLQueryRequest,
    state: State<'_, Arc<Mutex<Option<MyConnection>>>>
) 
    -> Result<tauri::ipc::Response, String>
{
    let sql = arg.sql;
    // 確保有連線
    sql_connect(state.clone());
    let guard = match state.lock() {
        Ok(g) => g,
        Err(e) => return Err(e.to_string()),
    };
    let conn = guard.as_ref().unwrap();
    let batches = match conn
        .sql_query(&sql)
        .map_err(|e| e.to_string())? 
    {
        Some(b) => b,
        None => return Err("there is no table after query".into())
    };
    let mut buffer = vec![];
    let schema = match batches.get(0) {
        Some(batch) => batch.schema(),
        None => return Err("there is no table after query".into()),
    };
    let mut writer = arrow::ipc::writer::StreamWriter::try_new(&mut buffer, &schema)
        .map_err(|err| err.to_string())?;
    for batch in &batches {
        writer.write(batch).map_err(|err| err.to_string())?;
    }
    Ok(tauri::ipc::Response::new( buffer ))
}

#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SQLListTableRequest {
    path: String
}

#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SQLAttachDBRequest {
    path: String,
    alias: String
}

#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SQLTableInfoRequest {
    path: String,
    table_name: String,
}

#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SQLQueryRequest {
    sql: String,
}
