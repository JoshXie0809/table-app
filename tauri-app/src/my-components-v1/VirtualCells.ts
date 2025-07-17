import { getDisplayValue } from "../tauri-api/getDisplayValue";

import { CellContent } from "../tauri-api/types/CellContent";
import { CellMeta } from "../tauri-api/types/CellMeta";
import { CellMetaMap } from "../tauri-api/types/CellMetaMap";

import { DisplayCellResult } from "../tauri-api/types/DisplayCellResult";
import { ICell } from "../tauri-api/types/ICell";
import { IVirtualCells } from "./IVirtualCells";


export class VirtualCells implements IVirtualCells {
  cellsMap: Map<string, CellContent> = new Map();
  rowHeaderMap: Map<string, CellContent> = new Map(); 
  colHeaderMap: Map<string, CellContent> = new Map();
  cellMetaMap: Map<string, CellMeta | undefined>;

  private dirtyCells: Set<string> = new Set();
  constructor(
    readonly sheetName: string,
    readonly gridType: string,
    readonly sheetSize: { nRow: number; nCol: number },
    readonly cellWidth: number,
    readonly cellHeight: number,
    cells: [string, CellContent][],
    rowHeader: [string, CellContent][],
    colHeader: [string, CellContent][],
    cellMetaMap: CellMetaMap,
  ) {
    cells.forEach(cell => this.cellsMap.set(cell[0], cell[1]));
    rowHeader.forEach(cell => this.rowHeaderMap.set(cell[0], cell[1]));
    colHeader.forEach(cell => this.colHeaderMap.set(cell[0], cell[1]));
    this.cellMetaMap = new Map(Object.entries(cellMetaMap));
  }

  toKey(row: number, col: number): string {
    return `${row},${col}`;
  }

  toRC(key: string): { row: number; col: number } {
    const [r, c] = key.split(',').map(Number);
    if (isNaN(r) || isNaN(c)) throw new Error(`Invalid key: ${key}`);
    return { row: r, col: c };
  }

  setCell(cell: ICell): void {
    this.setCellByCoord(cell.row, cell.col, cell.cellData);
  }

  setCellByCoord(row: number, col: number, cellContent: CellContent): void {
    this.cellsMap.set(this.toKey(row, col), cellContent);
  }

  getCell(row: number, col: number): CellContent | undefined {
    return this.cellsMap.get(this.toKey(row, col));
  }

  getDefaultCell() :CellContent | undefined {
    const textCellMeta = this.cellMetaMap.get("Text");
    if(textCellMeta === undefined) return undefined;
    return textCellMeta.defaultCellContent;
  }

  getCellDisplayValue(row: number, col: number): string | null {
    let cell = this.getCell(row, col);
    // 暫定邏輯 要改成去取得 textCell default value
    if (!cell) cell = this.getDefaultCell();
    // 如果 meta 出問題
    if (!cell) return ""

    // 檢查對應 plugin 是否含有 formatter
    // 沒有的話直接回傳 value 當作 displayvalue
    if( !this.hasCellFormatter(cell) )  return String(cell.payload.value);
    
    // 如果有 formatter
    // 檢查是否有 displayValue
    if(cell.payload.displayValue) return cell.payload.displayValue;
    // 如果沒有在 markdirty
    this.markDirty(row, col);
    return null;
    
  }

  hasCellFormatter(cell: CellContent | undefined) {
    if(!cell) return false;
    const type = cell.type;
    const cellMeta = this.cellMetaMap.get(type);
    if( !cellMeta ) return false;
    if( cellMeta.hasDisplayFormatter === null) return false;
    return cellMeta.hasDisplayFormatter;
  }

  getCellDisplayStyleClass(row: number, col: number): string {
    let cell = this.getCell(row, col);
    if(!cell) cell = this.getDefaultCell();
    if(!cell) return "";
    
    if(Object.hasOwn(cell.payload, "displayStyleClass")) {
      const styleClass = cell.payload.displayStyleClass!;
      return styleClass;
    }
    const type = cell.type;
    const cellMeta = this.cellMetaMap.get(type);
    if(!cellMeta) return ""
    if(cellMeta.displayStyleClass !== null) return cellMeta.displayStyleClass;
    return "";
  }

  hasCell(row: number, col: number): boolean {
    return this.cellsMap.has(this.toKey(row, col));
  }

  deleteCell(row: number, col: number): void {
    const key = this.toKey(row, col);
    this.cellsMap.delete(key);
    this.dirtyCells.delete(key);
  }

  markDirty(row: number, col: number): void {
    this.dirtyCells.add(this.toKey(row, col));
  }

  getDirtyKeys(): string[] {
    return [...this.dirtyCells];
  }

  clearDirty(): void {
    this.dirtyCells.clear();
  }

  async requestDisplayValueAndUpdate() {
    const cells: ICell[] = []
    this.dirtyCells.forEach((v) => {
      const {row, col} = this.toRC(v);
      const cellData = this.getCell(row, col);
      if(!cellData) return;
      cells.push({row, col, cellData});
    })

    const res = await getDisplayValue({cells});
    if(!res.success) return;
    res.data!.forEach(d => this.applyDisplayResult(d))
  }
  
  private applyDisplayResult(result: DisplayCellResult): void {
    const { row, col, ok, displayValue, error } = result;
    const cell = this.getCell(row, col);
    if (!cell) return;

    cell.payload.displayValue = ok ? displayValue : error;
    this.setCell({ row, col, cellData: cell });
    this.dirtyCells.delete(this.toKey(row, col));
  }
}
