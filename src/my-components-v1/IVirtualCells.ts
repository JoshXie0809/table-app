import { CellContent } from "../tauri-api/types/CellContent";
import { ICell } from "../tauri-api/types/ICell";
// 假設你用的是這個型別，或 CellContent / SheetCell 之類

export interface IVirtualCells {
  readonly sheetName: string;
  readonly gridType: string;

  readonly sheetSize: { nRow: number; nCol: number };
  readonly cellWidth: number;
  readonly cellHeight: number;

  /**
   * 用於從後端傳來的 cell 資料建立快取 Map
   */
  setCell(cell: ICell): void;

  /**
   * 取得某格資料，未載入可能為 undefined
   */
  getCell(row: number, col: number): CellContent | undefined;


  getCellDisplayValue(row: number, col: number): string | null;

  /**
   * 是否存在指定格子（邊界檢查用）
   */
  hasCell(row: number, col: number): boolean;

  /**
   * 標記格子 dirty
   */
  markDirty(row: number, col: number): void;

  /**
   * 回傳所有 dirty cell 的座標 key（"row:col"）
   */
  getDirtyKeys(): string[];

  /**
   * 清空 dirty 記錄，通常在 render 完後執行
   */
  clearDirty(): void;

  /**
   * 將 row, col 座標轉為 key，用於 Map 存取
   */
  toKey(row: number, col: number): string;

  /**
   * 將 key 還原成 row, col
   */
  toRC(key: string): { row: number; col: number };
}
