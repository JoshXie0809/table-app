import { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { QuickEditInputCell, QuickEditInputCellHandle } from "./InputCell";
import { useSheetView } from "../../SheetView-Context";

export const useInputCell = () => {
  const { containerRef, vcRef} = useSheetView();
  const divRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const inputCellRef = useRef<QuickEditInputCellHandle | null>(null);

  useEffect(() => {
    if(!containerRef.current) return;
    if(!vcRef.current)return;

    const container = containerRef.current;
    const divEl = document.createElement("div");
    divRef.current = divEl;

    divEl.style.width = `0px`;
    divEl.style.height = `0px`;
    divEl.style.backgroundColor = "red";
    divEl.style.position = `absolute`;
    divEl.style.top = `0px`;
    divEl.style.left = `0px`;
    divEl.style.willChange = "transform";
    divEl.style.zIndex = "0";

    container.appendChild(divEl);
    const root = createRoot(divEl);
    rootRef.current = root;
    root.render(
      <>
        <QuickEditInputCell vcRef={vcRef} containerRef={containerRef} ref={inputCellRef}/>
      </>
    );

    return () => {
      const container = containerRef.current;
      const divEl = divRef.current;
      const root = rootRef.current;

      if(root) 
        queueMicrotask(() => root.unmount())
        
      if(container && divEl && container.contains(divEl)) 
        container.removeChild(divEl)
      
      rootRef.current = null;
      divRef.current = null;
    }
  }, []);

  
  return ({divRef, rootRef, inputCellRef})
}
