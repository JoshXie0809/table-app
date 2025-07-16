import { invoke } from "@tauri-apps/api/core";
import { TauriApiResponse } from "./api";
import { CellMetaMap as LoadCellPluginCellMetaMapPayload } from "./types/CellMetaMap"

export async function loadCellPluginCellMetaMap() 
  : Promise<TauriApiResponse<LoadCellPluginCellMetaMapPayload>>
{
  return invoke("load_cell_plugin_cell_meta_map", {})
}