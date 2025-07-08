import React, { useEffect, useRef } from "react";
import { useSheetView } from "../../SheetView-Context"
import { useContainerDimensions } from "../../../hooks/useContainerDimensions";
import { TransSystemName } from "../RenderManager";
import { useTickingRef } from "../../../hooks/useTickingRef";

import { throttledPointerActivity$ } from "../../../pointer-state-manager/PointerStateManger";
import { isScrolling$, scrolling$ } from "../../../scroll-manager/ScrollManager";
import { combineLatest, filter, map } from "rxjs";

export const SystemHover: React.FC = () => {
  const { containerRef, vcRef } = useSheetView();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerDims = useContainerDimensions(containerRef);
  const tickingRefHandleScroll = useTickingRef();
  const tickingRefHandlePointerMove = useTickingRef();
  
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
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas && container.contains(canvas)) {
        container.removeChild(canvas);
      }
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
    const sub = scrolling$.subscribe((payload) => {
      if(!containerRef.current) return;
      if(!canvasRef.current) return;
      if(!payload) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;

      // 比照是否相同
      if (!(payload.target instanceof HTMLElement)) return;
      if(payload.target !== container) return;

      if (!tickingRefHandleScroll.current) {
        tickingRefHandleScroll.current = true; // 立即設定為 true，表示已排程一個幀
        requestAnimationFrame(() => {
          const scrollTop = container.scrollTop;
          const scrollLeft = container.scrollLeft;
          canvas.style.transform = `translate3d(${scrollLeft}px, ${scrollTop}px, 0)`;    
          tickingRefHandleScroll.current = false; // 所有更新完成後，將 ticking 設為 false
        });
      }

    })

    return () => sub.unsubscribe();
  })

  
  // 合併兩個 stream 並且過濾出「hovering 且未滾動」
  const allowHover$ = combineLatest([
    throttledPointerActivity$,
    isScrolling$,  
  ]).pipe(
    filter(([activity, isScrolling]) => activity.state === "hovering" && !isScrolling),
    map(([activity, _]) => activity)
  );

  useEffect(() => {
    const sub = allowHover$.subscribe(({event}) => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const vc = vcRef.current;

      if (!container || !canvas || !ctx || !vc) return;
      if (tickingRefHandlePointerMove.current) return;

      tickingRefHandlePointerMove.current = true;

      const { scrollTop, scrollLeft } = container;
      const { cellHeight: rowHeight, cellWidth } = vc;
      const { clientX, clientY } = event;

      const hoveredElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const target = findTransSystemElement(hoveredElement);

      requestAnimationFrame(() => {
        drawCell(target, ctx, scrollTop, scrollLeft, rowHeight, cellWidth);
        tickingRefHandlePointerMove.current = false;
      });
    })
  
    return () => sub.unsubscribe(); // 清除訂閱
  }, [])

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