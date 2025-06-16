import React, { useEffect, useState } from "react";
import { FluentProvider, webLightTheme, Text } from "@fluentui/react-components";
import { FloatingInputPanel } from "./my-components-v0/ProtalPanel.tsx";

import { invoke } from "@tauri-apps/api/core";
import { ICell, IVirtualCells } from "./my-components-v1/IVirtualSheet.ts";
import { useVirtualCells } from "./my-components-v1/hooks/useVirtualCell.ts";

interface TauriApiLoadSheet {
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
  const [vc, setVC] = useState<null | IVirtualCells>(null );

  useEffect(() => {
    async function test_load_sheet_data() {
      try {
        const res: TauriApiLoadSheet = await invoke("load_sheet_data", {sheetName: "assd"});
        const iType = res.type;
        const iSheetName = res.sheetName
        const iRowCount = res.rowCount; res.cellHeight; res.cellWidth; res.colCount;
        // setVC(
        //   useVirtualCells()
        // )
        
      } catch(error) {
        console.error(error)
      }
    }
    
    test_load_sheet_data();
  }, [])

  console.log(vc);

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


      </div>
    </main>

    <div id="canvas-table-quickEdit-portal-root"/>
    </FluentProvider>
  );
}

export default App;
