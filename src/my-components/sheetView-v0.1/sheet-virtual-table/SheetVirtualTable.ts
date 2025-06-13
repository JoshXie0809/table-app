import { RefObject } from "react";
import { getCellNoCheck, getColumnHeaderNoCheck, getRowHeaderNoCheck, Sheet, sheetSize } from "../../sheet/sheet";
import { Cell } from "../../cell/cellPluginSystem";

interface SheetVirtualTable {
  /**
   * 設定底層的 Sheet 資料物件。
   * Sheet 的具體類型取決於你的實作。
   */
  sheet: Sheet;
  
  /**
   * 設定或獲取目前可視區域的資訊。
   * 具體結構可能包含起始和結束的行列索引。
   */
  visibleRange: {
    startRow: number;
    startColumn: number;
    endRow: number;
    endColumn: number;
  };

  /**
   * 更新可視區域的範圍。
   * 傳入目前的捲動資訊
   */
  updateVisibleRange(
    scrollLeft: number,
    scrollTop: number,
    canvasWidth: number,
    canvasHeight: number,
  ): void;


  /**
   * 獲取目前可視區域的所有 Cell 資料，以二維陣列的形式返回。
   * @returns 可視區域的資料陣列。
   */
  getVisibleData(): Cell[][];

  /**
   * 獲取目前可視區域的所有 Column, Row, Header 資料，以陣列的形式返回。
   * @returns 可視區域的資料陣列。
   */
  getVisibleColumnHeader(): string[]
  getVisibleRowHeader(): string[]



  /**
   * 當 Cell 的資料需要被更新時調用的回調函式。
   * @param row 行索引。
   * @param column 列索引。
   * @param newValue 新的 Cell 資料。
   */
  onCellDataChanged?: (row: number, column: number, newValue: any) => void;

}

export class SheetVirtualTableImpl implements SheetVirtualTable {
  sheet: Sheet;
  containerRef: RefObject<HTMLElement>;
  visibleRange: { startRow: number; startColumn: number; endRow: number; endColumn: number; } 
    = { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 };
  
  onCellDataChanged: ((row: number, column: number, newValue: any) => void) | undefined;
  constructor(
    sheet: Sheet,
    containerRef: RefObject<HTMLElement>,
    onCellDataChanged?: (row: number, column: number, newValue: any) => void,
  ) {
    this.sheet = sheet;
    this.containerRef = containerRef;
    this.onCellDataChanged = onCellDataChanged;
  }

  updateVisibleRange(
    scrollLeft: number,
    scrollTop: number,
    canvasWidth: number,
    canvasHeight: number,
  ): void 
  {
    const cellHeight = this.sheet.sheetCellHeight;
    const cellWidth = this.sheet.sheetCellWidth;
    const [nRow, nCol] = sheetSize(this.sheet);

    const startRow = Math.max(Math.floor(scrollTop / cellHeight), 0);
    const endRow = Math.min(Math.ceil((scrollTop + canvasHeight) / cellHeight), nRow);

    const startColumn = Math.max(Math.floor(scrollLeft / cellWidth), 0);
    const endColumn = Math.min(Math.ceil((scrollLeft + canvasWidth) / cellWidth), nCol);

    this.visibleRange = { startRow, startColumn, endRow, endColumn }
  }


  private getSheetCellData(row: number, column: number): Cell {
    return getCellNoCheck( this.sheet, row, column)
  }

  private getSheetColumnHeader(column: number) {
    return getColumnHeaderNoCheck(this.sheet, column);
  }

  private getSheetRowHeader(row: number) {
    return getRowHeaderNoCheck(this.sheet, row);
  }


  getVisibleData(): Cell[][] 
  {
    const visibleData: Cell[][] = [];

    for (let i = this.visibleRange.startRow; i < this.visibleRange.endRow; i++) {
      const rowData: Cell[] = [];
      for (let j = this.visibleRange.startColumn; j < this.visibleRange.endColumn; j++) {
        rowData.push(this.getSheetCellData(i, j));
      }
      visibleData.push(rowData);
    }
    return visibleData;
  }

  

  getVisibleColumnHeader(): string[]
  {
    const visibleColumnHeaders: string[] = [];

    for(let j = this.visibleRange.startColumn; j < this.visibleRange.endColumn; j++)
      visibleColumnHeaders.push(this.getSheetColumnHeader(j))

    return visibleColumnHeaders;
 
  }

  getVisibleRowHeader(): string[] {
    const visibleRowHeaders: string[] = [];
    for (let i = this.visibleRange.startRow; i < this.visibleRange.endRow; i++)
      visibleRowHeaders.push(this.getSheetRowHeader(i))

    return visibleRowHeaders;
  } 

  setSheet(newSheet: Sheet) {
    this.sheet = newSheet;;
  }
}