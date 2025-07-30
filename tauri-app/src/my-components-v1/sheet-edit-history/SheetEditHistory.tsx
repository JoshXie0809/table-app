import { RefObject, useEffect } from "react";
import { Subject } from "rxjs";
import { setCellContentValue, validateCellContent, VirtualCells } from "../VirtualCells";
import { RManager } from "../sheetView/canvas-table-v1.1/RenderManager";
import { VManager } from "../sheetView/canvas-table-v1.1/VirtualizationMangaer";

export type EditSheet =
  | {editType: "EditCellValue"}
  | {editType: "EditCellCSS"}
  | {editType: "EditCellOtherPayload"}
  | {editType: "EditCellType", newCellType: string, row: number, col: number}
  ;

export const sheetEditEmit$ = new Subject<EditSheet>();
export const SheetEditHistory = (
  {vcRef, rmRef, vmRef} : {
    vcRef: RefObject<VirtualCells>
    rmRef: RefObject<RManager>
    vmRef: RefObject<VManager>
  }
) => {
  useEffect(() => {
    const sub = sheetEditEmit$.subscribe((payload) => {
      const vc = vcRef.current;
      if(vc === null) return;
      const rm = rmRef.current;
      if(rm === null) return;
      const vm = vmRef.current;
      if(vm === null) return;

      if(payload.editType === "EditCellType") {
        const {row, col} = payload;
        const oldCellContent = vc.getCell(row, col)
        let newCellContent;
        if(oldCellContent === undefined)
          newCellContent = vc.getDefaultCell();
        else 
          newCellContent = structuredClone(oldCellContent);
        if(newCellContent === undefined) return;
        newCellContent.type = payload.newCellType;
        setCellContentValue(newCellContent, String(newCellContent.payload.value), vc);
        const validateResult = validateCellContent(newCellContent, vc)
        console.log(newCellContent)
        if(validateResult.success === false) return;        
        const vmCell = vm.getCellByRowCol(row, col)
        if(vmCell === undefined) return;
        vc.setCell({row, col, cellData: newCellContent});
        rm.markDirty(vmCell);
        rm.flush();
      }
      
    })

    return () => sub.unsubscribe();
  }, []);

  return(
    null
  )
}