import { MutableRefObject, RefObject, useEffect } from "react";
import { VManager } from "../sheetView/canvas-table-v1.1/VirtualizationMangaer";
import { RManager } from "../sheetView/canvas-table-v1.1/RenderManager";
import { IVirtualCells } from "../IVirtualCells";
import { TransSystemName } from "../sheetView/canvas-table-v1.1/Dirty/DirtyTranslateCellScheduler";

export interface UseMountVMCellsProps {
  transSystemName: TransSystemName,
  containerRef: RefObject<HTMLElement>;
  containerDims: { width: number; height: number };
  vcRef: RefObject<IVirtualCells>;
  vmRef: MutableRefObject<null | VManager>;
  rmRef: MutableRefObject<null | RManager>;
  overScanRow?: number;
  overScanCol?: number;
}

export function useMountVMCells({
  transSystemName,
  containerRef,
  containerDims,
  vcRef,
  vmRef,
  rmRef,
  overScanRow = 0,
  overScanCol = 0,
}: UseMountVMCellsProps) {
  useEffect(() => {
    // console.log("🟢 useMountVMCells mounted", { vm: vmRef.current, rm: rmRef.current });

    // ❗防呆: 元件尚未掛載 or 重複初始化則中止
    if (!containerRef.current || !vcRef.current) return;
    if (vmRef.current !== null || rmRef.current !== null) {
      console.warn("⚠️ VManager / RManager already exists — skipping init.");
      return;
    }

    // 🧱 初始化參數
    const dataTotalRow = vcRef.current.sheetSize.nRow;
    const dataTotalCol = vcRef.current.sheetSize.nCol;
    const rowHeight = vcRef.current.cellHeight;
    const cellWidth = vcRef.current.cellWidth;

    // 🏗️ 建立 VManager / RManager
    vmRef.current = new VManager(
      containerDims,
      dataTotalRow,
      dataTotalCol,
      rowHeight,
      cellWidth,
      overScanRow,
      overScanCol,
    );

    rmRef.current = new RManager(
      transSystemName,
      rowHeight,
      cellWidth,
      containerRef.current,
      vcRef
    );

    // 🔌 掛上初始格子
    const cells = vmRef.current.getAllCells();
    cells.forEach((cell) => rmRef.current!.mountCell(cell));

    // 🧠 Scheduler 設定
    rmRef.current.transformScheduler.setExternalFlushMode(true);
    rmRef.current.contentScheduler.setExternalFlushMode(true);

    // 🧹 初始 flush（觸發 transform + content）
    rmRef.current.flush();

    // 🔄 觸發顯示更新（例如 lazy loading）
    vcRef.current.requestDisplayValueAndUpdate();

    // 🧼 清除行為
    return () => {
      const rm = rmRef.current;
      const vm = vmRef.current;
      // console.log("🔴 useMountVMCells cleanup", { vm: vmRef.current, rm: rmRef.current });
      if (rm && vm) {
        // ✅ flush & unmount 所有格子
        const cellsToUnmount = vm.getAllCells();
        // ✅ 安全地將所有 cell 的 unmount 排到 microtask queue
        for (const cell of cellsToUnmount) {
          queueMicrotask(() => rm.unmountCell(cell));
        }

        // flush 可保留同步
        rm.flush();
        
        // ❗⚠️ 關鍵：清掉 Ref，讓下一次 useEffect 能正常觸發
        vmRef.current = null;
        rmRef.current = null;
      }
    
    };
  }, []);
}
