import React, { useEffect } from "react";
import { FluentProvider, webLightTheme, Text, makeStyles, tokens } from "@fluentui/react-components";
import { SheetView11 } from "./my-components-v1/sheetView/SheetView-v1.tsx";
import { loadSheet } from "./tauri-api/loadSheet.ts";
import { LoadSheetRequest } from "./tauri-api/types/LoadSheetRequest.ts";
import { loadCellPluginCssMap, injectCellPluginCSS } from "./tauri-api/loadAllCssMap.ts";
import { createVirtualCellsFromBackend } from "./my-components-v1/createVirtualCells.ts";
import { VirtualCells } from "./my-components-v1/VirtualCells.ts";
import { CustomTitleBar } from "./my-components-v1/titlebar/CustomTitleBar.tsx";

import "./App.css";
import { ButtonToolBox } from "./my-components-v1/button-toolbox/ButtonToolBox.tsx";
import { ButtonLoadSheet } from "./my-components-v1/button-toolbox/ButtonLoadSheet.tsx";
import { RibbonGroup } from "./my-components-v1/button-toolbox/RibbonGroup.tsx";
import { SystemHover } from "./my-components-v1/sheetView/canvas-table-v1.1/system-hover/SystemHover.tsx";
import { SystemQuickEdit } from "./my-components-v1/sheetView/canvas-table-v1.1/system-QuickEdit/SystemQuickEdit.tsx";
import { PointerStateManager } from "./my-components-v1/pointer-state-manager/PointerStateManger.ts";
import { ButtonSQL } from "./my-components-v1/button-toolbox/button-sql-tool/ButtonSQL.tsx";


export const useStyles = makeStyles({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "12px 20px",
    gap: "24px",
    overflow: "hidden", // 你也可以用 auto
    backgroundColor: tokens.colorNeutralBackground1,
    // opacity: 0.975,
  },
});

function App() {
  const styles = useStyles();
  const [sheetName, setSheetName] = React.useState<string | null>(null);
  const [virtualCellsReady, setVirtualCellsReady] = React.useState(false);
  const vcRef = React.useRef<VirtualCells | null>(null);

  // 加入全局監聽 監聽滑鼠事件
  useEffect(() => {
    const psm = new PointerStateManager();
    return () => {
      psm.destroy();
    }
  }, []);

  useEffect(() => {
    async function fetch(sheetName: string) {
      const arg: LoadSheetRequest = { sheetName };
      const test = await loadSheet(arg);
      if (test.success) {
        let vc = createVirtualCellsFromBackend(test.data!);
        vcRef.current = vc;
        setVirtualCellsReady(true);
      }
      const css_map = await loadCellPluginCssMap();
      if (css_map.data) injectCellPluginCSS(css_map.data);
    }
    if(sheetName)
      fetch(sheetName);

  }, [sheetName]);

  return (
    <FluentProvider theme={webLightTheme} style={{backgroundColor: "transparent"}}>
      <div className={styles.root}>
        <CustomTitleBar /> 
        <ButtonToolBox>
          <RibbonGroup label="檔案讀取">
            <ButtonLoadSheet setSheetName={setSheetName} setVCReady={setVirtualCellsReady} />
          </RibbonGroup>

          <RibbonGroup label="SQL 工具">
            <ButtonSQL />
          </RibbonGroup>
        </ButtonToolBox>

        <main className={styles.content}>
          {virtualCellsReady && vcRef.current && 
            <Text size={500} weight="semibold"> {vcRef.current.sheetName} </Text>
          }
          {virtualCellsReady && 
            <SheetView11 vcRef={vcRef} >
              <SystemHover />
              <SystemQuickEdit />
            </SheetView11>
          }
        </main>
      </div>

      <div id="canvas-table-quickEdit-portal-root" />
    </FluentProvider>
  );
}

export default App;
