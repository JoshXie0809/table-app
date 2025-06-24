import React, { useEffect, useState } from "react";
import { FluentProvider, webLightTheme, Text, webDarkTheme } from "@fluentui/react-components";
import { FloatingInputPanel } from "./my-components-v0/ProtalPanel.tsx";

import { SheetView11 } from "./my-components-v1/sheetView/SheetView-v1.tsx";
import { loadSheet } from "./tauri-api/loadSheet.ts";
import { LoadSheetRequest } from "./tauri-api/types/LoadSheetRequest.ts";
import { loadCellPluginCssMap, injectCellPluginCSS } from "./tauri-api/loadAllCssMap.ts";
import { createVirtualCellsFromBackend } from "./my-components-v1/createVirtualCells.ts";

function App() {

    const [open, setOpen] = React.useState(false);

    useEffect(() => {
      
      async function fetch() {
        const arg: LoadSheetRequest = {sheetName: "test-test"};
        const test = await loadSheet(arg);
        
        if(test.success){
          let vc = createVirtualCellsFromBackend(test.data!);
          console.log(vc);
        }

        const css_map = await loadCellPluginCssMap();
        console.log(css_map)

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

        
        <SheetView11 />
        
      </div>
    </main>

    <div id="canvas-table-quickEdit-portal-root"/>
    </FluentProvider>
  );
}

export default App;
