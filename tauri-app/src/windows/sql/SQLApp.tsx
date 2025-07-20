import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { useStyles } from "../../App";
import { ButtonToolBox } from "../../my-components-v1/button-toolbox/ButtonToolBox";
import { RibbonGroup, RibbonSmallButton } from "../../my-components-v1/button-toolbox/RibbonGroup";
import { BsDatabaseAdd } from "react-icons/bs";
import LuaRunner from "../../my-components-v1/lua/LuaRunner";
import "./SQLApp.css"
import { useEffect } from "react";
import { sqlConnect, sqlListTable } from "../../tauri-api/sqlConnection";

export const SQLApp = () => {
  const styles = useStyles();
  useEffect(() => {
    const fetch = async () => {
      const path = "C:/Users/USER/Desktop/dotnet_test/React-test/my-workspace/data.duckdb";
      let result = await sqlConnect({ path });
      if (!result.success) return;
      let tables = await sqlListTable({ path });
      console.log(tables);
    }

    fetch();
  }, [])

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