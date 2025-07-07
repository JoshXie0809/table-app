import { useEffect, useRef } from "react";
import { useSheetView } from "../../SheetView-Context"
import { TransSystemName } from "../Dirty/DirtyTranslateCellScheduler";
import { useContainerDimensions } from "../../../hooks/useContainerDimensions";

export const SystemHover: React.FC = () => {
  const { containerRef, vcRef } = useSheetView();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerDims = useContainerDimensions(containerRef);


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

    return () => {
      if(!containerRef.current) return;
      const container = containerRef.current;
      container.removeChild(canvas);
      canvasRef.current = null;
    };
  }, [containerRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = containerRef.current;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }, [containerDims]);


  // 監聽滾動事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if(!ctx) return;

    const handleScroll = () => {
      if(!containerRef.current) return;
      if(!canvasRef.current) return;
      
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if(!ctx) return;

      let ticking = false;
      if (!ticking) {
        ticking = true; // 立即設定為 true，表示已排程一個幀
        requestAnimationFrame(() => {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
    };
  }, [containerRef])


  // 監聽滑鼠位置
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    const vc = vcRef.current;
    if(!vc) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const canvas = canvasRef.current;
      if(!canvas) return;
      const ctx = canvas.getContext("2d");
      if(!ctx) return;
      const vc = vcRef.current;
      if(!vc) return;

      const scrollTop = container.scrollTop;
      const scrollLeft = container.scrollLeft;
      const rowHeight = vc.cellHeight;
      const cellWidth = vc.cellWidth;

      // 取得滑鼠目前指到的畫面座標
      const { clientX, clientY } = e;

      // 查出目前滑鼠底下的元素
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      let ticking = false;

      if(!ticking) {
        ticking = true;
        const target = findTransSystemElement(el);

        requestAnimationFrame(() => {
          drawCell(target, ctx, scrollTop, scrollLeft, rowHeight, cellWidth);
          ticking = false;
        })
      }
    };

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      const container = containerRef.current;
      if(!container) return;
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [containerRef]);

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

function drawCell(
  target: HTMLElement | null, 
  ctx: CanvasRenderingContext2D, 
  scrollTop: number, scrollLeft: number,
  rowHeight: number, cellWidth: number,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "rgba(194, 221, 241, 0.4)";

  if(target) {
    const transSystemName = target.dataset.transSystem as TransSystemName;
    const transX = Number(target.dataset.transX);
    const transY = Number(target.dataset.transY);

    let offsetX = 0;
    let offsetY = 0;
    let x = 0;
    let w = 0;
    let y = 0;
    let h = 0;

    switch(transSystemName) {
      case "cells":
        offsetX = cellWidth;
        offsetY = rowHeight;
        x = transX + offsetX - scrollLeft;
        w = cellWidth;

        if(x < cellWidth) {
          w = x;
          x = cellWidth;
        }
          
        y = transY + offsetY - scrollTop;
        h = rowHeight;

        if(y < rowHeight) {
          h = y;
          y = rowHeight;
        }

        ctx.fillRect(x, y, w, h);
        ctx.fillRect(x, 0, w, rowHeight);
        ctx.fillRect(0, y, cellWidth, h);

        break;
      
      case "column-header":
        offsetX = cellWidth;
        offsetY = scrollTop;

        x = transX + offsetX - scrollLeft;
        w = cellWidth;
        y = transY + offsetY - scrollTop;
        h = rowHeight;

        if(x < cellWidth) {
          w = x;
          x = cellWidth;
        }

        ctx.fillRect(x, y, w, h);
        break;
      
      case "row-header":
        offsetX = scrollLeft;
        offsetY = rowHeight;

        x = transX + offsetX - scrollLeft;
        w = cellWidth;
        y = transY + offsetY - scrollTop;
        h = rowHeight;

        if(y < rowHeight) {
          h = y;
          y = rowHeight;
        }

        ctx.fillRect(x, y, w, h);
        break;

      case "tlc":
        offsetX = 0;
        offsetY = 0;
        break;

      default:
        break;
    }
  }
}

