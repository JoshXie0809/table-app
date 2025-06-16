// import React, { RefObject, useEffect } from "react"
// import { CellPosition } from "./SheetView";
// import { Text, Divider, Input, Button, makeStyles} from "@fluentui/react-components";
// import { getCellBoundaryCheck, Sheet} from "../sheet/sheet-old";
// import { Cell, createDefaultCell } from "../cell/cellPluginSystem";
// import { FaCheck } from "react-icons/fa6";
// import { RxCross1 } from "react-icons/rx";
// import { dirtyDrawCanvasCell } from "./canvasTable/dirtyDrawCanvasCell";
// import { useDirtyBuffer } from "./useDirtyBuffer";


// const useStyles = makeStyles({
//   quickEditButton : {
//     borderRadius: "8px",
//     backgroundColor: "transparent",
//     padding: "0",
//     border: "0px solid",
//     ":hover": {
//       background: "#ddd",
//       transition: "ease 0.2s" 
//     }
//   }
// })

// export interface EditingRangeProps {
//   sheet: Sheet;
//   activeCell: CellPosition | null;
//   setActiveCell: React.Dispatch<CellPosition | null>;
//   canvasRef: RefObject<HTMLCanvasElement>;
//   dirty: ReturnType<typeof useDirtyBuffer>;
//   updateCells: [number, number, Cell][];
//   setUpdateCells: React.Dispatch<[number, number, Cell][]>;
// }

// const EditingRange: React.FC<EditingRangeProps> = ({
//   sheet,
//   activeCell,
//   setActiveCell,
//   canvasRef,
//   dirty,
//   updateCells,
//   setUpdateCells,
// }) => {

//   const styles = useStyles();
//   const [editingValue, setEditingValue] = React.useState<string>("");

  
//   const handleConfirm = () => {
//     const r = activeCell!.sheetRC.row;
//     const c = activeCell!.sheetRC.col;

//     const dirtyCell = dirty.get(r, c);
//     if (!dirtyCell) return;

//     // ✅ 重畫 cell
//     const canvas = canvasRef.current!;
//     const ctx = canvas.getContext("2d")!;

//     dirtyDrawCanvasCell({
//       ctx,
//       cell: dirtyCell,
//       cellLeft: activeCell!.canvasCoord.x,
//       cellTop: activeCell!.canvasCoord.y,
//       cellHeight: sheet.sheetCellHeight,
//       cellWidth: sheet.sheetCellWidth,
//       row: r
//     });

//     setUpdateCells([...updateCells, [r, c, structuredClone(dirtyCell)]])

//     // ✅ UI 狀態清除
//     setActiveCell(null);
//     setEditingValue("");
//   };


//   const handleCancel = () => {
//     const r = activeCell!.sheetRC.row;
//     const c = activeCell!.sheetRC.col;
//     dirty.deleteCell(r, c);
    
//     setActiveCell(null);
//     setEditingValue("");

//     console.log(dirty.dirtyMapRef.current)
//   }
  
//   useEffect(() => {
//     if (!activeCell) return;
    
//     const { row: r, col: c } = activeCell.sheetRC;
//     const cell = getCellBoundaryCheck(sheet, r, c);
//     if (!cell) return;
    
//     if (!dirty.has(r, c)) {
//       dirty.markDirty(r, c, structuredClone(cell));
//     }

//     const dirtyCell = dirty.get(r, c);
//     if (dirtyCell) {
//       setEditingValue(dirtyCell.payload.value ?? "");
//     }

//   }, [activeCell])

//   return(
//     <>
//     {
//       activeCell !== null 
//       &&
//       <div 
//       hidden={
//         activeCell.canvasCoord.x < sheet.sheetCellWidth
//         || activeCell.canvasCoord.x > activeCell.containerRect.w - sheet.sheetCellWidth
//         || activeCell.canvasCoord.y < sheet.sheetCellHeight
//         || activeCell.canvasCoord.y > activeCell.containerRect.h - sheet.sheetCellHeight
//       }
//       style={{ 
//         position: "absolute",
//         top: activeCell.canvasCoord.y - 0, // -border
//         left: activeCell.canvasCoord.x - 0, // -border
//         boxSizing: "border-box",
//         backgroundColor: activeCell.sheetRC.row % 2 === 0 ? "#fff" : "#f9f9f9",
//         border: '0px solid rgb(92, 163, 92)',
//       }}>
//         <Input
//           appearance="underline"
//           style={{ 
//             width: sheet.sheetCellWidth,
//             height: sheet.sheetCellHeight,
//           }}
//           value={editingValue}
//           onChange={(e) => {
//             setEditingValue(e.target.value); // ✅ UI 會即時更新
//             const r = activeCell!.sheetRC.row;
//             const c = activeCell!.sheetRC.col;

//             // 取得目前該 cell 的型別
//             const type = getCellBoundaryCheck(sheet, r, c)?.type;
//             if (!type) return;

//             // 建立一個新的 cell，寫入使用者輸入的值
//             const newCell = createDefaultCell(type);
//             newCell.payload.value = e.target.value;

//             // 寫入 dirty buffer
//             dirty.markDirty(r, c, newCell);
//           }}

//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               handleConfirm();
//             } else if (e.key === "Escape") {
//               handleCancel();
//             }
//           }}
//         />
//         <div 
//           style={{
//             position: "absolute",
//             top: "-16px",
//             left: - 12,
//           }}
//         >
//           <Button
//             className={styles.quickEditButton} 
//             icon={<FaCheck size={10}/>}
//             onClick={handleConfirm}
//           > 
//           </Button>
//           <Button 
//             className={styles.quickEditButton}
//             icon={<RxCross1 size={10}/>}
//             onClick={handleCancel}
//           > 
//           </Button>

//         </div>
        
//       </div>
//     }
    
//     <Divider appearance="strong"/>

//     <div style={{ 
//       display: "flex", justifyContent: "end", 
//       padding: "2px 4px"
//     }}>
//       <Text>
//         {activeCell !== null 
//           ? `RC[${activeCell?.sheetRC.row}, ${activeCell?.sheetRC.col}]`
//           : `RC[ , ]`
//         }
//       </Text> 
//     </div>
//     </>
      
//   )
// }


// export default EditingRange;