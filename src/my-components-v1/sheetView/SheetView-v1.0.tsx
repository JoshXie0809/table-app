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
  const prev = useRef(0); 

  useEffect(() => {
    const container = containerRef.current;
    const pool = new NestedPool([1, 1]);
    const pctrl = new NestedPoolController(pool);

    if(!container || !pctrl) return;
    pool.mount(container);
    pctrl.resize([5, 3], container);
    pctrl.fromTopToBottom();
    pctrl.fromTopToBottom();

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const move = scrollTop - prev.current;
      let moveRow = move / pctrl.rowHeight;

      if(moveRow > 0) {
        const int = Math.floor(moveRow);
        prev.current += int * pctrl.rowHeight;
        for(let i = 0; i < int; i++) 
          pctrl.fromTopToBottom();
      }

      if(moveRow < 0) {
        const int = Math.floor(-moveRow);
        prev.current -= int * pctrl.rowHeight;
        for(let i = 0; i < int; i++) 
          pctrl.fromBottomToTop();    
      }
    }

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
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
      <div id="sizer" style={{width: 112*128, height:44*3000}}/>
    </div>
  );
}