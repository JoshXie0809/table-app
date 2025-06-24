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
