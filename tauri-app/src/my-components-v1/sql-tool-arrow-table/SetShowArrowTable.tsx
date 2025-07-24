import { useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { Root, createRoot }  from "react-dom/client"
import { sqlQuery, sqlShowAllTable, sqlTableInfo } from "../../tauri-api/sqlConnection";
import { ShowArrowTable } from "./ShowArrowTable";
import { tableFromIPC } from "apache-arrow"
import { Toast, ToastBody, Toaster, ToastTitle, useId, useToastController } from "@fluentui/react-components";

export type ShowType =
  | "TableInfo"
  | "ShowAllTable"
  | "Query";

export const showDBTable$ = new Subject<{dbPath: string, tableName: string, sql?: string, type: ShowType}>();
export const SetShowArrowTable: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<null | Root>(null);
  const toasterId = useId('sql-tool-page-arrow-table');
  const { dispatchToast } = useToastController(toasterId);
  const notify = (err: unknown) =>
    dispatchToast(
      <Toast style={{width: "600px"}}>
        <ToastTitle>error</ToastTitle>
        <ToastBody>
          {err}
        </ToastBody>
      </Toast>,
      { intent: "error", position: "bottom-start" }
    );

  useEffect(() => {
    const sub = showDBTable$.subscribe(async ({
      dbPath, tableName, sql, type,
    }) => {
      let bufferArray;
      try {
        if(type === "TableInfo")
        bufferArray = await sqlTableInfo({path: dbPath, tableName});
        else if(type === "ShowAllTable")
          bufferArray = await sqlShowAllTable({path: dbPath, tableName});
        else if(type === "Query" && sql !== undefined) 
          bufferArray = await sqlQuery({sql});
        if(bufferArray === undefined) return;
      } catch (err) {
        console.error(err)
        notify(err)
      }
      
      const table = tableFromIPC(bufferArray);
      const divEl = divRef.current;
      if(divEl === null) return;
      if(rootRef.current === null) {rootRef.current = createRoot(divEl)}
      const root = rootRef.current;
      root.render(
        <ShowArrowTable table={table}/>
      )
    })

    return () => {
      sub.unsubscribe()
      queueMicrotask(() => {
        rootRef.current?.unmount();
        rootRef.current = null;
      })
    };
  }, [])

  return(
    <div 
      id="sql-tool-show-arrow-table" 
      ref={divRef} 
      style={{ height: "100%", width: "100%", userSelect: "none"}} // 加這行
    >
      <Toaster toasterId={toasterId} timeout={2000} />
    </div>
  )
}