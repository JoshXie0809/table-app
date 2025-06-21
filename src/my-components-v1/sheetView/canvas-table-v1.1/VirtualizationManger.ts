import { Cell, NestedPool } from "./Cell";
import { NestedPoolController } from "./PoolController";
import { DirtyTranslateCellScheduler } from "./Dirty/DirtyTranslateCellScheduler";

export interface IVirtualizationManager {
  nplctrler: NestedPoolController; // poolController
  containerDims: {width: number, height: number};
  overScanRow: number;
  overScanCol: number;
  numToCover: () => {nRow: number, nCol: number};
  
  dataTotalRow: number;
  dataTotalCol: number;
  rowHeight: number;
  cellWidth: number;
  
  transformScheduler: DirtyTranslateCellScheduler;
}

export class VManager implements IVirtualizationManager {
  nplctrler: NestedPoolController; // poolController
  cellMap: Map<string, Cell> = new Map();

  transformScheduler: DirtyTranslateCellScheduler;

  private _buildCellMap() {
    this.nplctrler.pool.forEach((cell) => {
      this.cellMap.set(cell.shellId, cell);
    })
  }
  
  containerDims: {width: number, height: number};
  overScanRow: number = 0;
  overScanCol: number = 0;

  // pool controller 實際控制的 Cell 位置
  topRowIndex: number = 0;
  bottomRowIndex: number = 0;
  leftColIndex: number = 0;
  rightColIndex: number = 0;

  // cover 區控制的 Cell 位置
  coverTopRowIndex: number = 0;
  coverBottomRowIndex: number = 0;
  coverLeftColIndex: number = 0;
  coverRigthColIndex: number = 0;

  dataTotalRow: number;
  dataTotalCol: number;
  rowHeight: number = 1;
  cellWidth: number = 1;

  constructor (
    containerDims: {width: number, height: number},
    dataTotalRow: number,
    dataTotalCol: number,
    rowHeight: number,
    cellWidth: number,
    container: HTMLElement,
    overScanRow: number = 10,
    overScanCol: number = 2,
  ) {
    this.containerDims = containerDims;
    this.overScanRow = overScanRow;
    this.overScanCol = overScanCol;
    this.dataTotalRow = dataTotalRow;
    this.dataTotalCol = dataTotalCol;
    this.rowHeight = rowHeight;
    this.cellWidth = cellWidth;

    const nums = this.numToCover();
    
    const np = new NestedPool([nums.nRow + 2*this.overScanRow, nums.nCol + 2*this.overScanCol])      
    np.mount(container);

    this.nplctrler = new NestedPoolController(
      np,
      this.rowHeight,
      this.cellWidth,
    )

    this._buildCellMap()
    this.setPoolInfo()
    this.transformScheduler = new DirtyTranslateCellScheduler(this.rowHeight, this.cellWidth);
  }

  numToCover = () => {
    const dims = this.containerDims;
    
    let nRow = Math.ceil(dims.height / this.rowHeight) + 2;
    nRow = (this.dataTotalRow / nRow < 2) ? this.dataTotalRow : nRow ;

    let nCol = Math.ceil(dims.width / this.cellWidth) + 2;
    nCol = (this.dataTotalCol / nCol < 2) ? this.dataTotalCol : nCol ;

    return ({nRow, nCol})
  };

  setContainerDims(containerDims: {width: number, height: number}, container: HTMLElement) {
    this.containerDims = containerDims;
    const nums = this.numToCover();
    const diff = this.nplctrler.resize([nums.nRow + 2*this.overScanRow, nums.nCol + 2*this.overScanCol], container);
    this.setPoolInfo()
    diff.totalAdded.map((cell) => this.cellMap.set(cell.shellId, cell));
    diff.totalDeleted.map((cell) => this.cellMap.delete(cell.shellId));
  }

