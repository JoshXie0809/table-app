import React, { RefObject, useEffect, useRef } from "react";

import { VManager } from "./canvas-table-v1.1/VirtualizationMangaer";
import { RManager } from "./canvas-table-v1.1/RenderManager";
import { useContainerDimensions } from "../hooks/useContainerDimensions";
import { VirtualCells } from "../VirtualCells";
import { useMountVMCells } from "../hooks/useMountViMCells";
import { usePolling } from "../hooks/usePolling";
import { useSyncContainerDims } from "../hooks/useSyncContainerDims";
import { useHeaderVC } from "../hooks/useHeaderVC";
import { TransSystemName } from "./canvas-table-v1.1/Dirty/DirtyTranslateCellScheduler";

export interface RowHeaderProps {
  containerRef: RefObject<HTMLDivElement>;
  colHeaderRef: RefObject<HTMLDivElement>;
  vcRef: RefObject<VirtualCells>;
}

export const ColHeader: React.FC<RowHeaderProps> = ({
  containerRef,
  colHeaderRef,
  vcRef,
}) => {

  const colVCRef = useHeaderVC("column", vcRef);
  const containerDims = useContainerDimensions(containerRef);

  const vmRef = useRef<null | VManager>(null);
  const rmRef = useRef<null | RManager>(null);
  const scrollStopTimer = useRef<number | null>(null); 

  const {stopPolling, startPollingIfDirty} = usePolling(colVCRef, rmRef);

  const transSystemName: TransSystemName = "column-header";

  // 初始化 managers
  useMountVMCells({
    transSystemName,
    containerRef: colHeaderRef, 
    containerDims,
    vcRef: colVCRef,
    vmRef,
    rmRef,
    overScanRow: 0,
    overScanCol: 2,
  });

  // 初始化後就開始檢查
  if(vmRef.current && rmRef.current) startPollingIfDirty();

  // 監聽尺寸變化事件
  useSyncContainerDims(
    containerRef,
    containerDims,
    colVCRef,
    vmRef,
    rmRef,
    stopPolling,
    startPollingIfDirty,
  )
  
  // 滾動事件處理
  useEffect(() => {
    if(!containerRef.current) return;

    let ticking = false; // 這裡定義的 ticking 變數是每個 useEffect 實例獨有的

    const handleScroll = () => {
      const container = containerRef.current;
      const vc = colVCRef.current;
      const vm = vmRef.current;
      const rm = rmRef.current;

      if(!vc) return;    
      if (!vm || !rm || !container) return;
      // 如果已經在排程 requestAnimationFrame，則不重複排程
      if (!ticking) {
        ticking = true; // 立即設定為 true，表示已排程一個幀

        requestAnimationFrame(() => {
          const scrollTop = container.scrollTop;
          const scrollLeft = container.scrollLeft;

          colHeaderRef.current!.style.transform = `translateY(${scrollTop}px)`;

          const updatedCells = vm.scrollBy(scrollTop, scrollLeft);
          updatedCells.forEach((cell) => rm.markDirty(cell));
          rm.transformScheduler.flush();
          rm.contentScheduler.flush();
          // 在滾動過程中也要請求顯示值，因為可視區域內的單元格變化了
          vc.requestDisplayValueAndUpdate();

          ticking = false; // 所有更新完成後，將 ticking 設為 false
        });
      }

      // 每次滾動時，都停止當前的輪詢，並重設滾動停止計時器
      stopPolling();
      if (scrollStopTimer.current !== null) {
        clearTimeout(scrollStopTimer.current);
      }

      // 在滾動停止 120ms 後啟動輪詢
      scrollStopTimer.current = window.setTimeout(() => {
        startPollingIfDirty(); // 滾動停止後啟動輪詢更新內容
      }, 120);
    };

    containerRef.current.addEventListener("scroll", handleScroll);

    // 清理函數：在組件卸載或依賴變化時移除事件監聽器
    return () => {
      if(!containerRef.current) return;
      containerRef.current.removeEventListener("scroll", handleScroll);
      // 在 cleanup 中也確保清除 scrollStopTimer，以防萬一
      if (scrollStopTimer.current !== null) {
          clearTimeout(scrollStopTimer.current);
          scrollStopTimer.current = null;
      }
    };
  }, []); // 空依賴陣列表示只在組件 mount 和 unmount 時執行

  return null;
};