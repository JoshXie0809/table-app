import { RefObject, useEffect } from "react"
import { useSheetView } from "../../SheetView-Context";
import { getCellPositionOnMainContainer } from "../toolfunction";
import { target$ } from "./SystemQuickEdit";
import { rc$ } from "./useInputCellStateManager";
import { useContainerDimensions } from "../../../hooks/useContainerDimensions";

export const useTransformInputCell = (
  divRef: RefObject<HTMLElement | null>
) => 
{
  const { vcRef, containerRef } = useSheetView();
  const containerDims = useContainerDimensions(containerRef);

  useEffect(() => {
    const divEl = divRef.current;
    if(!divEl) return;
    divEl.style.transform = `translate3d(${0}px, ${0}px, 0)`;
  }, [containerDims])

  useEffect(() => {
    const sub = target$.subscribe(({target}) => {
      if(!target) return;
      const vc = vcRef.current;
      const divEl = divRef.current;
      if(!vc || !divEl) return;
      const cellHeight = vc.cellHeight;
      const cellWidth =  vc.cellWidth;
      // 移動 input 框
      const {x, y} = getCellPositionOnMainContainer(target, 0, 0, cellHeight, cellWidth);
      divEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      divEl.style.transition = "transform 48ms ease-out";
    });
    return () => sub.unsubscribe();
  })

  useEffect(() => {
    const sub = rc$.subscribe(({row, col}) => {
      const vc = vcRef.current;
      const divEl = divRef.current;
      const container = containerRef.current;
      if(!vc || !divEl || !container) return;
      const rowHeight = vc.cellHeight;
      const cellWidth =  vc.cellWidth;

      // 移動 input 框
      const x = cellWidth * (col + 1);
      const y = rowHeight * (row + 1);
      divEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      divEl.style.transition = "transform 24ms ease";
      
      let targetScrollLeft = container.scrollLeft;
      let targetScrollTop = container.scrollTop;

      if (x - container.scrollLeft <= 0) {
        targetScrollLeft = Math.max(container.scrollLeft - cellWidth, 0);
      }
      if (x - container.scrollLeft >= container.clientWidth) {
        targetScrollLeft = Math.min(
          container.scrollLeft + cellWidth,
          container.scrollWidth - container.clientWidth
        );
      }
      if (y - container.scrollTop <= 0) {
        targetScrollTop = Math.max(container.scrollTop - rowHeight, 0);
      }
      if (y - container.scrollTop >= container.clientHeight) {
        targetScrollTop = Math.min(
          container.scrollTop + rowHeight,
          container.scrollHeight - container.clientHeight
        );
      }

      container.scrollTo({
        left: targetScrollLeft,
        top: targetScrollTop,
      });

    })

    return () => sub.unsubscribe();
  })
}