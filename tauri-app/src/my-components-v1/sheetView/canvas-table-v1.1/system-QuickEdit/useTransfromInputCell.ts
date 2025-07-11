import { RefObject, useEffect } from "react"
import { useSheetView } from "../../SheetView-Context";
import { getCellPositionOnMainContainer } from "../toolfunction";
import { target$ } from "./SystemQuickEdit";


export const useTransformInputCell = (
  divRef: RefObject<HTMLElement | null>
) => 
{
  const { vcRef } = useSheetView();
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
}