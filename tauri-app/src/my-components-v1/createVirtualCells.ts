import { VirtualCells } from "./VirtualCells";
import type { FrontedSheet } from "../tauri-api/types/FrontedSheet";
import { CellContent } from "../tauri-api/types/CellContent";
import { CellMetaMap } from "../tauri-api/types/CellMetaMap";

export type HeaderType = "column" | "row";

function makeHeader(headerType: HeaderType, n: number, prefix: string, def: CellContent): [string, CellContent][] {
  return Array.from({ length: n }, (_, i) => {
    const cell = structuredClone(def);
    cell.payload.value = `${prefix}${i}`;
    const key = headerType === "row" ? `${i},0` : `0,${i}`;
    return [key, cell];
  });
}

export function createVirtualCellsFromBackend(
  data: FrontedSheet,
  cellMetaMap: CellMetaMap
): VirtualCells {
  
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
    cellMetaMap
  );
}


export function createHeaderVC(headerType:HeaderType, mainVC: VirtualCells): VirtualCells {
  const nRow = headerType === "row" ? mainVC.sheetSize.nRow : 1;
  const nCol = headerType === "row" ? 1 : mainVC.sheetSize.nCol;
  const sheetName = headerType === "row" ? `${mainVC.sheetName}-row-header` : `${mainVC.sheetName}-col-header`;

  const VC = new VirtualCells(
    sheetName,
    mainVC.gridType,
    { nRow, nCol },
    mainVC.cellWidth,
    mainVC.cellHeight,
    [], // 先給空 因為我們需要的是 ref to VirtualCells
    [],
    [],
    {}
  );

  VC.cellMetaMap = mainVC.cellMetaMap;

  // ✅ 將 rowHeaderMap 賦值給 rowVC 的 cellsMap
  VC.cellsMap = headerType === "row" ? mainVC.rowHeaderMap! : mainVC.colHeaderMap!;

  return VC;
}
