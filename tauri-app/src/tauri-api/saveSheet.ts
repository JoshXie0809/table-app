import { invoke } from "@tauri-apps/api/core";
import { TauriApiResponse } from "./api";
import { FrontedSheet as LoadSheetPayload} from "./types/FrontedSheet";
import { SaveSheetRequest } from "./types/SaveSheetRequest";

export async function saveSheet(arg: SaveSheetRequest): Promise<TauriApiResponse<LoadSheetPayload>> {
    return invoke("save_sheet", { arg });
}