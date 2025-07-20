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
        Ok(_conn) => ApiResponse { success: true, data: None, error: None },
        Err(err) => ApiResponse { success: false, data: None, error: Some(err) },
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
        Err(err) => return ApiResponse { success: false, data: None, error: Some(err) },
    };

    let table_names = match conn.list_tables() {
        Ok(names) => names,
        Err(err) => return ApiResponse { success: false, data: None, error: Some(err.to_string()) },
    };

    ApiResponse { success: true, data: Some(table_names), error: None }
}


#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SQLConnectRequest {
    path: String
}