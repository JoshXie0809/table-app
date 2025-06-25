import { Text } from "@fluentui/react-components";
import { VirtualCells } from "../../../VirtualCells";
import { Cell } from "../Cell";

export class DirtyCellContentScheduler {
  private dirtyCells: Set<Cell> = new Set();
  private scheduled: boolean = false;
  private externalFlush = false; // 是否改為由外部控制 flush

  constructor (private vc: VirtualCells) {}

  /** 設定是否由外部控制排程邏輯（true 則不自動 requestAnimationFrame） */
  setExternalFlushMode(external: boolean) {
    this.externalFlush = external;
  }

  markDirty(cell: Cell) {
    this.dirtyCells.add(cell);
    if(!this.externalFlush && !this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  flush() {
    for(const cell of this.dirtyCells) {
      this._updateCellContentIfNeeded(cell)
    }
    this.dirtyCells.clear();
    this.scheduled = false;
  }

  private _updateCellContentIfNeeded(cell: Cell) {
    const n = cell.indexPath.length;
    const row = cell.indexPath[n-2];
    const col = cell.indexPath[n-1];

    const root = cell.valueRef.reactRoot;
    if(!root) return; // 代表還沒有建立 React.root

    const displayText =  this.vc.getCellDisplayValue(row, col);
    root.render(<Text className="cell-plugin-text">{`${displayText}`}</Text>)
  }
}