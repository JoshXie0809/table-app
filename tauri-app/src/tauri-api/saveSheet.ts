import { invoke } from "@tauri-apps/api/core";
import { TauriApiResponse } from "./api";
import { SaveSheetRequest } from "./types/SaveSheetRequest";

export async function saveSheet(arg: SaveSheetRequest): Promise<TauriApiResponse<string>> {
    return invoke("save_sheet", { arg });
}