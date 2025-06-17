import React, { useEffect, useRef, useState } from "react";

import { useVirtualCells, UseVirtualCellsOptions } from "../hooks/useVirtualCell";
import { IVirtualRowPoolMain, VirtaualRowPool } from "./canvas-table-v1.0/IVirtualRowPool";
import { useContainerDimensions } from "../hooks/useContainerDimensions";

export interface SheetViewProps {
  options: UseVirtualCellsOptions;
}

export const SheetView11: React.FC<SheetViewProps> = ({
  options
}) =>
{

  const virtualCells = useVirtualCells(options);

  const containerRef = useRef<HTMLDivElement>(null);
  const virtualRowPoolMainRef = useRef<IVirtualRowPoolMain | null>(null);
  const poolSize = 50;
  const prev = useRef(0); 

  const containerDim = useContainerDimensions(containerRef);

  useEffect(() => {
    console.log(containerDim)
  }, [containerDim])

  useEffect(() => {
    const el = containerRef.current;
    const rowPool = virtualRowPoolMainRef.current;
    if (!el || !rowPool) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const move = scrollTop - prev.current;
      let nR = Math.floor(move / rowPool.rowHeight);
      // 有正位移
      if (nR > 0 ) {
        // 計算 pool-top 和視窗有多少位置
        const A = scrollTop - rowPool.top;
        const ARow = Math.floor(A / rowPool.rowHeight);
        if(ARow <= 5) {
          prev.current +=  nR * rowPool.rowHeight;
          return;
        }
        
        let bottomSheetRowID = rowPool.rowPool[rowPool.poolSize-1].sheetRowId;
        for (let i = 0; i < nR; i++) {  
          if (bottomSheetRowID === 2999) break;
          const oldTopRow = rowPool.pop_top();
          if (!oldTopRow) break;
          rowPool.push_bottom(oldTopRow);
          prev.current += rowPool.rowHeight;
          bottomSheetRowID += 1;
        }  
        
      }
    };

    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [])


  useEffect(() => {
    // 初始化
    const container = containerRef.current;
    if (!container) return;
    
    if (!virtualRowPoolMainRef.current) {
      virtualRowPoolMainRef.current = new VirtaualRowPool(44, poolSize, 112*128, container);
      const rowPool = virtualRowPoolMainRef.current;
      console.log(rowPool)
    }

  }, []);
  

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