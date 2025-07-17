import { useEffect, useRef } from "react";
import { map, Subject, withLatestFrom } from "rxjs";
import { CellContent } from "../../../../tauri-api/types/CellContent";
import { rc$ } from "./useInputCellStateManager";
import { QuickEditInputCellHandle } from "./InputCell";
import { useSheetView } from "../../SheetView-Context";
import { setCellContentResult, setCellContentValue, VirtualCells } from "../../../VirtualCells";
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
  setCell(row: number, col: number, newValue: string, vc: VirtualCells): boolean 
  {
    const key = vc.toKey(row, col);
    const cell = this.appender.get(key);
    if(cell === undefined ) return false;
    const { initial, now } = cell;
    const setResult = setCellContentValue(now, newValue, vc);
    
    return setResult.success;
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
    const enterEmitAndRC$ = quickEditEnterEmit$.pipe(
      withLatestFrom(rc$),
      map(([inputCell, rc]) => ({inputCell, ...rc,}))
    )
    const sub = enterEmitAndRC$.subscribe((payload) => {
      // 取得現在位置 rc$ 
      const {row, col} = payload;
      const cellsRefBundle = getRef("cells");
      if(cellsRefBundle === undefined) return;
      const cellsVC = cellsRefBundle.vcRef.current;
      const cellsRM = cellsRefBundle.rmRef.current;
      const qea = qeaRef.current;
      const value = payload.inputCell.quickEditInputCellValue;
      if(qea === null) return;
      if(row === null || col === null) return;
      if(cellsVC === null || cellsRM === null) return;
      // 使用 qea 檢查當前位置是否之前有修改過
      const hasEdited = qea.hasCell(row, col, cellsVC);
      // 沒有修改過的話, 先初始化狀況
      let initSuccess = true;
      if(!hasEdited ) initSuccess = qea.initCell(row, col, cellsVC);
      // 初始化失敗直接退出
      if( !initSuccess ) return;
      // 寫入數據到 qea 中
      const setSucecess = qea.setCell(row, col, value, cellsVC);

    });

    return () => sub.unsubscribe();
  }, []);
}