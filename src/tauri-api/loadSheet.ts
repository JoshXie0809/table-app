import { invoke } from "@tauri-apps/api/core";
import { TauriApiResponse } from "./api";
import { FrontedSheetData as LoadSheetPayload} from "./types/FrontedSheetData";
import { LoadSheetRequest } from "./types/LoadSheetRequest";

export async function loadSheet(arg: LoadSheetRequest): Promise<TauriApiResponse<LoadSheetPayload>> {
    return invoke("load_sheet", { arg });
}

