import { FluentProvider, Text, webLightTheme } from "@fluentui/react-components";
import { useStyles } from "../../App";
import { ButtonToolBox } from "../../my-components-v1/button-toolbox/ButtonToolBox";
import { RibbonGroup } from "../../my-components-v1/button-toolbox/RibbonGroup";
import LuaRunner from "../../my-components-v1/lua/LuaRunner";
import "./SQLApp.css"
import { useEffect, useState } from "react";
import { sqlConnect, sqlTableInfo } from "../../tauri-api/sqlConnection";
import { Table, tableFromIPC } from "apache-arrow"
import { ArrowTable } from "../../my-components-v1/arrow_table/ArrowTable";
import { ButtonLoadDB } from "../../my-components-v1/button-toolbox/button-sql-tool/ButtonLoadDB";

export const SQLApp = () => {
  const styles = useStyles();
  const [dbPath, setDBPath] = useState<string | null>(null);
  const [table, setTable] = useState<Table | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const path = "C:/Users/USER/Desktop/dotnet_test/React-test/my-workspace/data.duckdb";
      const result = await sqlConnect({ path });
      if (!result.success && result.error) {
        return;
      }
      const tableInfo = await sqlTableInfo({ path });
      const table = tableFromIPC(tableInfo);
      setTable(table);
    }

    fetch();
  }, [])

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.root}>
        <ButtonToolBox>
          <RibbonGroup label="檔案">
            <ButtonLoadDB setDBPath={setDBPath}/>
          </RibbonGroup>
        </ButtonToolBox>

        <main className={styles.content}>
          <div style={{overflow: "auto"}}>
            <Text>
              nowPath: {dbPath ? dbPath : "尚未連線"}
            </Text>
            <ArrowTable table={table} />
            <h1>vm</h1>
            <LuaRunner />
          </div>
        </main>
      </div>
    </FluentProvider>
  )
}