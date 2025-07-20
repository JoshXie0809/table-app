import { useEffect, useRef } from "react";
import { map, Subject, withLatestFrom } from "rxjs";
import { CellContent } from "../../../../tauri-api/types/CellContent";
import { rc$ } from "./useInputCellStateManager";
import { useSheetView } from "../../SheetView-Context";
import { setCellContentValue, VirtualCells } from "../../../VirtualCells";
import { isEqual } from "lodash";
import { QuickEditInputCellHandle } from "./InputCell";
import { fileSaveRequest$ } from "../../../button-toolbox/ButtonSaveSheet";
import { ICell } from "../../../../tauri-api/types/ICell";
import { saveSheet } from "../../../../tauri-api/saveSheet";
export const quickEditEnterEmit$ = new Subject<QuickEditInputCellHandle>();
interface QuickEditAppenderCell {
  initial: CellContent | undefined,
  now: CellContent,
}
class QuickEditAppender {
  private appender = new Map<string, QuickEditAppenderCell>();
  constructor () {}
  hasCell(row: number, col:number, vc: VirtualCells) {
    return this.appender.has(vc.toKey(row, col));
  }
  initCell(row: number, col: number, vc: VirtualCells) : boolean {
    // 從 VC 取得原始狀態的 Cell
    const initial = vc.getCell(row, col);
    let now: CellContent | undefined;
    if(initial === undefined) now = structuredClone(vc.getDefaultCell());
    else now = structuredClone(initial);
    if(now === undefined) return false;
    const key = vc.toKey(row, col);
    this.appender.set(key, {initial, now});
    return true;
  }
  getCell(row: number, col: number, vc: VirtualCells) {
    const key = vc.toKey(row, col);
    return this.appender.get(key);
  }
  setCell(row: number, col: number, newValue: string, vc: VirtualCells) 
  {
    const cell = this.getCell(row, col , vc);
    if(cell === undefined ) return;
    let { now } = cell;
    setCellContentValue(now, newValue, vc);  
  }
  deleteCell(row: number, col: number, vc: VirtualCells) 
  {
    const key = vc.toKey(row, col);
    this.appender.delete(key)
  }
  deleteAllCell() {
    this.appender.clear();
  }
  getAllCellOnSave(vc: VirtualCells): ICell[]
  {
    const arr: ICell[] = [];
    for(const kv of this.appender) {
      const [key, cell] = kv;
      const {row, col} = vc.toRC(key);
      const { now } = cell;
      arr.push({row, col, cellData: now});
    }
    return arr;
  }
}

export function useQuickEditAppender() 
{
  const qeaRef = useRef<QuickEditAppender | null>(null);
  useEffect(() => {
    qeaRef.current = new QuickEditAppender();
  }, [])
  const { getRef } = useSheetView();
  useEffect(() => {
    const enterEmitWithRC$ = quickEditEnterEmit$.pipe(
      withLatestFrom(rc$),
      map(([inputCell, rc]) => ({inputCell, ...rc,}))
    )
    const sub = enterEmitWithRC$.subscribe((payload) => {
      // 取得現在位置 rc$ 
      const {row, col} = payload;
      const cellsRefBundle = getRef("cells");
      if(cellsRefBundle === undefined) return;
      const cellsVC = cellsRefBundle.vcRef.current;
      const cellsRM = cellsRefBundle.rmRef.current;
      const cellsVM = cellsRefBundle.vmRef.current;
      const qea = qeaRef.current;
      const value = payload.inputCell.latestValueRef.current;
      if(value === null) return;
      if(qea === null) return;
      if(row === null || col === null) return;
      if(cellsVC === null || cellsRM === null || cellsVM === null) return;
      // 使用 qea 檢查當前位置是否之前有修改過
      const hasEdited = qea.hasCell(row, col, cellsVC);
      // 沒有修改過的話, 先初始化狀況
      let initSuccess = true;
      if(!hasEdited ) initSuccess = qea.initCell(row, col, cellsVC);
      // 初始化失敗直接退出
      if( !initSuccess ) return;
      // 寫入數據到 qea 中
      qea.setCell(row, col, value, cellsVC);
      // 檢查來降低數據量
      const cell = qea.getCell(row, col, cellsVC);
      if(cell === undefined) return;
      const {initial, now} = cell;
      const vmCell = cellsVM.getCellByRowCol(row, col)
      if(vmCell === undefined) return;
      cellsVC.setCell({row, col, cellData: now});
      cellsRM.markDirty(vmCell)
      cellsRM.flush();
      // case 1 如果 initial 和 now 相同代表可以刪除
      // case 2 如果 initial 未定義，並且 now == defaultCell
      if(isEqual(initial, now)) {
        qea.deleteCell(row, col, cellsVC);
      } 
      else 
      if(isEqual(now, cellsVC.getDefaultCell()) && initial === undefined) {
        qea.deleteCell(row, col, cellsVC);
      }
    });

    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const sub = fileSaveRequest$.subscribe(async () => {
      const cellsRefBundle = getRef("cells");
      if(cellsRefBundle === undefined) return;
      const cellsVC = cellsRefBundle.vcRef.current;
      if(cellsVC === null) return;
      const qea = qeaRef.current;
      if(qea === null) return;
      const cells = qea.getAllCellOnSave(cellsVC);
      const sheetPath = cellsVC.sheetPath;
      let res = await saveSheet({cells, sheetPath});
      if(res.success) qea.deleteAllCell();
    })
    return () => sub.unsubscribe()
  }, [])
}