import { invoke } from "@tauri-apps/api/core";
import { TauriApiResponse } from "./api";
import { FrontedSheet as LoadSheetPayload} from "./types/FrontedSheet";
import { LoadSheetRequest } from "./types/LoadSheetRequest";

export async function loadSheet(arg: LoadSheetRequest): Promise<TauriApiResponse<LoadSheetPayload>> {
    return invoke("load_sheet", { arg });
}