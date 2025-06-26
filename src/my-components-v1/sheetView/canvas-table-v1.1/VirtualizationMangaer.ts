import { Cell, NestedPool } from "./Cell";
import { NestedPoolController } from "./PoolController";

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
}

export class VManager implements IVirtualizationManager {
  nplctrler: NestedPoolController; // poolController
  cellMap: Map<string, Cell> = new Map();

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
  rowHeight: number = 0;
  cellWidth: number = 0;

  constructor (
    containerDims: {width: number, height: number},
    dataTotalRow: number,
    dataTotalCol: number,
    rowHeight: number,
    cellWidth: number,
    overScanRow: number = 0,
    overScanCol: number = 0,
  ) {
    this.containerDims = containerDims;
    this.overScanRow = overScanRow;
    this.overScanCol = overScanCol;
    this.dataTotalRow = dataTotalRow;
    this.dataTotalCol = dataTotalCol;
    this.rowHeight = rowHeight;
    this.cellWidth = cellWidth;

    const nums = this.numToCover();
    
    const npl = new NestedPool([nums.nRow + 2*this.overScanRow, nums.nCol + 2*this.overScanCol])      
    this.nplctrler = new NestedPoolController(npl)

    this._buildCellMap()
    this.setPoolInfo()
  }

  numToCover = () => {
    const dims = this.containerDims;
    
    let nRow = Math.ceil(dims.height / this.rowHeight) + 2;
    nRow = (this.dataTotalRow / nRow < 2) ? this.dataTotalRow : nRow ;

    let nCol = Math.ceil(dims.width / this.cellWidth) + 2;
    nCol = (this.dataTotalCol / nCol < 2) ? this.dataTotalCol : nCol ;

    return ({nRow, nCol})
  };

  setContainerDims(containerDims: {width: number, height: number}) {
    this.containerDims = containerDims;
    const nums = this.numToCover();
    const diff = this.nplctrler.resize([nums.nRow + 2*this.overScanRow, nums.nCol + 2*this.overScanCol]);
    this.setPoolInfo()
    diff.added.map((cell) => this.cellMap.set(cell.shellId, cell));
    diff.deleted.map((cell) => this.cellMap.delete(cell.shellId));
    return diff;
  }

  setPoolInfo() {

    this.topRowIndex = this.nplctrler.pool.startRowIndex;
    this.leftColIndex = this.nplctrler.pool.startColIndex;
    this.bottomRowIndex = this.topRowIndex + this.nplctrler.pool.size - 1 ;
    this.rightColIndex = this.leftColIndex + this.nplctrler.pool.innerSize - 1;

    this.coverTopRowIndex = this.topRowIndex + this.overScanRow;
    this.coverBottomRowIndex = this.bottomRowIndex - this.overScanRow;
    this.coverLeftColIndex = this.leftColIndex + this.overScanCol;
    this.coverRigthColIndex = this.rightColIndex - this.overScanCol;
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

    return updatedCells;
  }
  
  getAllCells() {
    return this.nplctrler.pool.map((cell) => cell).flat();
  }
}