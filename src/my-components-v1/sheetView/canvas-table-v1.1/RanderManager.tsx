import { Cell } from "./Cell";
import { createRoot } from "react-dom/client";
import { DirtyTranslateCellScheduler } from "./Dirty/DirtyTranslateCellScheduler";
import { DirtyCellContentScheduler } from "./Dirty/DirtyCellContentScheduler";
import { RefObject } from "react";
import { IVirtualCells } from "../../IVirtualCells";

// render-manager
export class RManager {
  private cellWidth: number;
  private rowHeight: number;
  private container: HTMLElement;

  private domPool: Map<string, HTMLElement> = new Map();

  transformScheduler: DirtyTranslateCellScheduler;
  contentScheduler: DirtyCellContentScheduler;

  constructor(rowHeight: number, cellWidth: number, container: HTMLElement, vcRef: RefObject<IVirtualCells> ) {
    this.cellWidth = cellWidth;
    this.rowHeight = rowHeight;
    this.container = container;
    this.transformScheduler = new DirtyTranslateCellScheduler(this.rowHeight, this.cellWidth);
    this.contentScheduler = new DirtyCellContentScheduler(vcRef);
  }

  private initCellStyle(el: HTMLElement, cellWidth: number, rowHeight: number) {
    el.style.position = "absolute";
    el.style.width = `${cellWidth}px`;
    el.style.height = `${rowHeight}px`;
    el.style.boxSizing = "border-box";
    el.style.border = "1px solid #ddd";       // 可拿掉或改由 CSS 控制
    el.style.contain = "strict";              
    el.style.overflow = "hidden";             // 防止內容溢出
    el.style.willChange = "transform";
    el.style.top = "0px";
    el.style.left = "0px";
    el.style.textRendering = "geometricPrecision";
    el.style.display = "flex";
    el.style.alignItems ='center';
    el.style.justifyContent = 'center'; 
  }

  mountCell(cell: Cell) {
    let el = this.domPool.get(cell.shellId);
    if(el) return el;

    el = document.createElement("div");
    this.initCellStyle(el, this.cellWidth, this.rowHeight);
    // mount 上去
    this.container.appendChild(el);
    this.domPool.set(cell.shellId, el);
    cell.valueRef.el = el;

    if(cell.valueRef.reactRoot) return;
    const root = createRoot(el);
    cell.valueRef.reactRoot = root;    
    this.transformScheduler.markDirty(cell);
    this.contentScheduler.markDirty(cell);
  }

  /** 卸載：清除 DOM 與 ReactRoot */
  unmountCell(cell: Cell): void {
    const el = cell.valueRef.el;
    if (el && el.parentElement === this.container) {
      cell.valueRef.reactRoot?.unmount(); // ✅ 卸載 React 元件
      this.container.removeChild(el);
    }

    this.domPool.delete(cell.shellId);
    cell.valueRef.el = undefined;
    cell.valueRef.reactRoot = undefined;
    // dirtyContent 也要清除
    this.contentScheduler.dirtyCells.delete(cell);
  }

  markDirty(cell: Cell): void {
    this.transformScheduler.markDirty(cell);
    this.contentScheduler.markDirty(cell);
  }

  flush(): void {    
    // 移動要最先
    this.transformScheduler.flush();
    this.contentScheduler.flush();
  }

  clear(): void {
    this.transformScheduler.clear();
    this.contentScheduler.clear();
  }

}