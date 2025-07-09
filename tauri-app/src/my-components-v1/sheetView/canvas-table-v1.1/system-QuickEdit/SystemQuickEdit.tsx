import { useEffect, useRef } from "react";
import { useSheetView } from "../../SheetView-Context";

import { throttledPointerActivity$ } from "../../../pointer-state-manager/PointerStateManger";
import { filter } from "rxjs";
import { useInputCell } from "./useInputCell";
import { findTransSystemElement } from "./useInputCellStateManager";


export const SystemQuickEdit = () => {
  const { containerRef, vcRef, allRefOK, getRef } = useSheetView();
  const divRef = useRef<HTMLDivElement | null>(null);

  const colHeaderRefBundle = getRef("column-header");
  const rowHeaderRefBundle = getRef("row-header");
  const cellsRefBundle = getRef("cells");

  // 將編輯的的 Input 先掛到 container 上
  useInputCell(containerRef, vcRef, divRef);


  useEffect(() => {
    const pressing$ = throttledPointerActivity$.pipe(
      filter(({event}) => event.pointerType === 'mouse' ? event.button === 0 : true)
    );

    const sub = pressing$.subscribe((payload) => {
      const divEl = divRef.current;
      const vc = vcRef.current;
      const container = containerRef.current;
      if(!allRefOK || !colHeaderRefBundle || !rowHeaderRefBundle || !cellsRefBundle || !divEl || !vc || !container) return;

      if(payload.state != "pressing") 
        return;
      
      const cellHeight = vc.cellHeight;
      const cellWidth =  vc.cellWidth;
      const {clientX, clientY} = payload.event;
      const hoveredElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const target = findTransSystemElement(hoveredElement)
      if(!target) return;
      const dataset = target.dataset
      const transXStr = dataset.transX;
      const transYStr = dataset.transY;
      const trnasSystem = dataset.transSystem;
      if(!transYStr || !transXStr || !trnasSystem) return;
      const transY = Number(transYStr);
      const transX = Number(transXStr);
      
      let paddingX = 0;
      let paddingY = 0;
      
      if(trnasSystem === "cells") {
        paddingX = cellWidth;
        paddingY = cellHeight;
      } 
      // else 
      // if(trnasSystem === "column-header") {
      //   paddingY = container.scrollTop;
      //   paddingX = cellWidth;
      // } 
      // else 
      // if(trnasSystem === "row-header") {
      //   paddingX = container.scrollLeft;
      //   paddingY = cellHeight;
      // } 
      else {
        return;
      }

      divEl.style.transform = `translate3d(${transX + paddingX}px, ${transY + paddingY}px, 0)`;
      divEl.style.transition = "transform 48ms ease-out";

    })

    return () => sub.unsubscribe();
  })

  return null;
}


