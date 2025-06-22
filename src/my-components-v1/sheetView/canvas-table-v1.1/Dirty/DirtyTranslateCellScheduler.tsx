import { Text } from "@fluentui/react-components";
import { Cell } from "../Cell";

export class DirtyTranslateCellScheduler {
  private dirtyCells = new Set<Cell>();
  private scheduled = false;
  private externalFlush = false; // 是否改為由外部控制 flush
    
  constructor(
    private rowHeight: number,
    private cellWidth: number,
  ) {}

  /** 設定是否由外部控制排程邏輯（true 則不自動 requestAnimationFrame） */
  setExternalFlushMode(external: boolean) {
    this.externalFlush = external;
  }

  markDirty(cell: Cell) {
    this.dirtyCells.add(cell);

    // 若非外部控制，則自動進行一次幀排程
    if (!this.externalFlush && !this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  flush() {
    for(const cell of this.dirtyCells) {
      this._updateTransformIfNeeded(cell)
    }
    this.dirtyCells.clear();
    this.scheduled = false;

  }

  private _updateTransformIfNeeded(cell: Cell) {
    const coord = cell.indexPath;
    const el = cell.valueRef.el;

    if (!el || coord.length < 2) return;

    const row = coord[coord.length - 2];
    const col = coord[coord.length - 1];

    const transX = Math.round(col * this.cellWidth);
    const transY = Math.round(row * this.rowHeight);

    if (cell.valueRef.transX === transX && cell.valueRef.transY === transY) {
      return;
    }

    el.style.transform = `translate3d(${transX}px, ${transY}px, 0px)`;

    const root = cell.valueRef.reactRoot;
    if(!root) return;
    
    const r = cell.indexPath[0];
    const c = cell.indexPath[1];
    const bgc = r % 2 === 0 ? "#ffffff" : "#f7f7f7";
    el.style.backgroundColor = bgc;
    root.render(
      <Text size={500} weight="semibold" font="monospace" align="center" wrap={false}>{`r${r}:c${c}`}</Text>
    );

    cell.valueRef.transX = transX;
    cell.valueRef.transY = transY;
  }
}