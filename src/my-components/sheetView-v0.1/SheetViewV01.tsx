import React, { useEffect, useRef, useState } from "react"
import { Sheet, updateSheetCellMatrix } from "../sheet/sheet";
import { SheetVirtualTableImpl } from "./sheet-virtual-table/SheetVirtualTable";
import { Cell } from "../cell/cellPluginSystem";
import { CanvasTable } from "./canvas-table/CanVasTable";

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
  
  const virtualTableRef = useRef<SheetVirtualTableImpl | null>(null);

  const [, setRerender] = useState({}); // 用於觸發 CanvasTable 重新渲染


  const handleCellDataChanged = (row: number, column: number, newCell: Cell) => {
    setSheet(
      (prevSheet) => updateSheetCellMatrix(prevSheet, [[row, column, newCell]])
    );
  };

  useEffect(() => {
    virtualTableRef.current = new SheetVirtualTableImpl(
      sheet,
      containerRef,
    );
  }, [sheet, containerRef, handleCellDataChanged]);



  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    if (container && virtualTableRef.current) {
      const scrollTop = container.scrollTop;
      const scrollLeft = container.scrollLeft;
      const canvasWidth = container.offsetWidth;
      const canvasHeight = container.offsetHeight;

      virtualTableRef.current.updateVisibleRange(scrollLeft, scrollTop, canvasWidth, canvasHeight);
      setRerender({}); // 觸發 CanvasTable 重新渲染
    }
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
        {virtualTableRef.current && (
            <CanvasTable
              virtualTable={virtualTableRef.current}
              containerRef={containerRef}
              canvasRef={canvasRef}
              onCellClick={(r, w) => {return;}}
              handleScroll={handleScroll}
          />
        )}
    
    </div>
  )
}


export default SheetView01;