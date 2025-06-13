import React, { RefObject, useEffect, useReducer, useRef, useState } from "react";
import { Sheet, sheetSize } from "../../sheet/sheet";
import  RenderGrid  from "./RenderGrid";
import RenderColHeader from "./RenderColHeader";
import RenderRowHeader from "./RenderRowHeader";
import { CellPosition } from "../SheetView";
// import { DirtyCells } from "../SheetView";
import { useSheetInteraction } from "./hook/useSheetInteraction";


function CanvasSettingsReducer(state: CanvasSettings, action: Partial<CanvasSettings>) {
  return {...state, ...action};
}


type CanvasSettings = {
  cellHeight: number;
  cellWidth: number;
  nRow: number;
  nCol: number;
  TotalHeight: number;
  TotalWidth: number;
}

interface CanvasTableProps {
  sheet: Sheet,
  onCellClick?: (rc: CellPosition) => void,
  onScroll?: (x: number, y: number) => void,
  onResize?: () => void,
  canvasRef: RefObject<HTMLCanvasElement>;
  // dirtyCells: DirtyCells;
};

const CanvasTable: React.FC<CanvasTableProps> = ({
  sheet,
  onCellClick,
  onScroll,
  onResize,
  canvasRef,
  // dirtyCells,
}) => {

  const animationFrameRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
  }, []);

  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollSpacerRef = useRef<HTMLDivElement>(null);

  useSheetInteraction(canvasRef, containerRef, sheet, onCellClick);


  // 動態更新 cell 高度和寬度
  const [canvasSettings, setCanvasSettings] = useReducer(CanvasSettingsReducer, {
    cellHeight: sheet.sheetCellHeight,
    cellWidth: sheet.sheetCellWidth,
    nRow: sheetSize(sheet)[0],
    nCol: sheetSize(sheet)[1],
    TotalHeight: 2 +  sheetSize(sheet)[0] * sheet.sheetCellHeight,
    TotalWidth: 2 + sheetSize(sheet)[1] * sheet.sheetCellWidth,
  });

  // 動態更新 Container 尺寸
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const tableContainer = containerRef.current;
    if (!tableContainer) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Check if contentRect exists (it should for Element observations)
        if (entry.contentRect) {
          if(onResize) onResize()

          setContainerDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    observer.observe(tableContainer);

    return () => {
      observer.unobserve(tableContainer);
    };
  }, []); // Empty dependency array means this effect runs once on mount


  useEffect(() => {
    setCanvasSettings({
      cellHeight: sheet.sheetCellHeight,
      cellWidth: sheet.sheetCellWidth,
      nRow: sheetSize(sheet)[0],
      nCol: sheetSize(sheet)[1],
      TotalHeight: 4 +  sheetSize(sheet)[0] * sheet.sheetCellHeight + sheet.sheetCellHeight, 
      TotalWidth: 4 + sheetSize(sheet)[1] * sheet.sheetCellWidth + sheet.sheetCellWidth,
    })

  }, [sheet])
  

  useEffect(() => {
    const scrollSpacer = document.getElementById("canvas-table-scrollSpacer");
    const tableContainer = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if(!canvas || !ctx || !scrollSpacer ) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = containerDimensions.width * dpr;
    canvas.height = containerDimensions.height * dpr;
    canvas.style.width = `${containerDimensions.width}px`;
    canvas.style.height = `${containerDimensions.height}px`;

    const scrollLeft = tableContainer!.scrollLeft;
    const scrollTop = tableContainer!.scrollTop;

    // initial-draw
    RenderGrid({
      ctx,
      sheet,
      scrollLeft,
      scrollTop,
      // dirtyCells,
      cellWidth: canvasSettings.cellWidth,
      cellHeight: canvasSettings.cellHeight,
      canvasWidth: ctx.canvas.width / dpr,
      canvasHeight: ctx.canvas.width / dpr,
    });

    RenderColHeader({
      ctx,
      sheet,
      scrollLeft,
      cellWidth: canvasSettings.cellWidth,
      cellHeight: canvasSettings.cellHeight,
      canvasWidth: ctx.canvas.width / dpr,
    })

    RenderRowHeader({
      ctx,
      sheet,
      scrollTop,
      cellWidth: canvasSettings.cellWidth,
      cellHeight: canvasSettings.cellHeight,      
      canvasHeight: ctx.canvas.width / dpr,
    })

    ctx.clearRect(0, 0, canvasSettings.cellWidth, canvasSettings.cellHeight);
    
  }, [canvasSettings, sheet, containerDimensions]); // ✅ 加上依賴


  const handleScroll = () => {
    const dpr = window.devicePixelRatio || 1;
    const tableContainer = document.getElementById("canvas-table-tableContainer");
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!tableContainer || !ctx) return;

    const scrollLeft = tableContainer.scrollLeft;
    const scrollTop = tableContainer.scrollTop;

    if(onScroll) onScroll(scrollLeft, scrollTop);

    // ✅ 若前一幀尚未完成，先取消
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // ✅ 安排下一幀
    animationFrameRef.current = requestAnimationFrame(() => {

      RenderGrid({
        ctx,
        sheet,
        scrollLeft,
        scrollTop,
        cellWidth: canvasSettings.cellWidth,
        cellHeight: canvasSettings.cellHeight,
        canvasWidth: ctx.canvas.width / dpr,
        canvasHeight: ctx.canvas.width / dpr,
        // dirtyCells,
        options: {
          font: "14px Segoe UI, sans-serif",
          showBorder: true,
          borderColor: "#ddd",
          textColor: "#000",
          overscan: 2,
        }
      });

      RenderRowHeader({
        ctx,
        sheet,
        scrollTop,
        cellWidth: canvasSettings.cellWidth,
        cellHeight: canvasSettings.cellHeight,      
        canvasHeight: ctx.canvas.width / dpr,
      })

      RenderColHeader({
        ctx,
        sheet,
        scrollLeft,
        cellWidth: canvasSettings.cellWidth,
        cellHeight: canvasSettings.cellHeight,
        canvasWidth: ctx.canvas.width / dpr,
      })

      ctx.clearRect(0, 0, canvasSettings.cellWidth, canvasSettings.cellHeight);

      
    });
  };

  return(
    <div id="canvas-table-tableContainer" ref={containerRef}
      style={{ height: "100%", width: "100%", overflow: "scroll", position: "relative"}}
      onScroll={handleScroll}
    >
      <canvas ref={canvasRef} 
        style={{ 
          position: "sticky",
          top: 0,
          left: 0,
        }} 
      />

      <div id="canvas-table-scrollSpacer" 
        ref={scrollSpacerRef}
        style={{ 
          height: `${canvasSettings.TotalHeight}px`, width: `${canvasSettings.TotalWidth}px`, 
          position: "absolute", top: 0, left: 0, pointerEvents: "none",
        }} /> 
    </div>
  )
}


export default CanvasTable