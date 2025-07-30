import { RefObject, useEffect } from "react";
import { Subject } from "rxjs";
import { setCellContentValue, validateCellContent, VirtualCells } from "../VirtualCells";
import { RManager } from "../sheetView/canvas-table-v1.1/RenderManager";
import { VManager } from "../sheetView/canvas-table-v1.1/VirtualizationMangaer";
import { Toast, ToastBody, Toaster, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { rc$ } from "../sheetView/canvas-table-v1.1/system-QuickEdit/useInputCellStateManager";

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
  const toasterId = useId("sheet-view-edit-sheet-system");
  const { dispatchToast } = useToastController(toasterId);
  const notify = (err: any) => {
    dispatchToast(
      <Toast>
        <ToastTitle>Change Cell Type Error</ToastTitle>
        <ToastBody>{JSON.stringify(err)}</ToastBody>
      </Toast>,
      {intent: "error"}
    )
  };

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
        if(validateResult.success === false) {
          notify(validateResult.error);
          return;
        }
        const vmCell = vm.getCellByRowCol(row, col)
        if(vmCell === undefined) return;
        vc.setCell({row, col, cellData: newCellContent});
        rm.markDirty(vmCell);
        rm.flush();
        rc$.next({row, col});
      }
      
    })

    return () => sub.unsubscribe();
  }, []);

  return(
    <Toaster toasterId={toasterId} position="bottom-start"/>
  )
}