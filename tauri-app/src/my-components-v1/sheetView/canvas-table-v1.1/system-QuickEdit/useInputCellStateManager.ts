// 添加中

import { RefObject, useEffect } from "react";
import { useSheetView } from "../../SheetView-Context";
import { target$ } from "./SystemQuickEdit";
import { QuickEditInputCellHandle } from "./InputCell";
import { TransSystemName } from "../RenderManager";
import { useKeyboard } from "./useKeyboard";

export const useInputCellStateManager = (
  divRef: RefObject<HTMLDivElement | null>,
  inputCellRef: RefObject<QuickEditInputCellHandle | null>
) => {
  const { containerRef, vcRef, allRefOK, getRef } = useSheetView();
  const colHeaderRefBundle = getRef("column-header");
  const rowHeaderRefBundle = getRef("row-header");
  const cellsRefBundle = getRef("cells");

  useEffect(() => {
    const sub = target$.subscribe(({ target }) => {
      const divEl = divRef.current;
      const vc = vcRef.current;
      const container = containerRef.current;
      const inputCell = inputCellRef.current;
      
      if(!allRefOK || !colHeaderRefBundle || !rowHeaderRefBundle || !cellsRefBundle 
        || !divEl || !vc || !container || !inputCell) return;
      
      if(!target) return;
      
      // 點選後 設定 input 值
      const transSystem = target.dataset.transSystem as TransSystemName;
      if(transSystem === "cells") {
        const vm = cellsRefBundle.vmRef.current;
        const vc = cellsRefBundle.vcRef.current;
        if(!vm || !vc) return;
        const shellId = target.dataset.shellId as string;
        const {row, col} = vm.getCellRowColByShellId(shellId);
        if(row === undefined || col === undefined) return;
        const cellVal = vc.getCellDisplayValue(row, col);
        inputCell.setQuickEditInputCellValue(`${cellVal}`)
      }
    })

    return () => sub.unsubscribe();
  })


  useKeyboard(inputCellRef);


}