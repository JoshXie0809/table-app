import { Cell } from "./Cell";
import { createRoot } from "react-dom/client";
import { DirtyTranslateCellScheduler } from "./Dirty/DirtyTranslateCellScheduler";
import { Text } from "@fluentui/react-components";

// render-manager
export class RManager {
  private cellWidth: number;
  private rowHeight: number;
  private container: HTMLElement;

  private domPool: Map<string, HTMLElement> = new Map();
  private dirtyCells = new Set<Cell>() ;

  transformScheduler: DirtyTranslateCellScheduler;

  constructor(rowHeight: number, cellWidth: number, container: HTMLElement) {
    this.cellWidth = cellWidth;
    this.rowHeight = rowHeight;
    this.container = container;
    this.transformScheduler = new DirtyTranslateCellScheduler(this.rowHeight, this.cellWidth);
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
  }

  markDirty(cell: Cell): void {
    this.dirtyCells.add(cell);
    this.transformScheduler.markDirty(cell);
  }

  flush(): void {
    for (const cell of this.dirtyCells) {
      const el = cell.valueRef.el;
      if (!el) continue;

      const row = cell.indexPath[cell.indexPath.length - 2];
      const col = cell.indexPath[cell.indexPath.length - 1];
      
      el.style.transform = `translate3d(${col * this.cellWidth}px, ${row * this.rowHeight}px, 0)`;
      el.style.width = `${this.cellWidth}px`;
      el.style.height = `${this.rowHeight}px`;
      el.style.boxSizing = "border-box";
      
      const root = cell.valueRef.reactRoot;
      if(!root) continue;
      
      const r = cell.indexPath[0];
      const c = cell.indexPath[1];
      root.render(
        <Text size={300} weight="semibold" font="monospace" align="center" wrap={false}>{`${189*r+179*c}`}</Text>
      );
    }

    this.dirtyCells.clear();
  }

}