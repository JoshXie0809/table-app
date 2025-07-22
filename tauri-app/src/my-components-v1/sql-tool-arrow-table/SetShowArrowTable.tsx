import { useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { Root, createRoot }  from "react-dom/client"
import { sqlTableInfo } from "../../tauri-api/sqlConnection";
import { ShowArrowTable } from "./ShowArrowTable";
import { tableFromIPC } from "apache-arrow"
export const showDBTable$ = new Subject<{dbPath: string, tableName: string}>();
export const SetShowArrowTable: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<null | Root>(null);
  
  useEffect(() => {
    const sub = showDBTable$.subscribe(async ({
      dbPath, tableName,
    }) => {
      const bufferArray = await sqlTableInfo({path: dbPath, tableName});
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
    <div id="sql-tool-show-arrow-table" ref={divRef}/>
  )
}