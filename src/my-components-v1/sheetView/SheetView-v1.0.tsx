import React, { useEffect, useRef } from "react";

import { useVirtualCells, UseVirtualCellsOptions } from "../hooks/useVirtualCell";
import { IVirtualPool, VirtualPool } from "./canvas-table-v1.0/IVirtualRowPool";
import { useContainerDimensions } from "../hooks/useContainerDimensions";
import { LayoutEngine } from "./canvas-table-v1.0/ILayoutEngine";

export interface SheetViewProps {
  options: UseVirtualCellsOptions;
}

export const SheetView11: React.FC<SheetViewProps> = ({
  options
}) =>
{

  const virtualCells = useVirtualCells(options);

  const containerRef = useRef<HTMLDivElement>(null);
  const virtualRowPoolMainRef = useRef<IVirtualPool | null>(null);

  const layoutEngineRef = useRef<LayoutEngine | null>(null);
  const poolSize = 50;
  const prev = useRef(0); 

  const containerDim = useContainerDimensions(containerRef);

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
        
        let bottomSheetRowID = rowPool.rowPool[rowPool.poolSize-1].nowId;
        for (let i = 0; i < nR; i++) {  
          if (bottomSheetRowID === 2999) break;
          const oldTopRow = rowPool.popTop();
          if (!oldTopRow) break;
          rowPool.pushBottom(oldTopRow);
          prev.current += rowPool.rowHeight;
          bottomSheetRowID += 1;
        }
      }

      nR = Math.ceil(move / rowPool.rowHeight);
        
      if (nR < 0 ) {
        let topSheetRowID = rowPool.rowPool[0].nowId;
        for (let i = 0; i < -nR; i++) {  
          if (topSheetRowID === 0) break;
          const oldTopRow = rowPool.popBottom();
          if (!oldTopRow) break;
          rowPool.pushTop(oldTopRow);
          prev.current -= rowPool.rowHeight;
          topSheetRowID -= 1;
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
      virtualRowPoolMainRef.current = new VirtualPool(44, poolSize, 112*128, container);
      const rowPool = virtualRowPoolMainRef.current;
      console.log(rowPool)
    }

  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    layoutEngineRef.current = new LayoutEngine(
      containerDim,
      4,
      3000,
      44,
      112 * 128, 
      container,
    )

    // clear side-effect
    return () => {
      // ✅ 清掉 pool 的 row DOM
      layoutEngineRef.current?.rowPool.clearAllRow(container);
    };

  }, [containerDim])

  
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    if(!layoutEngineRef.current) return;
    const layoutEngine = layoutEngineRef.current;
    const scrollTop = container.scrollTop;
    layoutEngine.updateLayout(scrollTop)
    

  }, [layoutEngineRef.current])

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