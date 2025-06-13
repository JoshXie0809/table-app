import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { SheetVirtualTableImpl } from "../sheet-virtual-table/SheetVirtualTable";
import { Sheet, sheetSize } from "../../sheet/sheet";
import { drawGrid } from "./draw/drawGrid";
import { useVirtualTableRenderer } from "../hooks/useVirtualTableRenderer";

export interface CanvasTableProps {
  sheet: Sheet,
  virtualTable: SheetVirtualTableImpl;
  canvasRef: RefObject<HTMLCanvasElement>;
  containerRef: RefObject<HTMLDivElement>;

  onCellClick?: (row: number, column: number) => void;
  onResize?: () => void;
  handleScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export const CanvasTable: React.FC<CanvasTableProps> = ({
  sheet,
  virtualTable,
  onCellClick,
  onResize,
  containerRef,
  handleScroll,
  canvasRef,
}) => {
  
  const [totalRows, totalCols] = sheetSize(sheet);
  const cellHeight = sheet.sheetCellHeight || 30;
  const cellWidth = sheet.sheetCellWidth || 100;

  const totalHeight = (1 / 4 + totalRows) * cellHeight + cellHeight;
  const totalWidth = (1 / 4 + totalCols) * cellWidth + cellWidth;

  const animationFrameRef = useRef<number | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });


  // ✅ ResizeObserver：追蹤容器大小變化
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
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

  // ✅ draw 函數：讀取 ref.current 在內部，確保即時正確
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;

    // 設定畫布大小
    canvas.width = Math.round(containerDimensions.width * dpr);
    canvas.height = Math.round(containerDimensions.height * dpr);
    canvas.style.width = `${containerDimensions.width}px`;
    canvas.style.height = `${containerDimensions.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGrid(ctx, {
      virtualTable,
      container,
      canvas,
      cellWidth,
      cellHeight,
      dpr,
    });
  }, [virtualTable, canvasRef, containerRef, containerDimensions]);

  // ✅ 外部 sheet 更新時 → 自動 draw
  useVirtualTableRenderer({
    sheet,
    virtualTable,
    canvas: canvasRef.current,
    container: containerRef.current,
    drawFn: draw,
  });

  // ✅ 初始化時立即繪製一次（非等待 scroll）
  useEffect(() => {
    draw();
  }, [draw]);

  // ✅ Scroll handler：僅負責觸發重繪
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    container.addEventListener("scroll", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw]);

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
