import { RefObject, useEffect, useRef } from "react";
import { merge } from "rxjs";
import { auditTime } from "rxjs/operators";
import { target$ } from "./SystemQuickEdit";
import { rc$ } from "./useInputCellStateManager";
import { useSheetView } from "../../SheetView-Context";
import { useContainerDimensions } from "../../../hooks/useContainerDimensions";

export const useTransformInputCell = (
  divRef: RefObject<HTMLElement | null>
) => {
  const { vcRef, containerRef } = useSheetView();
  const tickingRef = useRef(false);
  const latestState = useRef<{ row: number, col: number, target: any }>({ row: 0, col: 0, target: null });
  const containerDims = useContainerDimensions(containerRef);

  useEffect(() => {
    // container resize 時也刷新 inputCell 位置
    const divEl = divRef.current;
    const { row, col } = latestState.current;
    const vc = vcRef.current;
    if (!divEl || !vc) return;
    const x = vc.cellWidth * (col + 1);
    const y = vc.cellHeight * (row + 1);
    divEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, [containerDims, divRef, vcRef]);

  useEffect(() => {
    const sub = merge(
      rc$.pipe(auditTime(0)),
      target$.pipe(auditTime(0)),
      // ... 其他 stream 也可加入
    ).subscribe((payload: any) => {
      // 儲存最新狀態
      if (payload.row !== undefined && payload.col !== undefined) {
        latestState.current = { ...latestState.current, row: payload.row, col: payload.col };
      }
      if (payload.target !== undefined) {
        latestState.current = { ...latestState.current, target: payload.target };
      }
      if (tickingRef.current) return;
      tickingRef.current = true;

      // STEP 1: 先定位 inputCell
      requestAnimationFrame(() => {
        const { row, col } = latestState.current;
        const vc = vcRef.current;
        const divEl = divRef.current;
        const container = containerRef.current;
        if (!vc || !divEl || !container) {
          tickingRef.current = false;
          return;
        }
        const cellHeight = vc.cellHeight;
        const cellWidth = vc.cellWidth;
        const x = cellWidth * (col + 1);
        const y = cellHeight * (row + 1);

        divEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        divEl.style.transition = "transform 48ms cubic-bezier(.35,1.01,.36,.98)"; // 可自訂曲線

        // STEP 2: 再 scroll（用 raf 可避免 transform 與 scroll 同步導致跳動）
        requestAnimationFrame(() => {
          let targetScrollLeft = container.scrollLeft;
          let targetScrollTop = container.scrollTop;

          // 檢查 inputCell 是否進入可視範圍，若否再捲動
          if (x <= container.scrollLeft + cellWidth) {
            targetScrollLeft = x - cellWidth;
          } else if (x + cellWidth > container.scrollLeft + container.clientWidth) {
            targetScrollLeft = x + cellWidth - container.clientWidth;
          }
          if (y <= container.scrollTop + cellHeight) {
            targetScrollTop = y - cellHeight;
          } else if (y + cellHeight > container.scrollTop + container.clientHeight) {
            targetScrollTop = y + cellHeight - container.clientHeight;
          }

          container.scrollTo({
            left: targetScrollLeft,
            top: targetScrollTop,
            behavior: "smooth", // 支援平滑動畫
          });
          tickingRef.current = false;
        });
      });
    });
    return () => sub.unsubscribe();
  }, [vcRef, containerRef, divRef]);
};
