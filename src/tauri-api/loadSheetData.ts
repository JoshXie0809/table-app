import { invoke } from "@tauri-apps/api/core";
import { TauriApiResponse } from "./api";
import { FrontedSheetData } from "./types/FrontedSheetData";
import { LoadSheetRequest } from "./types/LoadSheetRequest";

export async function loadSheetData(arg: LoadSheetRequest): Promise<TauriApiResponse<FrontedSheetData>> {
    return invoke("load_sheet_data", { arg });
}

    
    // useEffect(() => {
    //     async function loadInitialSheetData() { // 更好的命名
    //         try {
    //             // 模擬一個 Sheet ID，實際應該從路由或用戶選擇中獲取
    //             const sheetIdToLoad = "default_sheet_id"; 
    //             const res: TauriApiLoadSheetResponse = 
    //               await invoke("load_sheet_data", { sheetName: sheetIdToLoad }); 
    //             console.log(res);

    //             // 從回應中提取數據，構建 UseVirtualCellsOptions
    //             const options: UseVirtualCellsOptions = {
    //                 iType: res.type, // 來自 metadata
    //                 iSheetName: res.sheetName,
    //                 iRowCount: res.rowCount,
    //                 iColCount: res.colCount,
    //                 iCellWidth: res.cellWidth, // 新增
    //                 iCellHeight: res.cellHeight, // 新增
    //                 iCells: res.cells, // 來自 allCells
    //             };

    //             setVirtualCellsOptions(options);
    //           } catch(error) {
    //             console.error("Error loading initial sheet data:", error);
    //         }
    //     }
        
    //     loadInitialSheetData(); // 執行載入數據的函式
    // }, []); // 
  