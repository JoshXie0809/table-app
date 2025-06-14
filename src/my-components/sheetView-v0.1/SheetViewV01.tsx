import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Sheet, updateSheetCellMatrix } from "../sheet/sheet";

import { Cell } from "../cell/cellPluginSystem";
import { CanvasTable } from "./canvas-table/CanVasTable";
import { CanvasLayoutEngine } from "./canvas-table/cavas-layout-engine/CanvasLayoutEngine";
import { SystemHover } from "./canvas-table/system-hover/SystemHover";

export interface SheetViewProps {
  sheet: Sheet,
  setSheet: React.Dispatch<React.SetStateAction<Sheet>>
}

const SheetView01: React.FC<SheetViewProps> = ({
  sheet,
  setSheet,
}) => {

  const layoutEngineRef = useRef<CanvasLayoutEngine | null>(null);
  const [, rerender] = useState({});

  useEffect(() => {
    if (layoutEngineRef.current) {
      layoutEngineRef.current.setSheet(sheet); // ✅ 更新資料來源
    } else {
      layoutEngineRef.current = new CanvasLayoutEngine(sheet);
      rerender({})
    }

  }, [sheet]); // <- 只有監聽 sheet 就夠
  

  const handleCellDataChanged = (row: number, column: number, newCell: Cell) => {
    setSheet(
      (prevSheet) => updateSheetCellMatrix(prevSheet, [[row, column, newCell]])
    );
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {};


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
          onCellClick={(r, w) => {return;}}
          handleScroll={handleScroll}
        >
          <SystemHover />
        
        </CanvasTable>
      }

    </div>
  )
}


export default SheetView01;