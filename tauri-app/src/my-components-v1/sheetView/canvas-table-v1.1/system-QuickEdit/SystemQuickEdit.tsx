import { useEffect } from "react";
import { useSheetView } from "../../SheetView-Context";

import { throttledPointerActivity$ } from "../../../pointer-state-manager/PointerStateManger";
import { filter } from "rxjs";
import { useInputCell } from "./useInputCell";
import { findTransSystemElement, getCellPositionOnMainContainer } from "../toolfunction";
import { TransSystemName } from "../RenderManager";


export const SystemQuickEdit = () => {
  const { containerRef, vcRef, allRefOK, getRef } = useSheetView();
  
  const colHeaderRefBundle = getRef("column-header");
  const rowHeaderRefBundle = getRef("row-header");
  const cellsRefBundle = getRef("cells");

  // 將編輯的的 Input 先掛到 container 上
  const { divRef, inputCellRef } = useInputCell(containerRef, vcRef);


  useEffect(() => {
    const pressing$ = throttledPointerActivity$.pipe(
      filter(({event}) => event.pointerType === 'mouse' ? event.button === 0 : true)
    );

    const sub = pressing$.subscribe((payload) => {
      const divEl = divRef.current;
      const vc = vcRef.current;
      const container = containerRef.current;
      const inputCell = inputCellRef.current;
      if(!allRefOK || !colHeaderRefBundle || !rowHeaderRefBundle || !cellsRefBundle || !divEl || !vc || !container || !inputCell) return;

      if(payload.state != "pressing") 
        return;
      
      const cellHeight = vc.cellHeight;
      const cellWidth =  vc.cellWidth;
      const {clientX, clientY} = payload.event;
      const hoveredElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const target = findTransSystemElement(hoveredElement)
      if(!target) return;
      // 點選後 設定 input 值
      const transSystem = target.dataset.transSystem as TransSystemName;
      if(transSystem === "cells") {
        const shellId = target.dataset.shellId as string;
        inputCell.setQuickEditInputCellValue(`hello-${shellId}`)
      }
        

      // 移動 input 框
      const {x, y} = getCellPositionOnMainContainer(target, 0, 0, cellHeight, cellWidth);
      divEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      divEl.style.transition = "transform 48ms ease-out";
    })

    return () => sub.unsubscribe();
  })

  return null;
}


