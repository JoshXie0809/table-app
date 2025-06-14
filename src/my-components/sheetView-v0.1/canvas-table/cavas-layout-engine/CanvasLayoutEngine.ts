import { Sheet, sheetSize } from "../../../sheet/sheet";

export interface canvasTopLeft {
  x: number;
  y: number;
  w: number;
  h: number;
}


export interface CellLayout {
  // 原始資料的 row, col
  rowIndex: number;
  colIndex: number;
  // 畫布上的位置資訊
  position: canvasTopLeft;
}

export interface HeaderLayout {
  index: number;
  position: canvasTopLeft;
}

export interface IOffset {
  row: number;
  col: number;
}

// 引擎計算後輸出的完整佈局快照
export interface CanvasLayout {
  // 已經加入計算過 Offset 了
  visibleCells: CellLayout[][];
  visibleColumnHeaders: HeaderLayout[];
  visibleRowHeaders: HeaderLayout[];
  Null: CellLayout;
  // 提供 偏移資料
  OffsetData: IOffset;
}


export class CanvasLayoutEngine {
  private sheet: Sheet;
  private cellWidth: number;
  private cellHeight: number;

  private scrollLeft:number = 0;
  private scrollTop:number = 0;
  private viewWidth:number = 0;
  private viewHeight:number = 0;

  constructor(sheet: Sheet) {
    this.sheet = sheet;
    this.cellWidth = sheet.sheetCellWidth || 100;
    this.cellHeight = sheet.sheetCellHeight || 30;
  }

  // 更新指向的 Sheet
  public setSheet(newSheet: Sheet) {
    this.sheet = newSheet;
    this.cellWidth = newSheet.sheetCellWidth || 100;
    this.cellHeight = newSheet.sheetCellHeight || 30;
  }

  public getSheet(): Sheet {
    return this.sheet;
  }

    /**
   * 更新視窗狀態，這是觸發重新計算的主要入口
   * @param scrollLeft 當前水平滾動位置
   * @param scrollTop 當前垂直滾動位置
   * @param viewWidth 視窗寬度
   * @param viewHeight 視窗高度
   */
  public updateViewport(
    scrollLeft: number, scrollTop: number, 
    viewWidth: number, viewHeight: number
  ): void {
    this.scrollLeft = scrollLeft;
    this.scrollTop = scrollTop;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }


  /**
   * 核心方法：執行所有計算並回傳完整的佈局物件
   * @returns {CanvasLayout} 可供繪圖函式直接使用的佈局資訊
   */
  public getLayout(): CanvasLayout {

    // 1. 計算可視範圍 (startRow, endRow, startCol, endCol)
    // 這段邏輯可以從之前的 SheetVirtualTableImpl 中搬過來

    const [nRow, nCol] = sheetSize(this.sheet);

    const startRow = Math.max(Math.floor(this.scrollTop / this.cellHeight), 0);
    const endRow = Math.min(Math.ceil((this.scrollTop + this.viewHeight) / this.cellHeight), nRow);
    const startColumn = Math.max(Math.floor(this.scrollLeft / this.cellWidth), 0);
    const endColumn = Math.min(Math.ceil((this.scrollLeft + this.viewWidth) / this.cellWidth), nCol);
    
    // 2. 計算滾動造成的像素偏移
    const rowOffset = this.scrollTop % this.cellHeight;
    const colOffset = this.scrollLeft % this.cellWidth;

    // 3. 產生所有可視儲存格的佈局資訊
    const visibleCells: CellLayout[][] = [];

    for (let i = startRow; i < endRow; i++) {
      const rowLayout: CellLayout[] = [];
      for (let j = startColumn; j < endColumn; j++) {
        rowLayout.push({
          rowIndex: i,
          colIndex: j,
          position: {
            x: (j - startColumn + 1) * this.cellWidth - colOffset, // +1 是為了留出標頭位置
            y: (i - startRow + 1) * this.cellHeight - rowOffset, // +1 是為了留出標頭位置
            w: this.cellWidth,
            h: this.cellHeight,
          }
        });
      }
      visibleCells.push(rowLayout);
    }

    const visibleColumnHeaders: HeaderLayout[] = [];
    for(let j = startColumn; j < endColumn; j++)
      visibleColumnHeaders.push({
        index: j,
        position: {
          x: (j - startColumn + 1) * this.cellWidth - colOffset,
          y: 0, // 固定在最上面
          w: this.cellWidth,
          h: this.cellHeight,
        }
      })
    
    const visibleRowHeaders: HeaderLayout[] = [];
    for(let i = startRow; i < endRow; i++)
      visibleRowHeaders.push({
        index: i,
        position: {
          y: (i - startRow + 1) * this.cellHeight - rowOffset, 
          x: 0, // 固定在最左邊
          w: this.cellWidth,
          h: this.cellHeight,
        }
      })

    const Null: CellLayout = {
      colIndex: 0,
      rowIndex: 0,
      position: {
        x: 0,
        y: 0,
        w: this.cellWidth,
        h: this.cellHeight
      }
    }

    return({
      visibleCells,
      visibleColumnHeaders,
      visibleRowHeaders,
      Null,
      OffsetData: {
        col: colOffset,
        row: rowOffset,
      }
    })
  }

  public getHeaderWidth() {
    return this.cellWidth;
  }

  public getHeaderHeight() {
    return this.cellHeight
  }

   /**
   * 命中測試：根據畫布座標找出對應的儲存格索引
   */
  public getCellAtPoint(canvasX: number, canvasY: number): { row: number; col: number } | null {
    
   const layout = this.getLayout();
    for (const row of layout.visibleCells) {
      for (const cellLayout of row) {
        const {x, y, w, h} = cellLayout.position; 
        if (
          canvasX >= x && canvasX <= x + w &&
          canvasY >= y && canvasY <= y + h
        ) {
          return { row: cellLayout.rowIndex, col: cellLayout.colIndex };
        }
      }
    }
    return null;
  }

  /**
   * 新增：獲取任意指定儲存格「當前」在畫布上的佈局資訊
   * @param row 儲存格的行索引
   * @param col 儲存格的列索引
   * @returns {CellLayout | null} 如果該儲存格在當前視窗可見，則返回其佈局
   */

  public getCellLayout(row: number, col: number): CellLayout | null {
    const x = col * this.cellWidth - this.scrollLeft + this.getHeaderWidth();
    const y = row * this.cellHeight - this.scrollTop + this.getHeaderHeight();

    // 檢查這個儲存格是否與當前的可視區域有交集
    // (這裡的 this.viewWidth 包含了標頭，所以要減去)
    if (x > this.viewWidth 
      || y > this.viewHeight 
      || x + this.cellWidth < this.getHeaderWidth() 
      || y + this.cellHeight < this.getHeaderHeight()) {
      return null; // 完全在可視範圍外
    }

    return {
      rowIndex: row,
      colIndex: col,
      position: {
        x,
        y,
        w: this.getHeaderWidth(),
        h: this.getHeaderHeight(),
      }
    };
  }


}
