import { RefObject, useRef } from "react";
import { VirtualCells } from "../VirtualCells";
import { RManager } from "../sheetView/canvas-table-v1.1/RanderManager";

export function usePolling(
  vcRef: RefObject<VirtualCells>,
  rmRef: RefObject<RManager>,
  fps: number = 30,
) {

  const pollingRef = useRef<number | null>(null);

  const stopPolling = () => {
    if (pollingRef.current !== null) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
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
        // 持有髒數據，排程下一次輪詢
        pollingRef.current = window.setTimeout(run, Math.round(1000 / fps));
      }
      
    };

    // 立即啟動第一次輪詢
    pollingRef.current = window.setTimeout(run, Math.round(1000 / fps));
  };

  return {stopPolling, startPollingIfDirty};
}