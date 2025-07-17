import { RefObject, useEffect, useRef } from "react";
import { rc$ } from "./useInputCellStateManager";
import { useSheetView } from "../../SheetView-Context";
import { useContainerDimensions } from "../../../hooks/useContainerDimensions";

export const useTransformInputCell = (
  divRef: RefObject<HTMLElement | null>
) => {
  const { vcRef, containerRef } = useSheetView();
  const tickingRef = useRef(false);
  const containerDims = useContainerDimensions(containerRef);

  // ✅ 用於 resize 時重繪一次位置（不含 scroll）
  useEffect(() => {
    const divEl = divRef.current;
    const vc = vcRef.current;
    if (!divEl || !vc) return;

    const sub = rc$.subscribe(({ row, col }) => {
      if (row === null || col === null) return;
      const x = vc.cellWidth * (col + 1);
      const y = vc.cellHeight * (row + 1);
      divEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    return () => sub.unsubscribe();
  }, [containerDims, divRef, vcRef]);

  // ✅ stream 合併與動畫滾動邏輯
  useEffect(() => {
    const sub = rc$.subscribe((payload) => {  // ✅ 加入 payload 作為參數
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const { row, col } = payload;
        const vc = vcRef.current;
        const divEl = divRef.current;
        const container = containerRef.current;
        if (!vc || !divEl || !container) {
          tickingRef.current = false;
          return;
        }

        if (row === null || col === null) {
          tickingRef.current = false;
          return;
        }

        const cellHeight = vc.cellHeight;
        const cellWidth = vc.cellWidth;
        const x = cellWidth * (col + 1);
        const y = cellHeight * (row + 1);

        divEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        divEl.style.transition = "transform 48ms cubic-bezier(.35,1.01,.36,.98)";

        requestAnimationFrame(() => {
          let targetScrollLeft = container.scrollLeft;
          let targetScrollTop = container.scrollTop;

          // 使 cell 保持可見
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
            behavior: "smooth",
          });

          tickingRef.current = false;
        });
      });
    });

    return () => sub.unsubscribe();
  }, [vcRef, containerRef, divRef]);
};
