import React, { useEffect, useRef } from "react";

import { useVirtualCells, UseVirtualCellsOptions } from "../hooks/useVirtualCell";
import { useContainerDimensions } from "../hooks/useContainerDimensions";
import { NestedPool } from "./canvas-table-v1.1/Cell";
import { NestedPoolController } from "./canvas-table-v1.1/PoolController";
import { VManager } from "./canvas-table-v1.1/VirtualizationManger";
import { throttle } from "lodash";

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
  const prevX = useRef(0);

  const totalRow = 40_000;
  const totalCol = 256;

  useEffect(() => {
    if(!containerRef.current) return;
    const container = containerRef.current;
    const vm = new VManager(
      containerDim,
      totalRow,
      totalCol,
      44, 112,
      container, 8, 4);

    vmRef.current = vm

    return () => {
      vm.nplctrler.pool.clear(true, container)
    }
  }, [])

  useEffect(() => {
    if(!vmRef.current) return;
    if(!containerRef.current) return;
    const container = containerRef.current;
    const vm = vmRef.current;
    vm.setContainerDims(containerDim, container);
  }, [containerDim, containerRef.current])

  useEffect(() => {
    const container = containerRef.current;
    const vm = vmRef.current;
    
    if (!container || ! vm) return;
    

    const handleScroll = () => {
      // 讓 scroll 與畫面同步、只跑一次邏輯
      
      const scrollTop = container.scrollTop;
      const scrollLeft = container.scrollLeft;

      // Y 軸邏輯
      const transRow = vm.solveRowTrans(scrollTop);
      vm.nplctrler.scrollVerticalBy(transRow);
      

      // X 軸邏輯
      const transCol = vm.solveColTrans(scrollLeft);
      vm.nplctrler.scrollHorizontalBy(transCol);

      vm.setPoolInfo();
    };


    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
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
      <div id="sizer" style={{width: 112*totalCol, height:44*totalRow}}/>
    </div>
  );
}