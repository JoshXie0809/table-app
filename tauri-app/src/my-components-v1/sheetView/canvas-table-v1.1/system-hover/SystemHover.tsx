import { useEffect, useRef } from "react";
import { useSheetView } from "../../SheetView-Context"

export const SystemHover: React.FC = () => {
  const { containerRef, vcRef } = useSheetView();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 掛畫布到 containerRef
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");

    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "10";
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    canvas.style.willChange = "transform";

    container.appendChild(canvas);
    canvasRef.current = canvas;

    const handleScroll = () => {
      if(!containerRef.current) return;
      if(!canvasRef.current) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;

      let ticking = false;
      if (!ticking) {
        ticking = true; // 立即設定為 true，表示已排程一個幀

        requestAnimationFrame(() => {
          const scrollTop = container.scrollTop;
          const scrollLeft = container.scrollLeft;
          canvas.style.transform = `translate3d(${scrollLeft}px, ${scrollTop}px, 0)`;    
          ticking = false; // 所有更新完成後，將 ticking 設為 false
        });
      }

      
    }

    container.addEventListener("scroll", handleScroll);

    return () => {
      if(!containerRef.current) return;
      const container = containerRef.current;

      container.removeEventListener("scroll", handleScroll);
      container.removeChild(canvas);

    };
  }, [containerRef]);

  // 監聽滑鼠位置
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 取得滑鼠目前指到的畫面座標
      const { clientX, clientY } = e;

      // 查出目前滑鼠底下的元素
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const target = findTransSystemElement(el);


      if (target) {
        const system = target.dataset.transSystem;
        const transX = target.dataset.transX;
        const transY = target.dataset.transY;

        console.log(`滑鼠指到 ${system} 區塊，位置為 (${transX}, ${transY})`);
      } else {
        console.log("未指向任何 trans-system 元素");
      }

    };

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null;
};


function findTransSystemElement(el: HTMLElement | null): HTMLElement | null {
  while (el) {
    if (el.dataset?.transSystem) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}