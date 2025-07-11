import { Cell, CellPool, NestedPool } from "./Cell";

export interface INestedPoolController {
  pool: NestedPool;
  fromTopToBottom(): Cell[];
  fromBottomToTop(): Cell[];
  fromLeftToRight(): Cell[];
  fromRightToLeft(): Cell[];
}


export class NestedPoolController implements INestedPoolController {
  pool: NestedPool;
  
  constructor(pool: NestedPool) {
    this.pool = pool;
  }

  getCell(row: number, col: number): Cell | undefined {
    if (row < 0 || row >= this.pool.size) return undefined;
    if (col < 0 || col >= this.pool.innerSize) return undefined;
    return this.pool.children[row].children[col];
  }

  resize(newDim: [row: number, col: number]) {
    const diff = this.pool.resize(newDim);
    return diff;
  }


  fromTopToBottom(): Cell[] {
    const lastRowFirstCell: Cell | undefined = this.getCell(this.pool.size - 1, 0);
    const topRow: CellPool | undefined = this.pool.children.shift();
    const updatedCells: Cell[] = [];

    // check CellPool ans Cell Exist 
    if(!topRow || !lastRowFirstCell) return updatedCells;
    // last row first column
    const lrfc = lastRowFirstCell.indexPath;
    // lrfc.length-2 is the place of row index
    const lastRowIndex = lrfc[lrfc.length-2];
    // update indexPath
    topRow.forEach(
      (cell, _i) => { 
        cell.indexPath[lrfc.length-2] = lastRowIndex + 1; 
        // this._updateCellPosition(cell);  // 改成統一由 sceduler 處理
        updatedCells.push(cell);
      }
    );
    // put new Row to buttom
    this.pool.children.push(topRow);
    
    // 設定 pool 的 startRow 改變
    this.pool.startRowIndex += 1;

    return updatedCells;
  }

  fromBottomToTop(): Cell[] {
    const updatedCells: Cell[] = [];

    const firstRowFirstCell: Cell | undefined = this.getCell(0, 0);
    const bottomRow: CellPool | undefined = this.pool.children.pop();
    if(!bottomRow || !firstRowFirstCell) return updatedCells;

    const frfc = firstRowFirstCell.indexPath;
    const firstRowIndex = frfc[frfc.length-2];
    bottomRow.forEach(
      (cell, _i) => { 
        cell.indexPath[frfc.length-2] = firstRowIndex - 1;
        // this._updateCellPosition(cell);
        updatedCells.push(cell);
      }
    )
    this.pool.children.unshift(bottomRow);

    this.pool.startRowIndex -= 1;
    return updatedCells;
  }

  fromLeftToRight(): Cell[] {
    const updatedCells: Cell[] = [];

    for(const row of this.pool.children) { 
      const lastCellIndex = row.children[row.size-1].indexPath;
      const n = lastCellIndex.length;
      const lastColIndex = lastCellIndex[n-1];
      // pop 出第一個
      const firstCell = row.children.shift();
      if(!firstCell) return updatedCells; // 代表後續的都會有問題所以直接 return 不 continue
      firstCell.indexPath[n-1] = lastColIndex + 1;
      updatedCells.push(firstCell);
      // 放到最後一個
      row.children.push(firstCell);
      row.startColIndex += 1;
    }

    this.pool.startColIndex += 1;
    return updatedCells;
  }

  fromRightToLeft(): Cell[] {
    const updatedCells: Cell[] = [];

    for(const row of this.pool.children) {
      const firstCellIndex = row.children[0].indexPath;
      const n = firstCellIndex.length;
      const firstColIndex = firstCellIndex[n-1];
      // pop 出最後一個
      const lastCell = row.children.pop();
      if(!lastCell) return updatedCells;
      lastCell.indexPath[n-1] = firstColIndex - 1;
      updatedCells.push(lastCell);
      row.children.unshift(lastCell);
      row.startColIndex -= 1;
    }
    this.pool.startColIndex -= 1;
    return updatedCells;
  }

  scrollVerticalBy(n: number): Cell[] {
    const updatedCells: Cell[] = [];
    if (n === 0) return updatedCells;

    const pool = this.pool;
    const poolSize = pool.size;

    // 超過 pool 大小就直接整體偏移
    if (Math.abs(n) >= poolSize) {
      pool.forEach((cell) => {
        const idxL = cell.indexPath.length;
        cell.indexPath[idxL - 2] += n;
        updatedCells.push(cell);
      });
      this.pool.startRowIndex += n;
      return updatedCells;
    }

    // 小範圍平移：使用 pool reuse
    const moveFn = n > 0 ? this.fromTopToBottom : this.fromBottomToTop;
    const steps = Math.abs(n);
    for (let i = 0; i < steps; i++) {
      const uCells = moveFn.call(this);
      updatedCells.push(...uCells);
    }

    return updatedCells;
  }

  scrollHorizontalBy(n: number): Cell[] {
    const updatedCells: Cell[] = [];

    if (n === 0) return updatedCells;

    const pool = this.pool;
    const poolInnerSize = pool.innerSize;

    // 超過 pool 大小就直接整體偏移
    if (Math.abs(n) >= poolInnerSize) {
      pool.forEach((cell) => {
        const idxL = cell.indexPath.length;
        cell.indexPath[idxL - 1] += n;
        updatedCells.push(cell);
      });
      
      for(const row of this.pool.children) row.startColIndex += n;      
      this.pool.startColIndex += n;
      return updatedCells;
    }

    // 小範圍平移：使用 pool reuse
    const moveFn = n > 0 ? this.fromLeftToRight : this.fromRightToLeft;
    const steps = Math.abs(n);
    for (let i = 0; i < steps; i++) {
      const uCells = moveFn.call(this);
      updatedCells.push(...uCells);
    }
    
    return updatedCells;
  }
}