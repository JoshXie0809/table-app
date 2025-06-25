import { CellContent } from "../tauri-api/types/CellContent";
import { ICell } from "../tauri-api/types/ICell";
import { IVirtualCells } from "./IVirtualCells";

export class VirtualCells implements IVirtualCells {
  private cellsMap: Map<string, CellContent> = new Map();
  private dirtyCells: Set<string> = new Set();

  constructor(
    readonly sheetName: string,
    readonly gridType: string,
    readonly sheetSize: { nRow: number; nCol: number },
    readonly cellWidth: number,
    readonly cellHeight: number,
    cells: ICell[],
  ) {
    cells.forEach((cell) => this.setCell(cell));
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

  getCellDisplayValue(row: number, col: number): string | null {
    const cell = this.getCell(row, col);
    // 暫定邏輯 要改成去取得 textCell default value
    if(cell === undefined) return "";

    
    if(cell.payload.displayValue)
      return cell.payload.displayValue;
    // display Value 邏輯
    // 如果是 null 要向後端請求 or AST 邏輯發起請求
    else if(cell.payload.displayValue === null) 
      return null;
    // request ...
    // 代表這個 cell-type 沒有 displayValue 這個欄位邏輯 約定直接用 value 代替
    else if(cell.payload.displayStyle === undefined)
      return String(cell.payload.value);
    
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
}
