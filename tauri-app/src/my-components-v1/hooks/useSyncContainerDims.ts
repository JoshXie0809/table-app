import { MutableRefObject, RefObject, useEffect } from "react";
import { VirtualCells } from "../VirtualCells";
import { VManager } from "../sheetView/canvas-table-v1.1/VirtualizationMangaer";
import { RManager } from "../sheetView/canvas-table-v1.1/RenderManager";

export function useSyncContainerDims(
  containerRef: RefObject<HTMLElement>,
  containerDims: {width: number, height: number},
  vcRef: RefObject<VirtualCells>,
  vmRef: MutableRefObject<null | VManager>,
  rmRef: MutableRefObject<null | RManager>,
  stopPolling: () => void,
  startPollingIfDirty: () => void,
) {
  useEffect(() => {

    if (!containerRef.current) return;
    if (!vmRef.current || !rmRef.current || !vcRef.current) return;
    const vm = vmRef.current;
    const rm = rmRef.current;
    const vc = vcRef.current;

    // 先暫停輪詢 
    stopPolling();
    // resize 計算差異
    const diff = vm.setContainerDims(containerDims);
    diff.added.forEach((cell) => rm.mountCell(cell));
    queueMicrotask(() => diff.deleted.forEach((cell) => rm.unmountCell(cell)));

    rm.flush();
    vc.requestDisplayValueAndUpdate();
    startPollingIfDirty();
    
  }, [containerDims])
}