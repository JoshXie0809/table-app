import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { useStyles } from "../../App";
import { ButtonToolBox } from "../../my-components-v1/button-toolbox/ButtonToolBox";
import { RibbonGroup, RibbonSmallButton } from "../../my-components-v1/button-toolbox/RibbonGroup";
import { BsDatabaseAdd } from "react-icons/bs";
import LuaRunner from "../../my-components-v1/lua/LuaRunner";
import "./SQLApp.css"
import { useEffect, useState } from "react";
import { sqlConnect, sqlListTable, sqlTableInfo } from "../../tauri-api/sqlConnection";
import { Table, tableFromIPC } from "apache-arrow"

function tableToObjects(table: Table): Record<string, any>[] {
  const fields = table.schema.fields.map(f => f.name);
  return table.toArray().map(row => {
    const obj: Record<string, any> = {};
    for (const name of fields) {
      obj[name] = row[name];  // 動態取得欄位值
    }
    return obj;
  });
}

export const SQLApp = () => {
  const styles = useStyles();
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => {
    const fetch = async () => {
      const path = "C:/Users/USER/Desktop/dotnet_test/React-test/my-workspace/data.duckdb";
      const result = await sqlConnect({ path });
      if (!result.success) return;
      const tables = await sqlListTable({ path });
      console.log(tables);
      const tableInfo = await sqlTableInfo({ path });
      console.log(tableInfo);
      const table = tableFromIPC(tableInfo);
      const rows = tableToObjects(table);
      setRows(rows);
    }
    fetch();
  }, [])

  console.table(rows)

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.root}>
        <ButtonToolBox>
          <RibbonGroup label="檔案">
            <RibbonSmallButton 
              icon={<BsDatabaseAdd size={32}/>} 
              label="加載" 
              onClick={() => confirm("開啟檔案")}
              tipContent="開啟 .db .sqlite .duckdb 連線"
            />  
          </RibbonGroup>
        </ButtonToolBox>

        <main className={styles.content}>
          <div style={{overflow: "auto"}}>
            <h1>vm</h1>
            <LuaRunner />
          </div>
        </main>
      </div>
    </FluentProvider>
  )
}