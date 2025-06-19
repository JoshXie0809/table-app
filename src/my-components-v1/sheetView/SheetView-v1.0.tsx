import React, { useEffect, useRef } from "react";

import { useVirtualCells, UseVirtualCellsOptions } from "../hooks/useVirtualCell";
import { useContainerDimensions } from "../hooks/useContainerDimensions";
import { CellPool, NestedPool, Cell } from "./canvas-table-v1.1/Cell";
import { NestedPoolController } from "./canvas-table-v1.1/PoolController";

export interface SheetViewProps {
  options: UseVirtualCellsOptions;
}

export const SheetView11: React.FC<SheetViewProps> = ({
  options
}) =>
{

  const virtualCells = useVirtualCells(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerDim = useContainerDimensions(containerRef);
  const prevY = useRef(0);
  const prevX = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const pool = new NestedPool([1, 1]); // 寫的時候邏輯好像讓他變成需要至少一個
    const pctrl = new NestedPoolController(pool);

    if(!container || !pctrl) return;
    pool.mount(container);
    pctrl.resize([23, 15], container)
    pctrl.fromBottomToTop();
    pctrl.fromRightToLeft();
    
    console.log(pctrl.pool)

    const handleScrollY = () => {
      const scrollTop = container.scrollTop;
      const move = scrollTop - prevY.current;
      let moveRow = move / pctrl.rowHeight;

      if(moveRow > 0) {
        const intRow = Math.floor(moveRow);
        prevY.current += intRow * pctrl.rowHeight;
        for(let i = 0; i < intRow; i++) 
          pctrl.fromTopToBottom();
      }

      if(moveRow < 0) {
        const intRow = Math.floor(-moveRow);
        prevY.current -= intRow * pctrl.rowHeight;
        for(let i = 0; i < intRow; i++) 
          pctrl.fromBottomToTop();    
      }
    }

    const handleScrollX = () => {
      const scrollLeft = container.scrollLeft;
      const move = scrollLeft - prevX.current;
      let moveCol = move / pctrl.cellWidth;

      if(moveCol > 0) {
        const intCol = Math.floor(moveCol);
        prevX.current += intCol * pctrl.cellWidth;
        for(let i = 0; i < intCol; i++) 
          pctrl.fromLeftToRight();
      }

      if(moveCol < 0) {
        const intCol = Math.floor(-moveCol);
        prevX.current -= intCol * pctrl.cellWidth;
        for(let i = 0; i < intCol; i++)
          pctrl.fromRightToLeft();
      }
    }

    container.addEventListener("scroll", handleScrollY);
    container.addEventListener("scroll", handleScrollX);
    return () => {
      container.removeEventListener("scroll", handleScrollY);
      container.removeEventListener("scroll", handleScrollX);
      pool.clear(true, container);
    }
    

  }, [])

  

  return (
    <div 
      ref={containerRef}
      id="container-virtual-cells"   
      style={{
        overflow: "scroll", position: "relative", 
        boxSizing: "border-box", border: "1px solid #ddd",
      }}>
      <div style={{position: "absolute", zIndex:1, top: "0px", left: "60px"}}>{JSON.stringify(containerDim)}</div>
      <div id="sizer" style={{width: 112*1280, height:44*30000}}/>
    </div>
  );
}