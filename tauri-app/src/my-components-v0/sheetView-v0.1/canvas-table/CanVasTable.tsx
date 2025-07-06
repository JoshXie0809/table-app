import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { drawGrid } from "./draw/drawGrid";

import { CanvasLayoutEngine } from "./cavas-layout-engine/CanvasLayoutEngine";
import { CanvasContext } from "./CanvasContext";

export interface CanvasTableProps {
  layoutEngine: CanvasLayoutEngine,

  onCellClick?: (row: number, column: number) => void;
  onResize?: () => void;
  handleScroll?: (event: React.UIEvent<HTMLDivElement>) => void;

  children?: React.ReactNode;
}

export const CanvasTable: React.FC<CanvasTableProps> = ({
  layoutEngine,
  children,
}) => {

  const sheet = layoutEngine.getSheet();
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null);

    // ✅ 準備要共享給子元件的 context value
  const contextValue = {
    // 透過 !! 將 .current 物件轉換為布林值，表示 DOM 是否已掛載
    isReady: !!(containerRef.current && mainCanvasRef.current && hoverCanvasRef.current),
    layoutEngine,
    containerRef,
    mainCanvasRef,
    hoverCanvasRef,
  };

  const [totalRows, totalCols] = layoutEngine.getSheetSize();
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
    const canvas = mainCanvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    layoutEngine.updateViewport(
      container.scrollLeft,
      container.scrollTop,
      container.offsetWidth,
      container.offsetHeight
    );

    const dpr = window.devicePixelRatio || 1;

    // 設定畫布大小
    const cw = Math.round(containerDimensions.width * dpr);
    const ch = Math.round(containerDimensions.height * dpr);

    canvas.width = cw;
    canvas.height = ch;

    canvas.style.width = `${containerDimensions.width}px`;
    canvas.style.height = `${containerDimensions.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const layout = layoutEngine.getLayout();

    drawGrid(ctx, layout, sheet, dpr);

  }, [layoutEngine, containerDimensions]);

  // 讓畫面輸出好看
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
    
    draw()

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw]);


  return (
    <CanvasContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        style={{
          height: "100%",
          width: "100%",
          overflow: "scroll",
          position: "relative",
        }} 
      >

        <div style={{position: "sticky", top: 0, left: 0, zIndex: 1}}>
          <canvas
            ref={mainCanvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          />

          <canvas
            ref={hoverCanvasRef}
            style={{
              position: "absolute",
              zIndex: 1,
              top: 0,
              left: 0,
              pointerEvents: 'none', // ✅ 關鍵！讓滑鼠事件「穿透」這層畫布
            }}
          />

        

        </div>
        

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





      {children}
      </div>
    </CanvasContext.Provider>
  );
    
};
