import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Sheet, updateSheetCellMatrix } from "../sheet/sheet";
import { SheetVirtualTableImpl } from "./sheet-virtual-table/SheetVirtualTable";
import { Cell } from "../cell/cellPluginSystem";
import { CanvasTable } from "./canvas-table/CanVasTable";
import { useVirtualTableRenderer } from "./hooks/useVirtualTableRenderer";
import { drawGrid } from "./canvas-table/draw/drawGrid";
import { CanvasLayoutEngine } from "./canvas-table/cavas-layout-engine/CanvasLayoutEngine";

export interface SheetViewProps {
  sheet: Sheet,
  setSheet: React.Dispatch<React.SetStateAction<Sheet>>
}

const SheetView01: React.FC<SheetViewProps> = ({
  sheet,
  setSheet,
}) => {
    
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layoutEngineRef = useRef<CanvasLayoutEngine | null>(null);

  useEffect(() => {
    if (layoutEngineRef.current) {
      layoutEngineRef.current.setSheet(sheet); // ✅ 更新資料來源
    } else {
      layoutEngineRef.current = new CanvasLayoutEngine(sheet);
    }

    setRerender({}); // ✅ 通知畫面重新渲染
  }, [sheet]); // <- 只有監聽 sheet 就夠
  
  const [, setRerender] = useState({}); // 用於觸發 CanvasTable 重新渲染


  const handleCellDataChanged = (row: number, column: number, newCell: Cell) => {
    setSheet(
      (prevSheet) => updateSheetCellMatrix(prevSheet, [[row, column, newCell]])
    );
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const layoutEngine = layoutEngineRef.current;

    if (container && layoutEngine) {
      const scrollTop = container.scrollTop;
      const scrollLeft = container.scrollLeft;
      const canvasWidth = container.offsetWidth;
      const canvasHeight = container.offsetHeight;

      layoutEngine.updateViewport(
        scrollLeft,
        scrollTop,
        canvasWidth,
        canvasHeight,
      )
    }

    setRerender({})
  };


  return (
    <div 
      style={{
        display: "flex", flexDirection: "column", 
        padding: "0px", height: "100%", 
        overflow: "auto", position: "relative",
        border: "2px solid #ddd", borderRadius: "8px",
        boxSizing: "border-box"
      }}
    >
      
      {layoutEngineRef.current &&
        <CanvasTable
          layoutEngine={layoutEngineRef.current}
          containerRef={containerRef}
          canvasRef={canvasRef}
          onCellClick={(r, w) => {return;}}
          handleScroll={handleScroll}
        />
      }

    </div>
  )
}


export default SheetView01;