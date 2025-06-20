import { Cell, CellPool, NestedPool } from "./Cell";

export interface INestedPoolController {
  pool: NestedPool;
  fromTopToBottom(): void;
  fromBottomToTop(): void;
  fromLeftToRight(): void;
  fromRightToLeft(): void;
}


export class NestedPoolController implements INestedPoolController {
  pool: NestedPool;
  rowHeight: number = 44;
  cellWidth: number = 112;

   /**
   * Initializes the style and transform for a given cell.
   * @param cell The Cell object to initialize.
   * @param _r The row index (unused, but kept for forEach compatibility).
   * @param _c The column index (unused, but kept for forEach compatibility).
   */
  private _initializeCell(cell: Cell): void {
    // Only apply transform if not already set
    if (cell.valueRef.transX !== null && cell.valueRef.transY !== null) return;

    const coord = cell.indexPath;
    const el = cell.valueRef.el;

    el.style.height = `${this.rowHeight}px`;
    el.style.width = `${this.cellWidth}px`;
    el.style.boxSizing = "border-box";
    el.style.border = "1px solid #ddd";

    const row = coord[coord.length - 2];
    const col = coord[coord.length - 1];

    const transX = col * this.cellWidth;
    const transY = row * this.rowHeight;

    // Update transform and cache state
    el.style.transform = `translate3d(${transX}px, ${transY}px, 0px)`;
    cell.valueRef.transX = transX;
    cell.valueRef.transY = transY;
  }

  initializePosition() {
    this.pool.forEach((cell, _r, _c) => this._initializeCell(cell));
  }

  _updateCellPosition(cell: Cell) {
    const coord = cell.indexPath;
    const el = cell.valueRef.el;
    
    if (!el || coord.length < 2) return;

    const row = coord[coord.length - 2];
    const col = coord[coord.length - 1];


    const transX = col * this.cellWidth;
    const transY = row * this.rowHeight;

    // 若位置沒變，不更新 transform
    if (cell.valueRef.transX === transX && cell.valueRef.transY === transY) return;

    // 更新 transform 與快取
    el.style.transform = `translate3d(${transX}px, ${transY}px, 0px)`;
    cell.valueRef.transX = transX;
    cell.valueRef.transY = transY;
  }

  constructor(pool: NestedPool, rowHeight?: number, cellWidth?:number) {
    this.pool = pool;
    if(rowHeight ) this.rowHeight = rowHeight;
    if(cellWidth) this.cellWidth = cellWidth;
    this.initializePosition();
  }

  getCell(row: number, col: number): Cell | undefined {
    if (row < 0 || row >= this.pool.size) return undefined;
    if (col < 0 || col >= this.pool.innerSize) return undefined;
    return this.pool.children[row].children[col];
  }

  resize(newDim: [row: number, col: number], container: HTMLElement) {
    this.pool.resize(newDim, container);
    this.initializePosition();
  }


  fromTopToBottom(): void {
    const lastRowFirstCell: Cell | undefined = this.getCell(this.pool.size - 1, 0);
    const topRow: CellPool | undefined = this.pool.children.shift();
    // check CellPool ans Cell Exist 
    if(!topRow || !lastRowFirstCell) return;
    // last row first column
    const lrfc = lastRowFirstCell.indexPath;
    // lrfc.length-2 is the place of row index
    const lastRowIndex = lrfc[lrfc.length-2];
    // update indexPath
    topRow.forEach(
      (cell, _i) => { 
        cell.indexPath[lrfc.length-2] = lastRowIndex + 1; 
        this._updateCellPosition(cell);
      }
    );
    // put new Row to buttom
    this.pool.children.push(topRow);
  }

  fromBottomToTop(): void {
    const firstRowFirstCell: Cell | undefined = this.getCell(0, 0);
    const bottomRow: CellPool | undefined = this.pool.children.pop();
    if(!bottomRow || !firstRowFirstCell) return;
    const frfc = firstRowFirstCell.indexPath;
    const firstRowIndex = frfc[frfc.length-2];
    bottomRow.forEach(
      (cell, _i) => { 
        cell.indexPath[frfc.length-2] = firstRowIndex - 1;
        this._updateCellPosition(cell);
      }
    )
    this.pool.children.unshift(bottomRow);
  }

  fromLeftToRight(): void {
    for(const row of this.pool.children) { 
      const lastCellIndex = row.children[row.size-1].indexPath;
      const n = lastCellIndex.length;
      const lastColIndex = lastCellIndex[n-1];
      // pop 出第一個
      const firstCell = row.children.shift();
      if(!firstCell) return; // 代表後續的都會有問題所以直接 return 不 continue
      firstCell.indexPath[n-1] = lastColIndex + 1;
      this._updateCellPosition(firstCell);
      // 放到最後一個
      row.children.push(firstCell);
    }
  }

  fromRightToLeft(): void {
    for(const row of this.pool.children) {
      const firstCellIndex = row.children[0].indexPath;
      const n = firstCellIndex.length;
      const firstColIndex = firstCellIndex[n-1];
      // pop 出最後一個
      const lastCell = row.children.pop();
      if(!lastCell) return;
      lastCell.indexPath[n-1] = firstColIndex - 1;
      this._updateCellPosition(lastCell);
      row.children.unshift(lastCell);
    }
  }

  scrollVerticalBy(n: number) {
    if (n === 0) return;

    const pool = this.pool;
    const poolSize = pool.size;

    // 超過 pool 大小就直接整體偏移
    if (Math.abs(n) >= poolSize) {
      pool.forEach((cell) => {
        const idxL = cell.indexPath.length;
        cell.indexPath[idxL - 2] += n;
        this._updateCellPosition(cell);
      });
      return;
    }

    // 小範圍平移：使用 pool reuse
    const moveFn = n > 0 ? this.fromTopToBottom : this.fromBottomToTop;
    const steps = Math.abs(n);
    for (let i = 0; i < steps; i++) {
      moveFn.call(this);
    }
  }

  scrollHorizontalBy(n: number) {
    if (n === 0) return;
    
    const pool = this.pool;
    const poolInnerSize = pool.innerSize;

    // 超過 pool 大小就直接整體偏移
    if (Math.abs(n) >= poolInnerSize) {
      pool.forEach((cell) => {
        const idxL = cell.indexPath.length;
        cell.indexPath[idxL - 1] += n;
        this._updateCellPosition(cell);
      });
      return;
    }

    // 小範圍平移：使用 pool reuse
    const moveFn = n > 0 ? this.fromLeftToRight : this.fromRightToLeft;
    const steps = Math.abs(n);
    for (let i = 0; i < steps; i++) {
      moveFn.call(this);
    }
  }
}