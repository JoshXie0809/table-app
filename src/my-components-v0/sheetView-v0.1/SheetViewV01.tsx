import React, { useEffect, useRef, useState } from "react"

import { CanvasTable } from "./canvas-table/CanVasTable";
import { CanvasLayoutEngine } from "./canvas-table/cavas-layout-engine/CanvasLayoutEngine";
import { SystemHover } from "./canvas-table/system-hover/SystemHover";
import { SystemQuickEdit } from "./canvas-table/system-quickEdit/SystemQuickEdit";
import { Sheet } from "../sheet/SheetPluginSystem";

export interface SheetViewProps {
  sheet: Sheet,
  setSheet: React.Dispatch<React.SetStateAction<Sheet>>
}

const SheetView01: React.FC<SheetViewProps> = ({
  sheet
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
        >
          <SystemHover />
          <SystemQuickEdit />
        
        </CanvasTable>
      }

    </div>
  )
}


export default SheetView01;