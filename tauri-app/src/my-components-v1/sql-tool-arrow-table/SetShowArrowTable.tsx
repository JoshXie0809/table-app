import { useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { Root, createRoot }  from "react-dom/client"
import { sqlShowAllTable, sqlTableInfo } from "../../tauri-api/sqlConnection";
import { ShowArrowTable } from "./ShowArrowTable";
import { tableFromIPC } from "apache-arrow"

export type ShowType =
  | "TableInfo"
  | "ShowAllTable";

export const showDBTable$ = new Subject<{dbPath: string, tableName: string, type: ShowType}>();
export const SetShowArrowTable: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<null | Root>(null);
  
  useEffect(() => {
    const sub = showDBTable$.subscribe(async ({
      dbPath, tableName, type,
    }) => {
      let bufferArray;
      if(type === "TableInfo")
        bufferArray  = await sqlTableInfo({path: dbPath, tableName});
      else if(type === "ShowAllTable")
        bufferArray  = await sqlShowAllTable({path: dbPath, tableName});
      if(bufferArray === undefined) return;
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
    />
  )
}