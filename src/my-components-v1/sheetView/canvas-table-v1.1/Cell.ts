export type Coord = number[];

export interface ValueRef {
  el: HTMLElement;
  transX: null | number;
  transY: null | number;
}

export interface Cell {
  indexPath: Coord,
  valueRef: ValueRef,
}


export interface Pool<T> {
  size: number,
  children: T[],
  generate(indexPath: number[]): void;
  resize(newSize: number, container?: HTMLElement): void
  clear(removeDOM?: boolean, container?: HTMLElement): void;
  map<U>(fn: (child: T, index: number) => U): U[];
  forEach(fn: (child: T, index: number) => void): void;
}

// one Dimension Pool
export class CellPool implements Pool<Cell> {
  size: number;
  children: Cell[] = [];

  constructor(size: number) {
    this.size = size;
  }

  setBaseStyle(el: HTMLElement) {
    el.style.position = "absolute";
    el.style.top =  "0px";
    el.style.left = "0px";
    el.style.willChange = "transform";
  }

  generate(indexPath: number[]): void {
    this.children = [] 
    this.clear(); // delete all 但不處理 dom 的元素

    for(let i = 0; i < this.size; i++) {
      const el = document.createElement("div");
      this.setBaseStyle(el);

      this.children.push({
        indexPath: [...indexPath, i],
        valueRef: {el, transX: null, transY: null},
      })
    }
  }

  /** 手動掛載 DOM 到容器 */
  mount(container: HTMLElement): void {
    for (const cell of this.children) {
      // 沒掛上去才掛
      if(!container.contains(cell.valueRef.el)) 
        container.appendChild(cell.valueRef.el);
    }
  }


  /** 清除所有資料與 DOM */
  clear(removeDOM: boolean = false, container?: HTMLElement): void {
    if (removeDOM) {
      for (const cell of this.children) {
        const el = cell.valueRef?.el;
        if (el instanceof HTMLElement) {
          // ✅ 若 container 有給，僅從指定 container 移除
          if (!container || el.parentNode === container) {
            el.parentNode?.removeChild(el);
          }
        }
      }
    }
    this.children = [];
  }

  map<U>(fn: (child: Cell, index: number) => U): U[] {
    return this.children.map(fn);
  }

  forEach(fn: (child: Cell, index: number) => void): void {
    this.children.forEach(fn);
  }

  resize(newSize: number, container?: HTMLElement): void {
    if (newSize < 0) return;
    if (newSize === 0) {
      this.clear(true, container); // ✅ 同時清除資料與 DOM
      this.size = 0;
      return;
    }

    const diff = newSize - this.size;

    if (diff > 0) {
      const lastIndex = this.children[this.size-1].indexPath;
      for (let i = 0; i < diff; i++) {
        let nowIndex = [...lastIndex];
        // 修改最後一個
        nowIndex[lastIndex.length-1] += 1 + i;

        const el = document.createElement("div");
        this.setBaseStyle(el);
        const cell: Cell = {
          indexPath: nowIndex,
          valueRef: { el, transX: null, transY: null },
        };
        this.children.push(cell);
        // ✅ 如果 container 存在，直接掛載新 DOM
        if (container) {
          container.appendChild(el);
        }
      }
    }

    if (diff < 0) {
      for (let i = 0; i < -diff; i++) {
        const cell = this.children.pop();
        const el = cell?.valueRef?.el;
        if (el instanceof HTMLElement) {
          // ✅ 僅從 container 拆除
          if (!container || el.parentNode === container) {
            el.parentNode?.removeChild(el);
          }
        }
      }
    }

    this.size = newSize;
  }

}

export class NestedPool {
  size: number;
  innerSize: number;
  children: CellPool[] = [];

  constructor(dims: [row: number, col: number]) {
    this.size = dims[0];
    this.innerSize = dims[1];
    this.generate([]);
  }

  generate(indexPath: number[]) {
    this.children = [];
    for (let i = 0; i < this.size; i++) {
      const child = new CellPool(this.innerSize);
      child.generate([...indexPath, i]);
      this.children.push(child);
    }
  }


  /** 手動掛載 DOM 到容器 */
  mount(container: HTMLElement): void {
    for (const pool of this.children) {
      pool.mount(container);
    }
  }

  clear(removeDOM: boolean = false, container?: HTMLElement): void {
    for (const pool of this.children) {
      pool.clear(removeDOM, container);
    }
    this.children = [];
  }

  forEach(fn: (cell: Cell, rowIndex: number, colIndex: number) => void) {
    this.children.forEach((rowPool, rowIndex) => {
      rowPool.forEach((cell, colIndex) => {
        fn(cell, rowIndex, colIndex);
      });
    });
  }

  map<U>(fn: (cell: Cell, rowIndex: number, colIndex: number) => U): U[][] {
    return this.children.map((rowPool, rowIndex) => {
      return rowPool.map((cell, colIndex) => fn(cell, rowIndex, colIndex));
    });
  }
  
  resize(newDim: [newRow: number, newCol: number], container?: HTMLElement): void {
    const [newRow, newCol] = newDim;
    if(newRow < 0 || newCol < 0) return;
    if(newRow === 0 || newCol === 0) {
      this.clear(true, container);
      this.size = 0;
      this.innerSize = 0;
      return;
    }

    // resize col
    for(const row of this.children) {
      row.resize(newCol, container);
    }

    // resize row
    const rowDiff = newRow - this.size;
    if(rowDiff > 0) {
      const lastRowFirstCol: Coord = this.children[this.size-1].children[0].indexPath;
      
      const lastRowIndex = lastRowFirstCol[lastRowFirstCol.length-2];
      const firstColIndex = lastRowFirstCol[lastRowFirstCol.length-1];

      for(let i = 0; i < rowDiff; i++) {
        const child = new CellPool(newCol);
        child.generate([lastRowIndex + 1 + i]);
        if(container) child.mount(container)
        for(let j = 0; j < newCol; j++) 
          child.children[j].indexPath[1] += firstColIndex;

        this.children.push(child);
      }
    }
    if(rowDiff < 0){
      for(let i = 0; i < -rowDiff; i++) {
        const child = this.children.pop();
        child?.clear(true, container);
      }
    }

    this.size = newRow;
    this.innerSize = newCol;
  }
}
