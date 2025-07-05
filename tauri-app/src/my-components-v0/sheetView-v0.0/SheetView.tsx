// import React, { useRef, useState } from "react"
// import CanvasTable from "./canvasTable/CanvasTable";
// import { Sheet, updateSheetCellMatrix } from "../sheet/sheet-old";
// import EditingRange  from "./ActiveCell" 
// import { Cell } from "../cell/cellPluginSystem";
// import { useDirtyBuffer } from "./useDirtyBuffer";
// export interface SheetViewProps {
//   sheet: Sheet,
//   setSheet: React.Dispatch<Sheet>
// }

// export interface CellPosition {
//   realCoord: {x: number, y: number},
//   canvasCoord: {x: number, y: number},
//   sheetRC: {row: number, col: number},
//   containerRect: {h: number, w: number}
// }


// const SheetView: React.FC<SheetViewProps> = ({
//   sheet,
//   setSheet,
// }) => {

//   const [activeCell, setActiveCell] = useState<CellPosition | null>(null);
//   const [updateCells, setUpdateCells] = useState<[number, number, Cell][]>([]);
//   const dirty = useDirtyBuffer();
//   const canvasRef = useRef<HTMLCanvasElement>(null);


//   const onCellClick = (rc: CellPosition) => {
//     setActiveCell(rc);
//   }

//   const onScroll = (x:number, y: number) => {

//     const newSheet = updateSheetCellMatrix(sheet, updateCells);
//     setSheet(newSheet);
//     dirty.clearDirty();
    

//     if (activeCell === null) return;
//     const newRC: CellPosition = structuredClone(activeCell);
//     newRC.realCoord = {x, y};
//     newRC.canvasCoord.x = sheet.sheetCellWidth * (newRC.sheetRC.col + 1) - x,
//     newRC.canvasCoord.y = sheet.sheetCellHeight * (newRC.sheetRC.row + 1) - y,
//     setActiveCell(newRC);

//   }

//   const onResize = () => {
//     // setActiveCell(null);
//   }

//   return (
//     <div 
//       style={{
//         display: "flex", flexDirection: "column", 
//         padding: "0px", height: "100%", 
//         overflow: "auto", position: "relative",
//         border: "2px solid #ddd", borderRadius: "8px",
//         boxSizing: "border-box"
//       }}>
      
//       <CanvasTable 
//         sheet={sheet} 
//         onCellClick={onCellClick}
//         onScroll={onScroll}
//         onResize={onResize}
//         canvasRef={canvasRef}
//         // dirtyCells={dirtyCells}
//       />

//       <EditingRange 
//         activeCell={activeCell} 
//         setActiveCell={setActiveCell}
//         sheet={sheet} 
//         dirty = {dirty}
//         canvasRef={canvasRef}
//         updateCells={updateCells}
//         setUpdateCells={setUpdateCells}
//       />

//     </div>
//   )
// }


// export default SheetView;