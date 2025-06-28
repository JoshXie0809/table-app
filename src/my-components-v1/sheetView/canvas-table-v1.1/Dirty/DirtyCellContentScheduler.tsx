import { Text } from "@fluentui/react-components";
import { Cell } from "../Cell";
import { SimpleCellSkeleton } from "./simpleSkeloton";
import { RefObject } from "react";
import { IVirtualCells } from "../../../IVirtualCells";

export class DirtyCellContentScheduler {
  dirtyCells: Set<Cell> = new Set();
  private scheduled: boolean = false;
  private externalFlush = false; // 是否改為由外部控制 flush

  constructor(private vcRef: RefObject<IVirtualCells>) {}

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

    this.scheduled = false;
  }

  clear() {
    this.dirtyCells.clear();
  }

  private _updateCellContentIfNeeded(cell: Cell) {
    const n = cell.indexPath.length;
    const row = cell.indexPath[n-2];
    const col = cell.indexPath[n-1];

    const root = cell.valueRef.reactRoot;
    const vc = this.vcRef.current;
    if(!root || !vc) return; 
    
    const displayText = vc.getCellDisplayValue(row, col);

    if(displayText === null) {
      // 不刪除即可
      // this.markDirty(cell);
      root.render(<SimpleCellSkeleton />);
    }
    else {
      root.render(<Text className="cell-plugin-text">{displayText}</Text>)
      // 更新完取消 dirty 狀態
      this.dirtyCells.delete(cell);
    }   
  }


}