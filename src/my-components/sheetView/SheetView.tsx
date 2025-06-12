import React, { useState } from "react"
import CanvasTable from "./canvasTable/CanvasTable";
import { Sheet } from "../sheet/sheet";
import EditingRange  from "./ActiveCell" 
export interface SheetViewProps {
  sheet: Sheet,
  setSheet: React.Dispatch<Sheet>
}

export interface CellPosition {
  realCoord: {x: number, y: number},
  canvasCoord: {x: number, y: number},
  sheetRC: {row: number, col: number},
  containerRect: {h: number, w: number}
}

const SheetView: React.FC<SheetViewProps> = ({
  sheet,
  setSheet,
}) => {

  const [activeCell, setActiveCell] = useState<CellPosition | null>(null);
  const onCellClick = (rc: CellPosition) => {
    setActiveCell(rc);
  }

  const onScroll = (x:number, y: number) => {
    if (activeCell === null) return;
    const newRC: CellPosition = structuredClone(activeCell);
    newRC.realCoord = {x, y};
    newRC.canvasCoord.x = sheet.sheetCellWidth * (newRC.sheetRC.col + 1) - x,
    newRC.canvasCoord.y = sheet.sheetCellHeight * (newRC.sheetRC.row + 1) - y,
    setActiveCell(newRC);
  }

  const onResize = () => {
    setActiveCell(null);
  }

  return (
    <div 
      style={{ display: "flex", flexDirection: "column", 
        padding: "0px", height: "100%", 
        overflow: "auto", position: "relative",
        border: "2px solid #ddd", borderRadius: "8px"}}>
      
      <CanvasTable 
        sheet={sheet} 
        onCellClick={onCellClick}
        onScroll={onScroll}
        onResize={onResize}
      />

      <EditingRange 
        activeCell={activeCell} 
        setActiveCell={setActiveCell}
        sheet={sheet} 
        setSheet={setSheet}/>

    </div>
  )
}


export default SheetView;