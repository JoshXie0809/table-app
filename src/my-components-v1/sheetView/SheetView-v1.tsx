import React, { RefObject, useEffect, useRef } from "react";
import { GridContent } from "./GridContent";
import { VirtualCells } from "../VirtualCells";

export interface SheetViewProps {
  vcRef: RefObject<VirtualCells>
}

export const SheetView11: React.FC<SheetViewProps> = ({
  vcRef,
}) =>
{
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const totalRow = vcRef.current!.sheetSize.nRow ;
  const totalCol = vcRef.current!.sheetSize.nCol;
  const rowHeight = 44;
  const cellWidth = 152;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    type ScrollJob = {
      dx: number;
      dy: number;
      start: number;
      duration: number;
      lastProgress: number;
    };

    const jobs: ScrollJob[] = [];
    let animating = false;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const baseDuration = 800;

    // 加速系統
    let lastScrollTime = 0;
    let scrollTick = 0;
    const maxTick = 24;
    const accelerationFactor = 1.2;

    // 慣性系統
    let lastDx = 0;
    let lastDy = 0;
    let inertiaTimeout: number | null = null;
    const inertiaDelay = 100;
    const inertiaMultiplier = 0.5;

    const animate = () => {
      const now = performance.now();
      let needNextFrame = false;

      for (const job of jobs) {
        const t = Math.min((now - job.start) / job.duration, 1);
        const progress = easeOutCubic(t);
        const deltaProgress = progress - job.lastProgress;

        container.scrollLeft += job.dx * deltaProgress;
        container.scrollTop += job.dy * deltaProgress;

        job.lastProgress = progress;

        if (t < 1) {
          needNextFrame = true;
        }
      }

      while (jobs.length > 0 && jobs[0].lastProgress >= 1) {
        jobs.shift();
      }

      if (jobs.length > 0 || needNextFrame) {
        requestAnimationFrame(animate);
      } else {
        animating = false;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaMode !== 0) return;
      event.preventDefault();

      const now = performance.now();
      const dt = now - lastScrollTime;

      // 判斷是否重置加速
      if (dt > 150) scrollTick = 0;
      scrollTick = Math.min(scrollTick + 1, maxTick);
      lastScrollTime = now;

      // 原始 delta 處理
      const rawDx = event.deltaX || (Math.abs(event.deltaY) < 1 ? event.deltaY : 0);
      const rawDy = event.deltaY;

      // 加速倍率
      const accel = Math.pow(accelerationFactor, scrollTick);
      const dx = Math.sign(rawDx) * cellWidth * 0.6 * accel;
      const dy = Math.sign(rawDy) * rowHeight * 0.8 * accel;

      // --- ⛔ 反方向滾動時清空 queue、停止動畫與慣性 ---
      if (jobs.length > 0) {
        const lastJob = jobs[jobs.length - 1];
        const reversedX = lastJob.dx !== 0 && Math.sign(dx) !== Math.sign(lastJob.dx);
        const reversedY = lastJob.dy !== 0 && Math.sign(dy) !== Math.sign(lastJob.dy);

        if (reversedX || reversedY) {
          jobs.length = 0;
          animating = false;
          scrollTick = 0;

          if (inertiaTimeout) {
            clearTimeout(inertiaTimeout);
            inertiaTimeout = null;
          }
        }
      }


      // 推入動畫任務
      jobs.push({
        dx,
        dy,
        start: performance.now(),
        duration: baseDuration,
        lastProgress: 0,
      });

      if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
      }

      // ---- 慣性系統 ----
      lastDx = dx;
      lastDy = dy;

      if (inertiaTimeout) clearTimeout(inertiaTimeout);
      inertiaTimeout = window.setTimeout(() => {
        const inertiaDx = lastDx * inertiaMultiplier;
        const inertiaDy = lastDy * inertiaMultiplier;

        if (inertiaDx !== 0 || inertiaDy !== 0) {
          jobs.push({
            dx: inertiaDx,
            dy: inertiaDy,
            start: performance.now(),
            duration: baseDuration,
            lastProgress: 0,
          });

          if (!animating) {
            animating = true;
            requestAnimationFrame(animate);
          }
        }
      }, inertiaDelay);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      jobs.length = 0;
      animating = false;
      if (inertiaTimeout) clearTimeout(inertiaTimeout);
    };
  }, [rowHeight, cellWidth]);

  
  return (
      <div
        ref={containerRef}
        id="container-virtual-cells"
        style={{
          width: "100%",
          height: "100%",
          overflow: "scroll",
          position: "relative",
          boxSizing: "border-box",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <div id="sizer" style={{ width: cellWidth * (totalCol + 1), height: rowHeight * (totalRow + 1) }} />
        <div id="vtable-content-grid" ref={gridRef} 
          style={{ position: "absolute", top: `${rowHeight}px`, left: `${cellWidth}px`, willChange: "transform"}}
        />

        <GridContent gridRef={gridRef} containerRef={containerRef} vcRef={vcRef}/>
      </div>
  );
}