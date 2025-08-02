import { RefObject, useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { getCellContentValue, setCellContentValue, validateCellContent, VirtualCells } from "../VirtualCells";
import { RManager } from "../sheetView/canvas-table-v1.1/RenderManager";
import { VManager } from "../sheetView/canvas-table-v1.1/VirtualizationMangaer";
import { Toast, ToastBody, Toaster, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { rc$ } from "../sheetView/canvas-table-v1.1/system-QuickEdit/useInputCellStateManager";
import { CellContent } from "../../tauri-api/types/CellContent";

export type EditSheet =
  | {editType: "EditCellValue", newCellValue: string, row: number, col: number}
  | {editType: "EditCellType", newCellType: string, row: number, col: number}
  ;

export interface HistroyLog {
  editType: string;
  row: number,
  col: number,
  from: CellContent | undefined,
  to: CellContent | undefined,
}

export const sheetEditEmit$ = new Subject<EditSheet>();
export const SheetEditHistory = (
  {vcRef, rmRef, vmRef} : {
    vcRef: RefObject<VirtualCells>
    rmRef: RefObject<RManager>
    vmRef: RefObject<VManager>
  }
) => {
  const toasterId = useId("sheet-view-edit-sheet-system");
  const editHistoryRef = useRef<HistroyLog[]>([]);
  const editCellsRef = useRef<Map<string, CellContent | undefined>>(new Map());

  const { dispatchToast } = useToastController(toasterId);
  const notifyEditCellType = (val: any, type: string) => {
    dispatchToast(
      <Toast>
        <ToastTitle>Setting Cell Type Error</ToastTitle>
        <ToastBody>{`can not change to type="${type}" with value="${String(val)}"`}</ToastBody>
      </Toast>,
      {intent: "error"}
    )
  };

  const notifyEditCellValue = (val: any, type: string) => {
    dispatchToast(
      <Toast>
        <ToastTitle>Setting Cell Type Error</ToastTitle>
        <ToastBody>{`can not set value="${String(val)}" with type="${type}"`}</ToastBody>
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
      
      const {row, col} = payload;
      const oldCellContent = vc.getCell(row, col)
      let newCellContent;
      if(oldCellContent === undefined)
        newCellContent = structuredClone(vc.getDefaultCell());
      else 
        newCellContent = structuredClone(oldCellContent);
      if(newCellContent === undefined) return;

      if(payload.editType === "EditCellValue") {
        const validateResult = setCellContentValue(newCellContent, payload.newCellValue, vc);
        if(validateResult.success === false) {
          notifyEditCellValue(payload.newCellValue, validateResult.error?.type ?? "unkown");
          return;
        }
      }
      else
      if(payload.editType === "EditCellType") {  
        newCellContent.type = payload.newCellType;
        setCellContentValue(newCellContent, String(newCellContent.payload.value), vc);
        const validateResult = validateCellContent(newCellContent, vc)
        if(validateResult.success === false) {
          const val = getCellContentValue(newCellContent);
          notifyEditCellType(val, payload.newCellType);
          return;
        }
      }

      const vmCell = vm.getCellByRowCol(row, col)
      if(vmCell === undefined) return;
      vc.setCell({row, col, cellData: newCellContent});
      rm.markDirty(vmCell);
      rm.flush();
      rc$.next({row, col});
      const editHistory = editHistoryRef.current;
      editHistory.push({
        editType: payload.editType,
        row: payload.row,
        col: payload.col,
        from: oldCellContent,
        to: newCellContent
      })
      editCellsRef.current.set(vc.toKey(row, col), newCellContent);
      console.log(editHistoryRef.current);
      console.log(editCellsRef.current);
    })

    return () => sub.unsubscribe();
  }, []);

  return(
    <Toaster toasterId={toasterId} position="bottom-start"/>
  )
}