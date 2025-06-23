import React, { useEffect, useState } from "react";
import { FluentProvider, webLightTheme, Text, webDarkTheme } from "@fluentui/react-components";
import { FloatingInputPanel } from "./my-components-v0/ProtalPanel.tsx";

import { invoke } from "@tauri-apps/api/core";
import { ICell, IVirtualCells } from "./my-components-v1/IVirtualCells.ts";
import { useVirtualCells, UseVirtualCellsOptions } from "./my-components-v1/hooks/useVirtualCell.ts";
import { SheetView11 } from "./my-components-v1/sheetView/SheetView-v1.tsx";
import { loadSheetData } from "./tauri-api/loadSheetData.ts";
import { LoadSheetRequest } from "./tauri-api/types/LoadSheetRequest.ts";


interface TauriApiLoadSheetResponse {
    type: string;
    sheetName: string;
    rowCount: number;
    colCount: number;
    cellWidth: number;
    cellHeight: number;
    cells?: ICell[]; // 可選的初始 Cell 數據陣列
}


function App() {

    const [open, setOpen] = React.useState(false);

    useEffect(() => {
      
      async function fetch() {
        const arg: LoadSheetRequest = {sheetName: "test-test"};
        const prev = performance.now();
        const test = await loadSheetData(arg);
        console.log(performance.now() - prev)
        console.log(test);
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
