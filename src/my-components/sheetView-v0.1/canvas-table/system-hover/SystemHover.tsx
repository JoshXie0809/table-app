
import React, { useEffect, useState, useContext } from "react";
import { CanvasContext } from "../CanvasContext"; // ✅ 引入 Context


export const SystemHover: React.FC = () => {
  const { isReady, layoutEngine, containerRef, hoverCanvasRef } = useContext(CanvasContext);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);


  // 監聽滑鼠事件
  useEffect(() => {
    if (!isReady) return;

    const container = containerRef!.current!;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;
      const cell = layoutEngine!.getCellAtPoint(canvasX, canvasY);

      if (cell?.row !== hoveredCell?.row || cell?.col !== hoveredCell?.col) 
        setHoveredCell(cell);
      
    };

    const handleMouseLeave = () => setHoveredCell(null);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };

  }, [isReady, layoutEngine, hoveredCell]);

// Effect 2: 負責在 hoverCanvas 上繪製視覺效果。
  useEffect(() => {
    if (
      !isReady ||
      !layoutEngine ||
      !hoverCanvasRef?.current ||
      !containerRef?.current
    ) {
      return;
    }
    
    const canvas = hoverCanvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    if (
      canvas.width !== container.clientWidth ||
      canvas.height !== container.clientHeight
    ) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (hoveredCell) {
      
      const cellLayout = layoutEngine.getCellLayout(
        hoveredCell.row,
        hoveredCell.col
      );

      if (cellLayout) {
        ctx.fillStyle = "rgba(144, 202, 249, 0.25)";
        let headerWidth = layoutEngine.getHeaderWidth();
        let headerHeight = layoutEngine.getHeaderHeight();
        let {x, y, w, h} = cellLayout.position
        
        if (x < headerWidth) {
          w -= headerWidth - x
          x = headerWidth
        }

        if (y < headerHeight) {
          h -= headerHeight - y
          y = headerHeight
        }

        ctx.fillRect(x, y, w, h);
      }
    }
  }, [isReady, hoveredCell, layoutEngine, containerRef, hoverCanvasRef]);

  return null;
}