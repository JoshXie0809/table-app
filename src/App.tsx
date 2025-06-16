import React, { useEffect, useState } from "react";
import { FluentProvider, webLightTheme, Text } from "@fluentui/react-components";
import { FloatingInputPanel } from "./my-components-v0/ProtalPanel.tsx";

import { invoke } from "@tauri-apps/api/core";
import { ICell, IVirtualCells } from "./my-components-v1/IVirtualSheet.ts";
import { useVirtualCells, UseVirtualCellsOptions } from "./my-components-v1/hooks/useVirtualCell.ts";
import { VirtualCellsRenderer } from "./test.tsx";

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
    // optionsState 儲存傳給 useVirtualCells 的選項
    const [virtualCellsOptions, setVirtualCellsOptions] = useState<UseVirtualCellsOptions | null>(null);


    

    useEffect(() => {
        async function loadInitialSheetData() { // 更好的命名
            try {
                // 模擬一個 Sheet ID，實際應該從路由或用戶選擇中獲取
                const sheetIdToLoad = "default_sheet_id"; 
                const res: TauriApiLoadSheetResponse = await invoke("load_sheet_data", { sheetName: sheetIdToLoad }); // <-- 修正：參數名和類型

                // 從回應中提取數據，構建 UseVirtualCellsOptions
                const options: UseVirtualCellsOptions = {
                    iType: res.type, // 來自 metadata
                    iSheetName: res.sheetName,
                    iRowCount: res.rowCount,
                    iColCount: res.colCount,
                    iCellWidth: res.cellWidth, // 新增
                    iCellHeight: res.cellHeight, // 新增
                    iCells: res.cells, // 來自 allCells
                };

                setVirtualCellsOptions(options);
            } catch(error) {
                console.error("Error loading initial sheet data:", error);
            }
        }
        
        loadInitialSheetData(); // 執行載入數據的函式
    }, []); // 
  
  
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

        {virtualCellsOptions && (
          <VirtualCellsRenderer options={virtualCellsOptions} />
        )}


      </div>
    </main>

    <div id="canvas-table-quickEdit-portal-root"/>
    </FluentProvider>
  );
}

export default App;
