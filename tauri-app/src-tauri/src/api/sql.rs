use serde::Deserialize;
use tauri::command;
use ts_rs::TS;

use crate::api::base::ApiResponse;

#[command]
pub fn sql_connect(arg: SQLConnectRequest) 
    -> ApiResponse<String>
{
    let path = arg.path;
    let conn_res = sql_tool::sql::conn::MyConnection::new(&path)
        .map_err(|e| e.to_string());
    match conn_res {
        Ok(_conn) => ApiResponse::success(None),
        Err(err) => ApiResponse::error(err),
    }
}

#[command]
pub fn sql_list_table(arg: SQLConnectRequest) -> ApiResponse<Vec<String>>
{
    let path = arg.path;
    let conn_res = sql_tool::sql::conn::MyConnection::new(&path)
        .map_err(|e| e.to_string());
    let conn = match conn_res {
        Ok(conn) => conn,
        Err(err) => return ApiResponse::error(err),
    };
    let table_names = match conn.list_tables() {
        Ok(names) => names,
        Err(err) => return ApiResponse::error(err.to_string()),
    };
    ApiResponse::success(Some(table_names))
}

#[command]
pub fn sql_table_info(arg: SQLTableInfoRequest) 
    -> Result<tauri::ipc::Response, String>
{
    let path = arg.path;
    let table_name = arg.table_name;
    let conn = sql_tool::sql::conn::MyConnection::new(&path)
        .map_err(|e| e.to_string())?;
    let batches = match conn.table_info(&table_name).map_err(|e| e.to_string())? {
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
pub fn sql_show_all_table(arg: SQLTableInfoRequest) 
    -> Result<tauri::ipc::Response, String>
{
    let path = arg.path;
    let table_name = arg.table_name;
    let conn = sql_tool::sql::conn::MyConnection::new(&path)
        .map_err(|e| e.to_string())?;
    let batches = match conn.show_all_table(&table_name).map_err(|e| e.to_string())? {
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
pub fn sql_query(arg: SQLQueryRequest) 
    -> Result<tauri::ipc::Response, String>
{
    let sql = arg.sql;
    let conn = sql_tool::sql::conn::MyConnection::new_no_path()
        .map_err(|e| e.to_string())?;
    let batches = match conn
        .sql_query(&sql)
        .map_err(|e| e.to_string())? 
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

#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SQLConnectRequest {
    path: String
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