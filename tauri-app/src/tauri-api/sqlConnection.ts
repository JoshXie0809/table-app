import { invoke } from "@tauri-apps/api/core";
import { SQLConnectRequest } from "./types/SQLConnectRequest";
import { TauriApiResponse } from "./api";

export function sqlConnect(arg: SQLConnectRequest) : Promise<TauriApiResponse<string>>
{
  return invoke("sql_connect", { arg } );
}


export function sqlListTable(arg: SQLConnectRequest) : Promise<TauriApiResponse<string[]>>
{
  return invoke("sql_list_table", { arg } );
}

export function sqlTableInfo(arg: SQLConnectRequest) : Promise<ArrayBuffer>
{
  return invoke("sql_table_info", { arg } );
}