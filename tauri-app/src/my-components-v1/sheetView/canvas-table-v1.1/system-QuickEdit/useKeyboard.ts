import { RefObject, useEffect } from "react";
import { filter, fromEvent } from "rxjs";
import { QuickEditInputCellHandle } from "./InputCell";

const keydown$ = fromEvent<KeyboardEvent>(window, "keydown");

// 只訂閱特定按鍵
export const enter$ = keydown$.pipe(
  filter(e => e.key === 'Enter')
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