import React, { useEffect, useRef } from "react";

import { useVirtualCells, UseVirtualCellsOptions } from "../hooks/useVirtualCell";
import { useContainerDimensions } from "../hooks/useContainerDimensions";
import { Cell, NestedPool } from "./canvas-table-v1.1/Cell";
import { VManager } from "./canvas-table-v1.1/VirtualizationManger";
import ReactDOM from 'react-dom/client';
import { Text } from "@fluentui/react-components";
import { NestedPoolController } from "./canvas-table-v1.1/PoolController";
import { RManager } from "./canvas-table-v1.1/RanderManager";

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
  const vmRef = useRef<null | VManager>(null);
  const rmRef = useRef<null | RManager>(null)

  const totalRow = 60_000;
  const totalCol = 256;
  const rowHeigth = 44;
  const cellWidth = 112;


  useEffect(() => {
    if(!containerRef.current) return;
    const container = containerRef.current;

    const vm = new VManager(
      containerDim,
      totalRow,
      totalCol,
      rowHeigth, cellWidth, 
      4, 2);

    const rm = new RManager(rowHeigth, cellWidth, container);
    vmRef.current = vm ;   
    rmRef.current = rm;
    
    // mount init cell
    const cells = vm.nplctrler.pool.map((cell) => cell).flat();
    cells.forEach(cell => rm.mountCell(cell));
    rm.transformScheduler.setExternalFlushMode(true);
    rm.transformScheduler.flush();

    return () => {
      rm.transformScheduler.flush();
      const cells = vm.nplctrler.pool.map((cell) => cell).flat();
      queueMicrotask(() => {
        cells.forEach(cell => rm.unmountCell(cell));
      });
    };

  }, [])

  useEffect(() => {
    if(!vmRef.current || !rmRef.current) return;
    if(!containerRef.current) return;
    const vm = vmRef.current;
    const rm = rmRef.current;
    const diff = vm.setContainerDims(containerDim);
    diff.added.forEach(cell => rm.mountCell(cell));
    queueMicrotask(() => {
      diff.deleted.forEach(cell => rm.unmountCell(cell));
    });
    rm.transformScheduler.flush()
  }, [containerDim])

  useEffect(() => {
    const container = containerRef.current;
    const vm = vmRef.current;
    const rm = rmRef.current;

    if (!container || !vm || !rm) return;

    // 建立一個鎖，防止在動畫幀之間重複觸發
    let ticking = false;

    const handleScroll = () => {
        // 當事件觸發時，如果沒有在等待下一幀，就請求一幀
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // --- 真正執行的邏輯 ---
          // 在這裡，我們可以存取最新的 scrollTop 和 scrollLeft
          const scrollTop = container.scrollTop;
          const scrollLeft = container.scrollLeft;
          
          const updatedCells = vm.scrollBy(scrollTop, scrollLeft);
          updatedCells.forEach(cell => rm.markDirty(cell));
          rm.transformScheduler.flush()
          // --- 邏輯執行完畢 ---
          // 解開鎖，允許下一次滾動事件請求新的動畫幀
          ticking = false;
        });

        // 鎖上，表示我們正在等待下一幀，期間的所有 scroll 事件都會被忽略
        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []); // 依賴項為空，確保只在掛載和卸載時執行一次



  
  return (
    <div 
      ref={containerRef}
      id="container-virtual-cells"   
      style={{
        overflow: "scroll", position: "relative", 
        boxSizing: "border-box", border: "1px solid #ddd",
      }}>

      <div id="sizer" style={{width: 112*totalCol, height:44*totalRow}}/>
    </div>
  );
}