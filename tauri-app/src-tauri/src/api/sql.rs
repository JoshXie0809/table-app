use serde::Deserialize;
use tauri::command;
use ts_rs::TS;

#[command]
pub fn sql_connect(arg: SQLConnectRequest) 
    -> Result<(), String>
{
    let path = arg.path;
    let conn = sql_tool::sql::conn::MyConnection::new(&path)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SQLConnectRequest {
    path: String
}