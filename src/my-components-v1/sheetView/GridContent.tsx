import React, { RefObject, useEffect, useRef } from "react";

import { VManager } from "./canvas-table-v1.1/VirtualizationMangaer";
import { RManager } from "./canvas-table-v1.1/RanderManager";
import { useContainerDimensions } from "../hooks/useContainerDimensions";
import { VirtualCells } from "../VirtualCells";

export interface GridContentProps {
  containerRef: RefObject<HTMLDivElement>;
  gridRef: RefObject<HTMLDivElement>;
  vcRef: RefObject<VirtualCells>;
}

export const GridContent: React.FC<GridContentProps> = ({
  containerRef,
  gridRef,
  vcRef,
}) => {
  const vmRef = useRef<null | VManager>(null);
  const rmRef = useRef<null | RManager>(null);
  const containerDim = useContainerDimensions(containerRef);
  const pollingRef = useRef<number | null>(null); // request loop timer
  const scrollStopTimer = useRef<number | null>(null); // scroll debounce

  const stopPolling = () => {
    if (pollingRef.current !== null) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    } else {
    }
  };

  const startPollingIfDirty = () => {
    // 每次啟動前，都先嘗試停止一次，確保狀態正確
    // 這會將 pollingRef.current 設為 null，避免 'if (pollingRef.current !== null) return;' 阻擋後續啟動
    stopPolling(); 

    // 定義輪詢執行函數
    const run = async () => {

      if (!vcRef.current) {
        stopPolling(); // 如果 vcRef.current 不存在，則停止輪詢 (組件可能已卸載)
        return;
      }

      if(!rmRef.current) return;
      // 只有在有髒數據時才請求更新
      if (rmRef.current.contentScheduler.dirtyCells.size > 0) {
        rmRef.current?.contentScheduler.flush(); // 刷新渲染管理器
      }
      

      // 不論是否有髒數據，都排程下一次輪詢
      pollingRef.current = window.setTimeout(run, 50); // 約 20 fps
    };

    // 立即啟動第一次輪詢
    pollingRef.current = window.setTimeout(run, 50);
  };

  const totalRow = 102400;
  const totalCol = 128;
  const rowHeight = 44;
  const cellWidth = 152;

  // 初始化階段 (類似 componentDidMount)
  useEffect(() => {
    if (!gridRef.current || !vcRef.current) return;
    const container = gridRef.current;
    const vc = vcRef.current;

    const vm = new VManager(
      containerDim,
      totalRow,
      totalCol,
      rowHeight,
      cellWidth,
      2,
      2
    );

    const rm = new RManager(rowHeight, cellWidth, container, vcRef);

    vmRef.current = vm;
    rmRef.current = rm;

    // mount init cell
    const cells = vm.nplctrler.pool.map((cell) => cell).flat();
    cells.forEach((cell) => rm.mountCell(cell));
    rm.transformScheduler.setExternalFlushMode(true);
    rm.contentScheduler.setExternalFlushMode(true);

    rm.transformScheduler.flush();
    rm.contentScheduler.flush();
    // 首次載入時也需要請求顯示值
    vc.requestDisplayValueAndUpdate();

    // 首次載入後啟動輪詢
    startPollingIfDirty();

    // 清理階段 (類似 componentWillUnmount)
    return () => {
      // 確保在組件卸載前清理所有排程和單元格
      stopPolling(); // 停止所有輪詢
      if (scrollStopTimer.current !== null) {
        clearTimeout(scrollStopTimer.current);
      }
      queueMicrotask(() => {
        rm.transformScheduler.flush();
        rm.contentScheduler.clear();
        const cellsToUnmount = vm.nplctrler.pool.map((cell) => cell).flat();
        cellsToUnmount.forEach((cell) => rm.unmountCell(cell));
      });
    };
  }, []); // 空依賴陣列表示只在組件 mount 和 unmount 時執行

  // 容器尺寸變化時
  useEffect(() => {
    if (!containerRef.current) return;
    if (!vmRef.current || !rmRef.current || !vcRef.current) return;
    const vm = vmRef.current;
    const rm = rmRef.current;
    const vc = vcRef.current;

    const diff = vm.setContainerDims(containerDim);
    diff.added.forEach((cell) => rm.mountCell(cell));
    
    queueMicrotask(() => diff.deleted.forEach((cell) => rm.unmountCell(cell)));

    rm.transformScheduler.flush();
    rm.contentScheduler.flush();
    vc.requestDisplayValueAndUpdate();
    

    // 尺寸變化後也啟動輪詢 (確保輪詢在任何情況下都能重新啟動或保持運行)
    startPollingIfDirty();
  }, [containerDim]); // 依賴 containerDim，當尺寸變化時執行

  // 滾動事件處理
  useEffect(() => {
    const container = containerRef.current;
    const vm = vmRef.current;
    const rm = rmRef.current;
    if (!container || !vm || !rm ) return;

    let ticking = false; // 這裡定義的 ticking 變數是每個 useEffect 實例獨有的

    const handleScroll = () => {
      const vc = vcRef.current;
      if(!vc) return;
      // 如果已經在排程 requestAnimationFrame，則不重複排程
      if (!ticking) {
        ticking = true; // 立即設定為 true，表示已排程一個幀

        requestAnimationFrame(() => {
          const scrollTop = container.scrollTop;
          const scrollLeft = container.scrollLeft;
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

    container.addEventListener("scroll", handleScroll);

    // 清理函數：在組件卸載或依賴變化時移除事件監聽器
    return () => {
        container.removeEventListener("scroll", handleScroll);
        // 在 cleanup 中也確保清除 scrollStopTimer，以防萬一
        if (scrollStopTimer.current !== null) {
            clearTimeout(scrollStopTimer.current);
            scrollStopTimer.current = null;
        }
    };
  }, []); // 空依賴陣列表示只在組件 mount 和 unmount 時執行

  return null;
};