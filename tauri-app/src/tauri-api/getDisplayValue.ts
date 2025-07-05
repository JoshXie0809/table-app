import { invoke } from "@tauri-apps/api/core";
import { TauriApiResponse } from "./api";
import { DisplayCellResults } from "./types/DisplayCellResults";
import { GetDisplayValueRequest } from "./types/GetDisplayValueRequest";

export async function getDisplayValue(arg: GetDisplayValueRequest) : Promise<TauriApiResponse<DisplayCellResults>>
{
  return await invoke("get_display_value", {arg});
}