  setPoolInfo() {
    // firstRow-firstCol-Cell
    const frfcCell = this.nplctrler.getCell(0, 0);
    if(!frfcCell) return;
    // lastRow-lastCol-cell
    const lrlcCell = this.nplctrler.getCell(this.nplctrler.pool.size-1, this.nplctrler.pool.innerSize-1);
    if(!lrlcCell) return;

    const n = frfcCell.indexPath.length;
    const firstRowIndex = frfcCell.indexPath[n-2];
    const firstColIndex = frfcCell.indexPath[n-1];
    const lastRowIndex  = lrlcCell.indexPath[n-2];
    const lastColIndex  = lrlcCell.indexPath[n-1];
    
    this.topRowIndex = firstRowIndex;
    this.leftColIndex = firstColIndex;
    this.bottomRowIndex = lastRowIndex;
    this.rightColIndex = lastColIndex;

    this.coverTopRowIndex = this.topRowIndex + this.overScanRow;
    this.coverBottomRowIndex = this.bottomRowIndex - this.overScanRow;
    this.coverLeftColIndex = this.leftColIndex + this.overScanCol;
    this.coverRigthColIndex = this.rightColIndex - this.overScanCol;
  }

  clearDOM(container: HTMLElement) {
    this.nplctrler.pool.clear(true, container);
  }

  transNum(
    a: number,
    b: number,
    ra: number,
    rb: number,
    ca: number,
    cb: number,
    maxIndex: number,
    overScan: number
  ) {
    const ma = Math.floor(a);
    const mb = Math.ceil(b);

    // --- 向上捲動情況 ---
    if (ma < ca) {
      const ubd = Math.min(0, ma - ca);
      const lbd = Math.max(-ra, overScan - ca, mb - cb); // ⚠️ 注意是負數
      const ans = Math.max(ubd, lbd); // 往上是負數，max 是「靠近 0 的那個」
      return ans;
    }

    // --- 向下捲動情況 ---
    if (mb > cb) {
      const ubd = Math.min(ma - ca, maxIndex - overScan - cb, maxIndex - rb);
      const lbd = Math.max(mb - cb, 0);
      const ans = Math.min(ubd, lbd); // 向下是正數，min 是「靠近 0 的那個」
      return ans;
    }

    return 0;
  }


  solveRowTrans(scrollTop: number) {
    const a = scrollTop / this.rowHeight;
    const b = (scrollTop + this.containerDims.height) / this.rowHeight;
    const ans = this.transNum(a, b, this.topRowIndex, this.bottomRowIndex, 
                              this.coverTopRowIndex, this.coverBottomRowIndex, 
                              this.dataTotalRow-1, this.overScanRow)

    return ans;
  }

  solveColTrans(scrollLeft: number) {
    const a = scrollLeft / this.cellWidth;
    const b = (scrollLeft + this.containerDims.width) / this.cellWidth;
    const ans = this.transNum(a, b, this.leftColIndex, this.rightColIndex, 
                              this.coverLeftColIndex, this.coverRigthColIndex, 
                              this.dataTotalCol-1, this.overScanCol)

    return ans;
  }

  scrollBy(scrollTop: number, scrollLeft: number) {
    const updatedCells: Cell[] = [];
    // Y 軸邏輯
    const transRow = this.solveRowTrans(scrollTop);
    if (transRow !== 0) { // 只有在需要移動時才呼叫
      const uCells = this.nplctrler.scrollVerticalBy(transRow);
      updatedCells.push(...uCells);
    }

    // X 軸邏輯
    const transCol = this.solveColTrans(scrollLeft);
    if (transCol !== 0) { // 只有在需要移動時才呼叫
      const uCells = this.nplctrler.scrollHorizontalBy(transCol);
      updatedCells.push(...uCells);
    }
    
    // setPoolInfo 可能也應該只在有變動時呼叫
    if (transRow !== 0 || transCol !== 0) {
      this.setPoolInfo();
    }

    updatedCells.forEach((cell) => this.transformScheduler.mark(cell) );
  }

}