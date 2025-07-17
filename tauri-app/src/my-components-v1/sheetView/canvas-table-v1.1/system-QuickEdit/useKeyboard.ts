import { RefObject, useEffect } from "react";
import { filter, fromEvent, map, withLatestFrom } from "rxjs";
import { QuickEditInputCellHandle } from "./InputCell";
import { rc$ } from "./useInputCellStateManager";
import { VirtualCells } from "../../../VirtualCells";
import { useSheetView } from "../../SheetView-Context";
import { quickEditEnterEmit$ } from "./QuiclEditAppender";

const keydown$ = fromEvent<KeyboardEvent>(window, "keydown");

function getZoneFromElement(target: HTMLElement | null): string | undefined {
  let el = target;
  while (el) {
    if (el.dataset?.zone) return el.dataset.zone;
    el = el.parentElement;
  }
  return undefined;
}

// 這裡用 map 產生 {event, zone} 資訊
const keyWithZone$ = keydown$.pipe(
  map(e => {
    // 用當下的 activeElement 來判斷 zone
    const focusedZone = getZoneFromElement(document.activeElement as HTMLElement | null);
    return { event: e, focusedZone };
  })
);

export const enter$ = keyWithZone$.pipe(
  filter(({event}) => event.key === 'Enter'),
  filter(({focusedZone}) => focusedZone === "system-quick-edit" || focusedZone === undefined)
);

function isArrow(key: string):boolean {
  switch(key) {
    case "ArrowUp": 
    case "ArrowDown": 
    case "ArrowLeft": 
    case "ArrowRight": 
      return true;
    default:
      return false;
  }
}

export const arrow$ = keyWithZone$.pipe(
  filter(({event}) => isArrow(event.key)),
  filter(({focusedZone}) => focusedZone === undefined)
);

export const tab$ = keyWithZone$.pipe(
  filter(({event}) => event.key === "Tab"),
  filter(({focusedZone}) => focusedZone === undefined)
);

export const esc$ = keyWithZone$.pipe(
  filter(({event}) => event.key === "Escape"),
  filter(({focusedZone}) => focusedZone === "system-quick-edit")
)

export const useKeyboard = (
  inputCellRef: RefObject<QuickEditInputCellHandle | null>,
) => {
  const { vcRef } = useSheetView();
  // enter 鍵邏輯
  useEffect(() => {
    const sub = enter$.subscribe(() => {
      const inputCell = inputCellRef.current;
      if(!inputCell) return;
      if(!inputCell.isFocused)
        inputCell.focus();
      else {
        // 傳送編輯完成的訊號
        quickEditEnterEmit$.next(inputCell);
        inputCell.blur();
      }
    })
    
    return () => sub.unsubscribe();
  })

  // esc 鍵邏輯
  // 只負責無條件退出 focus 模式
  useEffect(() => {
    const sub = esc$.subscribe(() => {
      const inputCell = inputCellRef.current;
      if(!inputCell) return;
      if(inputCell.isFocused) inputCell.blur();
    })

    return () => sub.unsubscribe();
  })

  // arrow 上下左右
  useEffect(() => {
    const arrowAndRC$ = arrow$.pipe(
      withLatestFrom(rc$),
      map(([{ event, focusedZone }, {row, col}]) => ({
        event,
        focusedZone,
        row,  // 直接命名
        col,
      }))
    );

    const sub = arrowAndRC$.subscribe(({event, row, col}) => {
      event.preventDefault();
      const inputCell = inputCellRef.current;
      if(!inputCell) return;
      if(inputCell.isFocused) return;
      // 這裡統一修正 row/col
      const vc = vcRef.current;
      if (!vc) return;
      if(row === null || col === null) return;
      let newRow = row, newCol = col;
      if (event.key === "ArrowUp") newRow--;
      else if (event.key === "ArrowDown") newRow++;
      else if (event.key === "ArrowLeft") newCol--;
      else if (event.key === "ArrowRight") newCol++;
      
      // 這裡直接修正
      const checked = checkRCValid(newRow, newCol, vc);
      rc$.next({ row: checked.row, col: checked.col });      
    })
    return () => sub.unsubscribe();
  })
}


function checkRCValid(row: number, col: number, vc: VirtualCells) {
  let valid = true;
  if(row >= vc.sheetSize.nRow) { row = vc.sheetSize.nRow - 1; valid = false;}
  if(row < 0) { row = 0; valid = false; }
  if(col >= vc.sheetSize.nCol) { col = vc.sheetSize.nCol - 1; valid = false; }
  if(col < 0) { col = 0; valid = false; }
  return ({row, col, valid})
}