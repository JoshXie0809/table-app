import { VirtualCells } from "./VirtualCells";
import type { FrontedSheetData } from "../tauri-api/types/FrontedSheetData";

export function createVirtualCellsFromBackend(data: FrontedSheetData): VirtualCells {
  return new VirtualCells(
    data.sheetName,
    data.type, // 這裡是 gridType
    { nRow: data.rowCount, nCol: data.colCount },
    data.cellWidth,
    data.cellHeight,
    data.cells
  );
}