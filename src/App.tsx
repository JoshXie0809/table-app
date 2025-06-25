import React, { useEffect } from "react";
import { FluentProvider, webLightTheme, Text } from "@fluentui/react-components";
import { FloatingInputPanel } from "./my-components-v0/ProtalPanel.tsx";

import { SheetView11 } from "./my-components-v1/sheetView/SheetView-v1.tsx";
import { loadSheet } from "./tauri-api/loadSheet.ts";
import { LoadSheetRequest } from "./tauri-api/types/LoadSheetRequest.ts";
import { loadCellPluginCssMap, injectCellPluginCSS } from "./tauri-api/loadAllCssMap.ts";
import { createVirtualCellsFromBackend } from "./my-components-v1/createVirtualCells.ts";
import { VirtualCells } from "./my-components-v1/VirtualCells.ts";

function App() {

    const [open, setOpen] = React.useState(false);
    const [virtualCellsReady, setVirtualCellsReady] = React.useState(false); // 新增狀態來追蹤 vcRef 是否準備好
    const vcRef = React.useRef<VirtualCells | null>(null);

    useEffect(() => {
      
      async function fetch() {
        const arg: LoadSheetRequest = {sheetName: "test-test"};
        const test = await loadSheet(arg);
        
        if(test.success){
          let vc = createVirtualCellsFromBackend(test.data!);
          vcRef.current = vc;
          setVirtualCellsReady(true);
        }

        const css_map = await loadCellPluginCssMap();

        if(css_map.data)
          injectCellPluginCSS(css_map.data)
      }

      fetch();
      
    }, [])
  
  return (
    <FluentProvider theme={webLightTheme}>
    
    <main>
      <div style={{ 
        padding: "24px 20px",  
        height: "900px", 
        display: "flex",
        flexDirection: "column",  
        gap: 24, }}>
        
        <Text size={500}> Hello world </Text>

        <div>
          <button onClick={() => setOpen(true)}>
            open
          </button>
        </div>

        {open &&
         <FloatingInputPanel onClose={() => setOpen(false)} />
        }

        
        {virtualCellsReady && <SheetView11 vcRef={vcRef}/>}
        
      </div>
    </main>

    <div id="canvas-table-quickEdit-portal-root"/>
    </FluentProvider>
  );
}

export default App;
