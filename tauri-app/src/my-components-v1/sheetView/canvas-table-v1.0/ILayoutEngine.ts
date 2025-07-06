// import { IVirtualPool, VirtualPool } from "./IVirtualPool";



// export interface ILayoutEngine {
//   rowPool: IVirtualPool;
//   containerDims: {width: number, height: number};
//   overScan: number;
//   neededRowsToCover: () => number;
//   // 最差情況需要動用多少 Row 去覆蓋視窗

//   totalRows: number; // 資料總共有幾個 Rows (包含標頭 )
//   rowHeight: number; // = RowPool.top
//   // 所以 RowPool 的 Row 行數 : overScan + neededRowsToCover() + overScan
//   top: number // = rowPool.top
//   contentTop: number; // this.top + rowHeight * onverScan
//   contentBottom: number; // this.bottom - rowHeight * overScan
//   bottom: number; // = rowPool.bottom

//   // 根據傳入的 scroolTop 跟新 rowPool 內的 virtual row 排版
//   updateLayout: (scrollTop: number) => void;
// }

// export class LayoutEngine implements ILayoutEngine {
//   containerDims: {width: number, height: number};
//   overScan: number;
//   totalRows: number; 
//   rowHeight: number; 
//   top: number;
//   contentTop: number; 
//   contentBottom: number; 
//   bottom: number; 
//   rowPool: IVirtualPool;

//   neededRowsToCover = (): number => {
//     const totalHeight = this.rowHeight * this.totalRows;
//     const containerHeight = this.containerDims.height;

//     // row 數太少不用考慮 直接做滿
//     if (totalHeight / containerHeight < 2.5) {
//       this.overScan = 0;
//       return this.totalRows;
//     }

//     return Math.ceil(containerHeight / this.rowHeight) + 2;
//   }

//   updateFourNumbers = () => {
//     this.top = this.rowPool.top;
//     this.contentTop = this.top + this.overScan * this.rowHeight
//     this.bottom = this.rowPool.bottom;
//     this.contentBottom = this.bottom - this.overScan * this.rowHeight;
//   }

//   constructor (
//     containerDims: {width: number, height: number}, 
//     overScan: number, 
//     totalRows: number, 
//     rowHeight: number, 
//     totalWidth: number,
//     container: HTMLElement,
//   ) {
//     this.containerDims = containerDims;
//     this.overScan = overScan;
//     this.totalRows = totalRows;
//     this.rowHeight = rowHeight;

    
//     this.rowPool = new VirtualPool(
//       rowHeight, 
//       2 * overScan + this.neededRowsToCover(),
//       totalWidth,
//       container
//     )

//     this.top = this.rowPool.top;
//     this.contentTop = this.top + this.overScan * this.rowHeight
//     this.bottom = this.rowPool.bottom;
//     this.contentBottom = this.bottom - this.overScan * this.rowHeight;

//   }

//   updateLayout = (scrollTop: number) => {
//     // 把 cover 區頂部 移動到覆蓋 螢幕頂部的距離
//     const targetLength = this.contentTop - scrollTop;
//     // this.top 代表虛擬 rowPool 還剩下多少空 間可插入 row,
//     const residLength = this.top
//     // 如果剩餘空間夠就有多餘就可以行動
//     // 沒有就 return
//     if(targetLength > residLength) return;
//     // 現在這個區域代表不是在頂部的情況

//     // 視窗底部到 container 頂端的長度
//     const scrollBottom = scrollTop + this.containerDims.height;
//     // 把 cover 區底部 移動到覆蓋 螢幕底部的距離
//     const targetLengthBottom = scrollBottom - this.contentBottom;
//     const totalHeight = this.totalRows * this.rowHeight;
//     const residLengthBottom = totalHeight - this.bottom;
    
//     if(targetLengthBottom > residLengthBottom) return;

    
//     // 現在這個區域代表不是頂部也並非底部 
//     // 所以現在是有捲動的可能性的區域
    
//     // 有六種情況需要處理 ? 還有一種是不用處理的
//     // !! contentBottom - contentTop > scrollBottom - scrollTop

//     // case 1
//     if(scrollTop < this.top && scrollBottom < this.top) {
//       // fly => 代表整個視窗已經比 virtual RowPool 上面太多 直接更新所有的比較快
//       // 還沒實作
//       Math.ceil(targetLength / this.rowHeight)
//     }
//     else // case 2
//     if(scrollTop < this.top && scrollTop > this.top) {
//       // 這個區域代表視窗範圍已經超過緩衝區但是不太多捲動上去即可
//       // 計算向上捲動 row 數
//       const nR = Math.ceil(targetLength / this.rowHeight);
//       for(let i = 0; i < nR; i++) {
//         // const oldButtomRow
//       }
//     }
//     else // case 3
//     if (scrollTop > this.top && scrollTop < this.contentBottom) {
//       // 這個區域代表視窗範圍位於緩衝區
//       // 所以可以預先做準備
      
//     }



//   };
// }