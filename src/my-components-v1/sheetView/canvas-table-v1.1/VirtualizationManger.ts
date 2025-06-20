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

    renderCells: null | ((batchCells: [{row: number, col: number, cell: Cell}]) => void);
}

export class VManager implements IVirtualizationManager {
    nplctrler: NestedPoolController; // poolController
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

    renderCells: null | ((batchCells: [{row: number, col: number, cell: Cell}]) => void) ;

    constructor (
      containerDims: {width: number, height: number},
      dataTotalRow: number,
      dataTotalCol: number,
      rowHeight: number,
      cellWidth: number,
      container: HTMLElement,
      overScanRow: number = 10,
      overScanCol: number = 2,
      renderCells: null | ((batchCells: [{row: number, col: number, cell: Cell}]) => void) = null,
    ) {
      this.containerDims = containerDims;
      this.overScanRow = overScanRow;
      this.overScanCol = overScanCol;
      this.dataTotalRow = dataTotalRow;
      this.dataTotalCol = dataTotalCol;
      this.rowHeight = rowHeight;
      this.cellWidth = cellWidth;
      this.renderCells = renderCells;

      const nums = this.numToCover();
      
      const np = new NestedPool([nums.nRow + 2*this.overScanRow, nums.nCol + 2*this.overScanCol])      
      np.mount(container);

      this.nplctrler = new NestedPoolController(
        np,
        this.rowHeight,
        this.cellWidth,
      )

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

    setContainerDims(containerDims: {width: number, height: number}, container: HTMLElement) {
      this.containerDims = containerDims;
      const nums = this.numToCover();
      this.nplctrler.resize([nums.nRow + 2*this.overScanRow, nums.nCol + 2*this.overScanCol], container);
      this.setPoolInfo()
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

  transNum(a: number, b: number, _ra: number, rb: number, ca: number, cb: number, maxIndex: number, overScan: number)
  {

    const ma = Math.floor(a);
    const mb = Math.ceil(b);
    
    // ma < ca 代表需要往上捲
    // solution 滿足
    // ca + ans <= ma
    // ra + ans >= 0
    // ca + ans >= overScan
    // ans <= 0
    // cb + ans >= mb

    // ans <= min(0, ma - ca)
    // ans >= max(0 - ra, overScan - ca, mb - cb)

    if(ma < ca) {
      const ubd = Math.min(0, ma-ca);
      // const lbd = Math.max(0-ra, this.overScan-ca, mb-cb);
      return ubd;
    }

    // mb > cb 代表需要往下捲
    // solution 滿足

    // cb + ans >= mb
    // rb + ans <= maxIndex
    // cb + ans <= maxIndex-overScan
    // ans >= 0
    // ca + ans <= ma

    // ans <= min(ma-ca, maxIndex-overScan-cb, maxIndex-rb)
    // ans >= max(mb-cb, 0)

    if(mb > cb) {
      const ubd = Math.min(ma-ca, maxIndex-overScan-cb, maxIndex-rb);
      return ubd
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

}