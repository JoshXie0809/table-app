import { invoke } from "@tauri-apps/api/core";
import { SQLListTableRequest } from "./types/SQLListTableRequest";
import { TauriApiResponse } from "./api";
import { SQLTableInfoRequest } from "./types/SQLTableInfoRequest";
import { SQLQueryRequest } from "./types/SQLQueryRequest";

export function sqlConnect() : Promise<TauriApiResponse<string>>
{
  return invoke("sql_connect", {} );
}

export function sqlAttachDB(arg: SQLListTableRequest) : Promise<TauriApiResponse<string[]>>
{
  return invoke("sql_attach_db", { arg } );
}

export function sqlListTable(arg: SQLListTableRequest) : Promise<TauriApiResponse<string[]>>
{
  return invoke("sql_list_table", { arg } );
}

export function sqlTableInfo(arg: SQLTableInfoRequest) : Promise<ArrayBuffer>
{
  return invoke("sql_table_info", { arg } );
}

export function sqlShowAllTable(arg: SQLTableInfoRequest) : Promise<ArrayBuffer>
{
  return invoke("sql_show_all_table", { arg } );
}

export function sqlQuery(arg: SQLQueryRequest) : Promise<ArrayBuffer>
{
  return invoke("sql_query", { arg } );
}