import { RefObject, useEffect } from "react";
import { useSheetView } from "../../SheetView-Context";
import { target$ } from "./SystemQuickEdit";
import { QuickEditInputCellHandle } from "./InputCell";
import { TransSystemName } from "../RenderManager";
import { useKeyboard } from "./useKeyboard";
import { Subject } from "rxjs";

export const rc$ = new Subject<{row: number | null, col:number | null }>();

export const useInputCellStateManager = (
  divRef: RefObject<HTMLDivElement | null>,
  inputCellRef: RefObject<QuickEditInputCellHandle | null>
) => {
  
  const { vcRef, allRefOK, getRef } = useSheetView();
  // const colHeaderRefBundle = getRef("column-header");
  // const rowHeaderRefBundle = getRef("row-header");
  const cellsRefBundle = getRef("cells");


  useEffect(() => {
    const sub = target$.subscribe(({ target }) => {
      const divEl = divRef.current;
      if(!allRefOK || !cellsRefBundle  || !divEl) return;
      if(!target) return;
      // 點選後 設定 input 值
      const transSystem = target.dataset.transSystem as TransSystemName;
      if(transSystem === "cells") {
        const vm = cellsRefBundle.vmRef.current;
        if(!vm) return;
        const shellId = target.dataset.shellId as string;
        const {row, col} = vm.getCellRowColByShellId(shellId);
        if(row === undefined || col === undefined) return;
        rc$.next({row, col})
      }
    })

    return () => sub.unsubscribe();
  })

  useEffect(() => {
    const sub = rc$.subscribe(({row, col}) => {
      const vc = vcRef.current;
      const inputCell = inputCellRef.current;
      if(!vc || !inputCell) return;
      if(row === null || col === null) return;
      const val = vc.getCellDisplayValue(row, col);
      if(!val) inputCell.setQuickEditInputCellValue("");
      else inputCell.setQuickEditInputCellValue(val);
    })
    
    return () => sub.unsubscribe();
  })

  useKeyboard(inputCellRef);

}

