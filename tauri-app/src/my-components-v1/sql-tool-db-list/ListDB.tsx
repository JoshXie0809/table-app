import { useCallback, useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { sqlAttachDB, sqlListDatabase, sqlListTable } from "../../tauri-api/sqlConnection";
import { Root, createRoot }  from "react-dom/client"
import { Toast, ToastBody, Toaster, ToastTitle, Tooltip, Tree, TreeItem, TreeItemLayout, useId, useToastController } from "@fluentui/react-components";
import { ListTable } from "./ListTable";
import { SiDuckdb } from "react-icons/si";

export interface DBInfo {
  file?: string,
  tableList: string[],
}
export const latestLoadDB$ = new Subject<{dbPath: string | null, alias: string}>();
export const updateDBList$ = new Subject<void>();
export const ListDB: React.FC = () => {
  const dbMapRef = useRef<null | Map<string, DBInfo>>(null);
  const divRef = useRef<null | HTMLDivElement>(null);
  const rootRef = useRef<null | Root>(null);
  const toasterId = useId('sql-tool-page-list-db');
  const { dispatchToast } = useToastController(toasterId);
  const notifyLoadDBError = useCallback((err: string) => {
    dispatchToast(
      <Toast>
        <ToastTitle>error</ToastTitle>
        <ToastBody>
          {err}
        </ToastBody>
      </Toast>,
      { intent: "error", position: "bottom-start" }
    );
  }, [dispatchToast]);

  // 處理
  useEffect(() => {
    dbMapRef.current = new Map();
    const sub = latestLoadDB$.subscribe(async ({dbPath, alias}) => {
      if(dbPath === null) {
        notifyLoadDBError("need to set database path");
        return;
      }
      else if(alias === "") {
        notifyLoadDBError("need to set db alias name");
        return;
      };

      await sqlAttachDB({path: dbPath, alias})
      updateDBList$.next();
    });
    return () => sub.unsubscribe()
  }, [])


  useEffect(() => {
    const sub = updateDBList$.subscribe(async () => {
      const dbMap = dbMapRef.current;
      if(dbMap === null) return;
      dbMap.clear();
      const dbList = await sqlListDatabase();
      if(dbList.success === false) return;
      if(dbList.data === undefined) return;
      const dbInfoList = dbList.data;
      for (const dbInfo of dbInfoList) {
        const alias = dbInfo[0];
        const file = dbInfo[1];
        const result = await sqlListTable({alias});
        if(!result.success || !result.data) return;
        dbMap.set(alias, {file, tableList: result.data});
      }
      const divEl = divRef.current;
      if(divEl === null) return;
      if(rootRef.current === null) {rootRef.current = createRoot(divEl);}
      const root = rootRef.current;
      const keys = Array.from(dbMap.keys());
      root.render(
        <Tree aria-label="database connections list">
          {
            keys.map((k) => (
                <TreeItem key={k} itemType="branch">
                  <TreeItemLayout iconBefore={<SiDuckdb />}>
                    <Tooltip 
                      content={dbMap.get(k)?.file ?? ":memory:"} 
                      relationship="description" 
                      mountNode={document.getElementById("sql-tool-page-portal-root")}>
                      <div>
                        {k}
                      </div>
                    </Tooltip>
                  </TreeItemLayout>
                  <ListTable alias={k} dbInfo={dbMap.get(k)} />
                </TreeItem>
            ))
          }
        </Tree>
      )
    })
      
    return () => {
      if (dbMapRef.current !== null) {
        dbMapRef.current.clear();
        dbMapRef.current = null;
      }
      queueMicrotask(() => {
        rootRef.current?.unmount();
        rootRef.current = null;
      })
      sub.unsubscribe();
    }
  }, [])

  return (
    <div 
      id="sql-tool-db-connection-tree-list" 
      ref={divRef}
      style={{width: "100%", height: "100%", userSelect: "none"}}
    >
      <Toaster toasterId={toasterId}></Toaster>
    </div>
  )
}