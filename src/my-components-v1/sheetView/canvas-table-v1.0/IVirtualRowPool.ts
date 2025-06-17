export interface IVirtualRowPool {
  top: number;
  bottom: number;
  rowHeight: number;
  poolSize: number;
  rowPool: IVirtualRow[];

  clearAllRow: (container: HTMLElement) => void;

  // 兩者應該結合使用
  popTop: () => IVirtualRow | undefined; // 排出最前方的 row
  pushBottom: (virtualRow: IVirtualRow) => void; // 從最後方推入 row

  // // 兩者應該結合使用
  popBottom: () => IVirtualRow | undefined; // 排出最後方的 row;
  pushTop: (virtualRow: IVirtualRow) => void; // 從最前方推入 row

  // moveTop: (newTop: number) => void // 移動整個部分 修改所有 RowPool 的值
  // 
}

export interface IVirtualRow {
  el: HTMLElement;
  sheetRowId: number; // 資料 id
  vId: number; // pool id
}


export class VirtualRowPool implements IVirtualRowPool {
  top: number = 0;
  bottom: number = 0;
  rowHeight: number = 0; // fixed row height 加速運算
  poolSize: number = 0;
  rowPool: IVirtualRow[] = [];

  constructor(
    rowHeight: number, poolSize: number, 
    totalWidth: number,
    container: HTMLElement
  ) {
    
    this.rowHeight = rowHeight;
    this.poolSize = poolSize;
    this.bottom = this.top + poolSize * rowHeight;

    for(let i = 0; i < this.poolSize; i++) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.top = `${this.top + i * this.rowHeight}px`;
      el.style.width = `${totalWidth}px`;

      el.style.height = `${this.rowHeight}px`;
      el.innerText = `row: ${i}`;
      el.className = (i % 2) === 0 ? "virtual-row-even" : "virtual-row-odd";
      el.style.boxSizing = "border-box";
      el.style.border = "1px solid #ddd";

      container.appendChild(el);
      let row: IVirtualRow = {
        el: el,
        sheetRowId: i,
        vId: i,
      }

      this.rowPool.push(row)
    }
  }

  public popTop = (): IVirtualRow | undefined =>  {
    // 取出第一個 row
    const topEl = this.rowPool.shift();
    if(!topEl) return undefined;
    this.poolSize -= 1;

    // 因為現在第二row 變成第一row 更新
    this.top += this.rowHeight;
    return topEl;
  };


  public pushBottom = (virtualRow: IVirtualRow) : void => {
    // 改變數據
    // 把這一row位置改到 bottom
    virtualRow.el.style.top = `${this.bottom}px`;
    virtualRow.sheetRowId += this.poolSize + 1;

    this.rowPool.push(virtualRow);
    this.poolSize += 1

    // 更新 bottom 數據
    this.bottom += this.rowHeight
  };

  public popBottom = () : IVirtualRow | undefined => {
    // 取出最後一個 row
    const bottomEl = this.rowPool.pop();
    if(!bottomEl) return undefined;
    this.poolSize -= 1

    // 倒數第二 row 變成最後一個，所以底部向上
    this.bottom -= this.rowHeight;
    return bottomEl;
  }

  public pushTop = (virtualRow: IVirtualRow) : void => {
    // 把這一row位置改到頂部 + row Height
    virtualRow.el.style.top = `${this.top - this.rowHeight}px`;
    virtualRow.sheetRowId -= (this.poolSize + 1);

    this.rowPool.unshift(virtualRow);
    this.poolSize += 1

    // 更新 top 數據
    this.top -= this.rowHeight

  };

  public clearAllRow = (container: HTMLElement) => {
    for (let row of this.rowPool) {
      container.removeChild(row.el);
    }
    this.rowPool = [];
    this.poolSize = 0;
    this.top = 0;
    this.bottom = 0;
  };
}