import { RefObject, useEffect } from "react";
import { filter, fromEvent, map } from "rxjs";
import { QuickEditInputCellHandle } from "./InputCell";

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


// 只訂閱特定按鍵
export const enter$ = keyWithZone$.pipe(
  filter(({event}) => event.key === 'Enter'),
  filter(({focusedZone}) => focusedZone === "system-quick-edit" || focusedZone === undefined)
);


export const useKeyboard = (
  inputCellRef: RefObject<QuickEditInputCellHandle | null>
) => {

  useEffect(() => {
    const sub = enter$.subscribe(() => {
      const inputCell = inputCellRef.current;
      if(!inputCell) return;
      if(!inputCell.isFocused)
        inputCell.focus();
      else
        inputCell.blur();
    })
    
    return () => sub.unsubscribe();
  })
}