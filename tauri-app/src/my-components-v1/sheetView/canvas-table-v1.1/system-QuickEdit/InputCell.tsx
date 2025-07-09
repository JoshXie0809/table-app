import { Input, tokens } from "@fluentui/react-components";
import { RefObject, useEffect, useState } from "react";
import { VirtualCells } from "../../../VirtualCells";


export interface QuickEditInputCellProps {
  vcRef: RefObject<VirtualCells>
}

export const QuickEditInputCell: React.FC<QuickEditInputCellProps> = ({
  vcRef
}) => {
  const vc = vcRef.current;
  const [quickEditInputCellValue, setQuickEditInputCellValue] = useState("");
  
  useEffect(() => {

  }, [vc]);

  if(!vc) return null;

  return(
    <Input 
        placeholder="輸入"
        value={quickEditInputCellValue}
        onChange={(e) => setQuickEditInputCellValue(e.target.value)}
        style={{
          height: `${Math.round(vc.cellHeight)}px`, 
          width: `${Math.round(vc.cellWidth)}px`,
          borderRadius: "0px",
          border: "1px solid rgb(96, 151, 96)",
          boxShadow: tokens.shadow2,
          boxSizing: "border-box",
        }} 
      />
  )
}