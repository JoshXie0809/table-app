import { VirtualCells } from "./VirtualCells";
import type { FrontedSheet } from "../tauri-api/types/FrontedSheet";
import { CellContent } from "../tauri-api/types/CellContent";

export type HeaderType = "column" | "row";

function makeHeader(headerType: HeaderType, n: number, prefix: string, def: CellContent): [string, CellContent][] {
  return Array.from({ length: n }, (_, i) => {
    const cell = structuredClone(def);
    cell.payload.value = `${prefix}${i}`;
    const key = headerType === "row" ? `${i},0` : `0,${i}`;
    return [key, cell];
  });
}

export function createVirtualCellsFromBackend(data: FrontedSheet): VirtualCells {
  
  let nRow = data.rowCount;
  let nCol = data.colCount;

  const defaultCellContent = structuredClone(data.defaultCellContent);

  const rowHeader: [string, CellContent][] = data.hasRowHeader
    ? data.rowHeader ?? []
    : makeHeader("row", nRow, "R", defaultCellContent);
    

  const colHeader: [string, CellContent][] = data.hasColHeader
    ? data.colHeader ?? []
    : makeHeader("column", nCol, "C", defaultCellContent);
  
  
  return new VirtualCells(
    data.sheetName,
    data.sheetType, // 這裡是 gridType
    { nRow, nCol },
    data.cellWidth,
    data.cellHeight,
    data.cells,
    rowHeader,
    colHeader,
  );
}


export function createRowVC(mainVC: VirtualCells): VirtualCells {
  const nRow = mainVC.sheetSize.nRow;

  const rowVC = new VirtualCells(
    `${mainVC.sheetName}-row-header`,
    mainVC.gridType,
    { nRow, nCol: 1 },
    mainVC.cellWidth,
    mainVC.cellHeight,
    [], // 先給空 因為我們需要的是 ref to VirtualCells
    [],
    [],
  );

  // ✅ 將 rowHeaderMap 賦值給 rowVC 的 cellsMap
  rowVC.cellsMap = mainVC.rowHeaderMap!;

  return rowVC;
}
