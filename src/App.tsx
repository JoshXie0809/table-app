import React, { useEffect } from "react";
import { FluentProvider, webLightTheme, Text, makeStyles, tokens } from "@fluentui/react-components";
import { FloatingInputPanel } from "./my-components-v0/ProtalPanel.tsx";
import { SheetView11 } from "./my-components-v1/sheetView/SheetView-v1.tsx";
import { loadSheet } from "./tauri-api/loadSheet.ts";
import { LoadSheetRequest } from "./tauri-api/types/LoadSheetRequest.ts";
import { loadCellPluginCssMap, injectCellPluginCSS } from "./tauri-api/loadAllCssMap.ts";
import { createVirtualCellsFromBackend } from "./my-components-v1/createVirtualCells.ts";
import { VirtualCells } from "./my-components-v1/VirtualCells.ts";
import { CustomTitleBar } from "./my-components-v1/titlebar/CustomTitleBar.tsx";

import "./App.css";
import { MyButtonWrapper } from "./lit-components/my-button-wrapper.tsx";

const useStyles = makeStyles({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "24px 20px",
    gap: "24px",
    overflow: "hidden", // 你也可以用 auto
    backgroundColor: tokens.colorNeutralBackground1,
    // opacity: 0.975,
  },
});

function App() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [virtualCellsReady, setVirtualCellsReady] = React.useState(false);
  const vcRef = React.useRef<VirtualCells | null>(null);

  useEffect(() => {
    async function fetch() {
      const arg: LoadSheetRequest = { sheetName: "test-test" };
      const test = await loadSheet(arg);

      if (test.success) {
        let vc = createVirtualCellsFromBackend(test.data!);
        vcRef.current = vc;
        setVirtualCellsReady(true);
      }

      const css_map = await loadCellPluginCssMap();
      if (css_map.data) injectCellPluginCSS(css_map.data);
    }

    fetch();
  }, []);

  return (
    <FluentProvider theme={webLightTheme} style={{backgroundColor: "transparent"}}>
      <div className={styles.root}>
        <CustomTitleBar />        
        <main className={styles.content}>
          <Text size={500}> Hello world </Text>

          <MyButtonWrapper label="床前明月光" />

          <div>
            <button onClick={() => setOpen(true)}>open</button>
          </div>

          {open && <FloatingInputPanel onClose={() => setOpen(false)} />}
          {virtualCellsReady && <SheetView11 vcRef={vcRef} />}
        </main>
      </div>

      <div id="canvas-table-quickEdit-portal-root" />
    </FluentProvider>
  );
}

export default App;
