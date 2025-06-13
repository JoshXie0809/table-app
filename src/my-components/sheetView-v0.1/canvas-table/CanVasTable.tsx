import React, { RefObject, useEffect, useRef, useState } from "react";
import { SheetVirtualTableImpl } from "../sheet-virtual-table/SheetVirtualTable";
import { sheetSize } from "../../sheet/sheet";
import { getCellRenderer } from "../../cell/cellPluginSystem";

export interface CanvasTableProps {
  virtualTable: SheetVirtualTableImpl;
  canvasRef: RefObject<HTMLCanvasElement>;
  containerRef: RefObject<HTMLDivElement>;

  onCellClick?: (row: number, column: number) => void;
  onResize?: () => void;
  handleScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export const CanvasTable: React.FC<CanvasTableProps> = ({
  virtualTable,
  onCellClick,
  onResize,
  containerRef,
  handleScroll,
  canvasRef,
}) => {
  const sheet = virtualTable.sheet;
  const [totalRows, totalCols] = sheetSize(sheet);
  const cellHeight = sheet.sheetCellHeight || 30;
  const cellWidth = sheet.sheetCellWidth || 100;

  const totalHeight = (1/4+totalRows) * cellHeight + cellHeight;
  const totalWidth =  (1/4+totalCols) * cellWidth + cellWidth;

  const animationFrameRef = useRef<number | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect) {
          setContainerDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(containerDimensions.width * dpr);
    canvas.height = Math.round(containerDimensions.height * dpr);
    canvas.style.width = `${containerDimensions.width}px`;
    canvas.style.height = `${containerDimensions.height}px`;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;

      virtualTable.updateVisibleRange(
        scrollLeft,
        scrollTop,
        containerDimensions.width,
        containerDimensions.height
      );

      const visibleData = virtualTable.getVisibleData();
      const visibleRange = virtualTable.visibleRange;

      const rowOffset = scrollTop % cellHeight;
      const colOffset = scrollLeft % cellWidth;

      const font = "14px system-ui, sans-serif";
      const paddingX = 12;
      const showBorder = true;
      const borderColor = "#ddd";
      const textColor = "#000";

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      // ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      for (let i = 0; i < visibleData.length; i++) {
        const cellTop = (i+1) * cellHeight - rowOffset;

        for (let j = 0; j < visibleData[i].length; j++) {
          const cellLeft = (j+1) * cellWidth - colOffset;
          const cell = visibleData[i][j];

          ctx.fillStyle = (visibleRange.startRow + i) % 2 === 0 ? "#fff" : "#f9f9f9";
          ctx.fillRect(cellLeft, cellTop, cellWidth, cellHeight);

          if (showBorder) {
            ctx.strokeStyle = borderColor;
            ctx.strokeRect(cellLeft, cellTop, cellWidth, cellHeight);
          }

          const renderer = getCellRenderer(cell.type);
          if (renderer) {
            renderer(ctx, cell, cellLeft, cellTop, cellWidth, cellHeight, {
              paddingX,
              font,
              textColor,
            });
          }
        }
      }

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      ctx.font = font;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 1;

      const VisibleColumnHeaders = virtualTable.getVisibleColumnHeader();
      for(let j = 0; j < VisibleColumnHeaders.length; j++) {
        const cellLeft = (j + 1) * cellWidth - colOffset;
        // 背景
          ctx.fillStyle = "#f9f9f9";
          ctx.fillRect(cellLeft, 0, cellWidth, cellHeight);
    
        // 邊框
        if (showBorder) {
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(cellLeft, 0, cellWidth, cellHeight);
        }
    
        // 文字
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";      // 水平置中（center of the x position）
        ctx.textBaseline = "middle";   // 垂直置中（center of the y position）
        ctx.font = "bold 14px system-ui, sans-serif";
        
        ctx.fillText(VisibleColumnHeaders[j], paddingX + cellLeft + cellWidth / 2, 0 + cellHeight / 2);
      }

      ctx.font = font;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 1;

      const VisibleRowHeaders = virtualTable.getVisibleRowHeader();
      for(let i = 0; i < VisibleRowHeaders.length; i++) {
        const cellTop = (i + 1) * cellHeight - rowOffset;
        // 背景
        ctx.fillStyle = "#f9f9f9";
        ctx.fillRect(0, cellTop, cellWidth, cellHeight);
    
        // 邊框
        if (showBorder) {
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(0, cellTop, cellWidth, cellHeight);
        }
    
        // 文字
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";      // 水平置中（center of the x position）
        ctx.textBaseline = "middle";   // 垂直置中（center of the y position）
        ctx.font = "bold 14px system-ui, sans-serif";
        
        ctx.fillText(VisibleRowHeaders[i],  cellWidth / 2, cellTop + cellHeight / 2);
      }

      ctx.fillStyle = "#f9f9f9";
      ctx.fillRect(0, 0, cellWidth, cellHeight);

      ctx.strokeStyle = borderColor;
      ctx.strokeRect(0, 0, cellWidth, cellHeight);
      ctx.restore();

    };
    


    const onScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    container.addEventListener("scroll", onScroll);
    draw(); // 初始繪製一次

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [canvasRef, containerRef, containerDimensions, virtualTable]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        width: "100%",
        overflow: "scroll",
        position: "relative",
      }}
      onScroll={handleScroll}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "sticky",
          top: 0,
          left: 0,
        }}
      />
      <div
        id="canvas-table-scrollSpacer"
        style={{
          height: `${totalHeight}px`,
          width: `${totalWidth}px`,
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
