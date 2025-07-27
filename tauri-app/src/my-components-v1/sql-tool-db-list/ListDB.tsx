import { useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { sqlAttachDB, sqlListTable } from "../../tauri-api/sqlConnection";
import { Root, createRoot }  from "react-dom/client"
import { Tooltip, Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import { ListTable } from "./ListTable";
import { SiDuckdb } from "react-icons/si";

export const latestLoadDB$ = new Subject<{dbPath: string, alias: string}>();
export const ListDB: React.FC = () => {
  const dbMapRef = useRef<null | Map<string, string[]>>(null);
  const divRef = useRef<null | HTMLDivElement>(null);
  const rootRef = useRef<null | Root>(null);
  useEffect(() => {
    dbMapRef.current = new Map();
    const sub = latestLoadDB$.subscribe(async ({dbPath}) => {
      const dbMap = dbMapRef.current;
      if(dbMap === null) return;
      await sqlAttachDB({path: dbPath})
      const result = await sqlListTable({path: dbPath});
      console.log(result);
      if(!result.success || !result.data) return;
      dbMap.set(dbPath, result.data);
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
                      content={k} 
                      relationship="description" 
                      mountNode={document.getElementById("sql-tool-page-portal-root")}>
                      <div>
                        table
                      </div>
                    </Tooltip>
                  </TreeItemLayout>
                  <ListTable dbPath={k} tableList={dbMap.get(k)} />
                </TreeItem>
            ))
          }
        </Tree>
      )
    });
    return () => {
      if (dbMapRef.current !== null) {
        dbMapRef.current.clear();
        dbMapRef.current = null;
      }
      queueMicrotask(() => {
        rootRef.current?.unmount();
        rootRef.current = null;
      })
      sub.unsubscribe()
    }
  }, [])

  return (
    <div 
      id="sql-tool-db-connection-tree-list" 
      ref={divRef}
      style={{width: "100%", height: "100%", userSelect: "none"}}
    />
  )
}