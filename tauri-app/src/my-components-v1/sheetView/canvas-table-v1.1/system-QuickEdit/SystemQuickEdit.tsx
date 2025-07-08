import { useEffect, useRef } from "react";
import { EventPayloadMap, useRegisterToBus } from "../../../event-bus/EventBus";
import { useSheetView } from "../../SheetView-Context";
import { createRoot, Root } from "react-dom/client";
import { Input, tokens } from "@fluentui/react-components";


export const SystemQuickEdit = () => {
  const { containerRef, vcRef, allRefOK, getRef } = useSheetView();
  const divRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);

  const colHeaderRef = getRef("column-header");
  const rowHeaderRef = getRef("row-header");
  const cellsRef = getRef("cells");

  // 將編輯的的 Input 先掛到 container 上
  useEffect(() => {
    if(!containerRef.current) return;
    if(!vcRef.current)return;
    const vc = vcRef.current;
    const container = containerRef.current;
    const divEl = document.createElement("div");
    divRef.current = divEl;

    divEl.style.width = `0px`;
    divEl.style.height = `0px`;
    divEl.style.backgroundColor = "red";
    divEl.style.position = `absolute`;
    // divEl.style.top = `${Math.round(vc.cellHeight*0.15)}px`;
    // divEl.style.left = `${Math.round(vc.cellHeight*0.15)}px`;
    divEl.style.top = `0px`;
    divEl.style.left = `0px`;
    divEl.style.willChange = "transform";
    divEl.style.zIndex = "0";

    container.appendChild(divEl);
    const root = createRoot(divEl);
    rootRef.current = root;
    root.render(
      <Input 
        placeholder="輸入"
        style={{
          height: `${Math.round(vc.cellHeight)}px`, 
          width: `${Math.round(vc.cellWidth)}px`,
          borderRadius: "0px",
          border: "1px solid rgb(96, 151, 96)",
          boxShadow: tokens.shadow2,
          boxSizing: "border-box",
        }} 
        // contentAfter={
        //   <div>
        //     <Button icon={<ArrowMaximizeRegular />} appearance="transparent" onClick={() => alert("hello-world")}/>    
        //   </div>
        // }
      />
    )
    

    return () => {
      const container = containerRef.current;
      const divEl = divRef.current;
      const root = rootRef.current;

      if(root) 
        queueMicrotask(() => root.unmount())
        
      if(container && divEl && container.contains(divEl)) 
        container.removeChild(divEl)
      
      rootRef.current = null;
      divRef.current = null; 
    }
  }, []);

  const handleSelecting = (payload: EventPayloadMap["pointer:stateChange"]) => {
    const divEl = divRef.current;
    const vc = vcRef.current;
    const container = containerRef.current;
    if(!allRefOK || !colHeaderRef || !rowHeaderRef || !cellsRef || !divEl || !vc || !container) return;

    // divEl.style.display = "none";

    if(payload.from !== "selecting" || payload.to !== "idle") 
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
  }

  useRegisterToBus("pointer:stateChange", handleSelecting);
  

  return null;
}


function findTransSystemElement(el: HTMLElement | null): HTMLElement | null {
  while (el) {
    if (el.dataset?.transSystem) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}
