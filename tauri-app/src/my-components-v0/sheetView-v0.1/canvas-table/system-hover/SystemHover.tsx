
import React, { useEffect, useState, useContext } from "react";
import { CanvasContext } from "../CanvasContext"; // ✅ 引入 Context
import { throttle } from 'lodash';

export const SystemHover: React.FC = () => {
  const { isReady, layoutEngine, containerRef, hoverCanvasRef } = useContext(CanvasContext);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);


  // 監聽滑鼠事件
  useEffect(() => {
    if (!isReady) return;

    const container = containerRef!.current!;

    const handleMouseMove = throttle((event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;
      const cell = layoutEngine!.getCellAtPoint(canvasX, canvasY);

      if (cell?.row !== hoveredCell?.row || cell?.col !== hoveredCell?.col) 
        setHoveredCell(cell);  
    });

    const handleMouseLeave = throttle(() => setHoveredCell(null));

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


  useEffect(() => {
      if ( !isReady || !containerRef?.current || !layoutEngine || !hoveredCell) {
        return;
      }
  
      const container = containerRef.current;
      let animationFrameId: number; // 用來儲存 requestAnimationFrame 的 ID
  
      const handleScroll = () => {
      // ✨ 優化點：取消上一個未執行的 frame，避免重複執行
      cancelAnimationFrame(animationFrameId);
  
      // ✨ 優化點：請求瀏覽器在下一次繪製時才執行更新
      animationFrameId = requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const cellLayout = layoutEngine.getCellLayout(hoveredCell.row, hoveredCell.col);
  
        if (cellLayout) {
          const { x, y } = cellLayout.position;
          const newTop = containerRect.top + y;
          const newLeft = containerRect.left + x;
          setHoveredCell({ row: newTop, col: newLeft });
        }
      });
    };
  
    container.addEventListener('scroll', handleScroll, { passive: true }); // passive: true 告訴瀏覽器這個監聽器不會阻止滾動
  
    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId); // ✨ 組件卸載時，確保取消最後一個 frame
    };
  }, [hoveredCell]);

  

  return null;
}