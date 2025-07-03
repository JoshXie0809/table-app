import { VirtualCells } from "./VirtualCells";
import type { FrontedSheet } from "../tauri-api/types/FrontedSheet";

export function createVirtualCellsFromBackend(data: FrontedSheet): VirtualCells {
  return new VirtualCells(
    data.sheetName,
    data.sheetType, // 這裡是 gridType
    { nRow: data.rowCount, nCol: data.colCount },
    data.cellWidth,
    data.cellHeight,
    data.cells
  );
}