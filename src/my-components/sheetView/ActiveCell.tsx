import React, { useEffect, useState } from "react"
import { CellPosition } from "./SheetView";
import { Text, Divider, Input, Button, makeStyles} from "@fluentui/react-components";
import { Sheet, updateSheetCellMatrix } from "../sheet/sheet";
import { Cell, createDefaultCell } from "../cell/cellPluginSystem";
import { FaCheck } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";


const useStyles = makeStyles({
  quickEditButton : {
    borderRadius: "8px",
    backgroundColor: "transparent",
    padding: "0",
    border: "0px solid",
    ":hover": {
      background: "#ddd",
      transition: "ease 0.2s" 
    }
  }
})

export interface EditingRangeProps {
  sheet: Sheet,
  setSheet: React.Dispatch<Sheet>  
  activeCell: CellPosition | null
  setActiveCell: React.Dispatch<CellPosition | null>
}

const EditingRange: React.FC<EditingRangeProps> = ({
  sheet,
  setSheet,
  activeCell,
  setActiveCell,
}) => {

  const styles = useStyles();
  const [editingCell, setEditingCell] = useState<Cell | null>(null);

  const handleConfirm = () => {
    const r = activeCell!.sheetRC.row;
    const c = activeCell!.sheetRC.col;
    const sheet2 = updateSheetCellMatrix(sheet, [[r, c, editingCell!]])
    setSheet(sheet2);
    setEditingCell(null);
    setActiveCell(null);
  }

  const handleCancel = () => {
    setEditingCell(null);
    setActiveCell(null);
  }
  
  useEffect(() => {
    if(!activeCell) {
      setEditingCell(null)
      return;
    }
    const r = activeCell.sheetRC.row;
    const c = activeCell.sheetRC.col;
    if ((r < 0) || (c < 0))  return;
    setEditingCell(structuredClone(sheet.cellMatrix[r][c]));

  }, [activeCell, sheet])

  return(
    <>
    {
      activeCell !== null && editingCell !== null 
      && (activeCell.sheetRC.row >= 0) && (activeCell.sheetRC.col >= 0) &&
      <div 
      hidden={
        activeCell.canvasCoord.x < sheet.sheetCellWidth
        || activeCell.canvasCoord.x > activeCell.containerRect.w - sheet.sheetCellWidth / 2
        || activeCell.canvasCoord.y < sheet.sheetCellHeight
        || activeCell.canvasCoord.y > activeCell.containerRect.h - sheet.sheetCellHeight / 2
      }
      style={{ 
        position: "absolute",
        top: activeCell.canvasCoord.y - 0, // -border
        left: activeCell.canvasCoord.x - 0, // -border
        boxSizing: "border-box",
        backgroundColor: activeCell.sheetRC.row % 2 === 0 ? "#fff" : "#f9f9f9",
        border: '0px solid rgb(92, 163, 92)',
      }}>
        <Input
          appearance="underline"
          value = {editingCell!.payload.value}
          style={{ 
            width: sheet.sheetCellWidth,
            height: sheet.sheetCellHeight,
          }}
          onChange={(e) => {
            let nc = createDefaultCell(editingCell.type);
            nc.payload.value = e.target.value;
            setEditingCell(nc)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleConfirm();
            } else if (e.key === "Escape") {
              handleCancel();
            }
          }}
        />
        <div 
          style={{
            position: "absolute",
            top: "-16px",
            left: - 12,
          }}
        >
          <Button
            className={styles.quickEditButton} 
            icon={<FaCheck size={10}/>}
            onClick={handleCancel}
          > 
          </Button>
          <Button 
            className={styles.quickEditButton}
            icon={<RxCross1 size={10}/>}
            onClick={handleCancel}
          > 
          </Button>

        </div>
        
      </div>
    }
    
    <Divider appearance="strong"/>

    <div style={{ 
      display: "flex", justifyContent: "end", 
      padding: "2px 4px"
    }}>
      <Text>
        {activeCell !== null 
          ? `RC[${activeCell?.sheetRC.row}, ${activeCell?.sheetRC.col}]`
          : `RC[ , ]`
        }
      </Text> 
    </div>
    </>
      
  )
}


export default EditingRange;