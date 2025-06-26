import { getDisplayValue } from "../tauri-api/getDisplayValue";
import { CellContent } from "../tauri-api/types/CellContent";
import { DisplayCellResult } from "../tauri-api/types/DisplayCellResult";
import { ICell } from "../tauri-api/types/ICell";
import { IVirtualCells } from "./IVirtualCells";


export class VirtualCells implements IVirtualCells {
  cellsMap: Map<string, CellContent> = new Map();
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
    if (!cell) return "";

    const { displayValue, value } = cell.payload;

    if (displayValue !== undefined && displayValue !== null)
      return displayValue;

    if (displayValue === null) {
      this.markDirty(row, col);
      return null;
    }

    if (displayValue === undefined)
      return String(value);

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
