import { Root } from "react-dom/client";

export type Coord = number[];

export interface ValueRef {
  transX: null | number;
  transY: null | number;
  el?: HTMLElement;
  reactRoot?: Root;
}

export interface Cell {
  shellId: string,
  indexPath: Coord,
  valueRef: ValueRef,
}

export interface Pool<T> {
  size: number,
  children: T[],
  generate(indexPath: number[], genId: () =>string ): {added: Cell[], deleted: Cell[]};
  clear(): Cell[];
  resize(indexPath: Coord, newSize: number, genId: ()=>string ): {added: Cell[], deleted: Cell[]}
  map<U>(fn: (child: T, index: number) => U): U[];
  forEach(fn: (child: T, index: number) => void): void;
}

// one Dimension Pool
export class CellPool implements Pool<Cell> {
  size: number;
  startColIndex: number;
  children: Cell[] = [];

  constructor(size: number, startColIndex = 0) {
    this.size = size;
    this.startColIndex = startColIndex;
  }

  clear(): Cell[] {
    const deleted: Cell[] = [...this.children];
    this.children = [];
    return deleted;
  }

  generate(indexPath: number[], genId: () => string): { added: Cell[], deleted: Cell[] } {
    const added: Cell[] = [];
    const deleted: Cell[] = this.clear();

    for (let i = 0; i < this.size; i++) {
      const shellId = genId();
      const cell: Cell = {
        shellId,
        indexPath: [...indexPath, this.startColIndex + i],
        valueRef: { transX: null, transY: null },
      };

      added.push(cell);
      this.children.push(cell);
    }

    return { added, deleted };
  }

  resize(indexPath: Coord, newSize: number, genId: () => string): { added: Cell[], deleted: Cell[] } {
    const added: Cell[] = [];
    const deleted: Cell[] = [];

    if (newSize < 0) return { added, deleted };

    if (newSize === 0) {
      return { added: [], deleted: this.clear() };
    }

    const diff = newSize - this.size;

    if (diff > 0) {
      for (let i = this.size; i < newSize; i++) {
        const shellId = genId();
        const colIndex = this.startColIndex + i;
        const cell: Cell = {
          shellId,
          indexPath: [...indexPath, colIndex],
          valueRef: { transX: null, transY: null },
        };

        added.push(cell);
        this.children.push(cell);
      }
    }

    if (diff < 0) {
      for (let i = 0; i < -diff; i++) {
        const cell = this.children.pop();
        if (cell) deleted.push(cell);
      }
    }

    this.size = newSize;
    return { added, deleted };
  }

  map<U>(fn: (cell: Cell, index: number) => U): U[] {
    return this.children.map(fn);
  }

  forEach(fn: (cell: Cell, index: number) => void): void {
    this.children.forEach(fn);
  }
}

export class NestedPool {
  size: number;
  innerSize: number;
  startRowIndex: number;
  startColIndex: number;
  children: CellPool[] = [];

  private counter: number = 0;
  private genId = () => `shell-id-${this.counter++}`

  constructor(dims: [row: number, col: number], startRowIndex = 0, startColIndex = 0) {
    this.size = dims[0];
    this.innerSize = dims[1];
    this.startRowIndex = startRowIndex;
    this.startColIndex = startColIndex;
    this.generate([]);
  }

  generate(indexPath: number[]): { added: Cell[], deleted: Cell[] } {
    const totalAdded: Cell[] = [];
    const totalDeleted: Cell[] = [];

    this.children = [];
    for (let i = 0; i < this.size; i++) {
      const globalRowIndex = this.startRowIndex + i;
      const child = new CellPool(this.innerSize, this.startColIndex); // ✅ 傳入 startColIndex
      const diff = child.generate([...indexPath, globalRowIndex], this.genId);
      totalAdded.push(...diff.added);
      totalDeleted.push(...diff.deleted);
      this.children.push(child);
    }

    return { added: totalAdded, deleted: totalDeleted };
  }

  clear(): Cell[] {
    const totalDeleted: Cell[] = [];
    for (const pool of this.children) {
      totalDeleted.push(...pool.clear());
    }

    this.children = [];
    return totalDeleted;
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

  resize(newDim: [newRow: number, newCol: number]): { added: Cell[], deleted: Cell[] } {
    const totalAdded: Cell[] = [];
    const totalDeleted: Cell[] = [];

    const [newRow, newCol] = newDim;
    if (newRow < 0 || newCol < 0) return { added: totalAdded, deleted: totalDeleted };

    if (newRow === 0 || newCol === 0) {
      totalDeleted.push(...this.clear());
      this.size = 0;
      this.innerSize = 0;
      return { added: totalAdded, deleted: totalDeleted };
    }

    // Resize existing rows
    for (let rowIndex = 0; rowIndex < Math.min(newRow, this.children.length); rowIndex++) {
      const globalRowIndex = this.startRowIndex + rowIndex;
      const row = this.children[rowIndex];
      const diff = row.resize([globalRowIndex], newCol, this.genId);
      totalAdded.push(...diff.added);
      totalDeleted.push(...diff.deleted);
    }

    // Add new rows
    for (let rowIndex = this.size; rowIndex < newRow; rowIndex++) {
      const globalRowIndex = this.startRowIndex + rowIndex;
      const newRowPool = new CellPool(newCol, this.startColIndex); // ✅ 傳入 startColIndex
      const { added } = newRowPool.generate([globalRowIndex], this.genId);
      totalAdded.push(...added);
      this.children.push(newRowPool);
    }

    // Remove excess rows
    if (newRow < this.size) {
      for (let i = 0; i < this.size - newRow; i++) {
        const removed = this.children.pop();
        if (removed) {
          totalDeleted.push(...removed.clear());
        }
      }
    }

    this.size = newRow;
    this.innerSize = newCol;

    return { added: totalAdded, deleted: totalDeleted };
  }
}

