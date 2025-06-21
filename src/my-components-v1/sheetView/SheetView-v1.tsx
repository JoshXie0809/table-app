import React, { useEffect, useRef } from "react";

import { useVirtualCells, UseVirtualCellsOptions } from "../hooks/useVirtualCell";
import { useContainerDimensions } from "../hooks/useContainerDimensions";
import { Cell } from "./canvas-table-v1.1/Cell";
import { VManager } from "./canvas-table-v1.1/VirtualizationManger";
import ReactDOM from 'react-dom/client';
import { Text } from "@fluentui/react-components";

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

  const totalRow = 100_000;
  const totalCol = 22;

  useEffect(() => {
    if(!containerRef.current) return;
    const container = containerRef.current;
    const vm = new VManager(
      containerDim,
      totalRow,
      totalCol,
      44, 112,
      container, 4, 2);

    vmRef.current = vm
    return () => {
      vm.clearDOM(container);
    }
  }, [])

  useEffect(() => {
    if(!vmRef.current) return;
    if(!containerRef.current) return;
    const container = containerRef.current;
    const vm = vmRef.current;
    vm.setContainerDims(containerDim, container);

          // 模擬需要更新的是 第 5 Col
          const col5: Cell[] = [];

          vm.nplctrler.pool.forEach((cell, _r, c) => {
            if(c == 5 || c == 9) col5.push(cell);
          });

          col5.forEach((cell) => {
            const targetDiv = cell.valueRef.el;
            let root = cell.valueRef.reactRoot;
              if (!root) {
                  root = ReactDOM.createRoot(targetDiv);
                  cell.valueRef.reactRoot = root; // 將建立的 Root 存起來，下次重複使用
              }

              const reactNodeToMount = (
                  <Text style={{textWrap: "nowrap"}}>{`${cell.indexPath[0]}-${cell.indexPath[1]}: hello world`}</Text>
              );

              // d. 命令 React 在這個根上進行渲染或更新
              // React 會自動比對差異，只做必要的更新
              root.render(reactNodeToMount);
          })

  }, [containerDim, containerRef.current])

  useEffect(() => {
    const container = containerRef.current;
    const vm = vmRef.current;
    
    if (!container || !vm) return;

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

          // Y 軸邏輯
          const transRow = vm.solveRowTrans(scrollTop);
          if (transRow !== 0) { // 只有在需要移動時才呼叫
              vm.nplctrler.scrollVerticalBy(transRow);
          }

          // X 軸邏輯
          const transCol = vm.solveColTrans(scrollLeft);
          if (transCol !== 0) { // 只有在需要移動時才呼叫
              vm.nplctrler.scrollHorizontalBy(transCol);
          }
          
          // setPoolInfo 可能也應該只在有變動時呼叫
          if (transRow !== 0 || transCol !== 0) {
              vm.setPoolInfo();
          }
          
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
      <div style={{position: "absolute", zIndex:1, top: "0px", left: "60px"}}>{JSON.stringify(containerDim)}</div>
      <div id="sizer" style={{width: 112*totalCol, height:44*totalRow}}/>
    </div>
  );
}