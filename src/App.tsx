import React, { useEffect, useMemo } from "react";
import { FluentProvider, webLightTheme, Text } from "@fluentui/react-components";
import { FloatingInputPanel } from "./my-components/ProtalPanel";

import SheetView01 from "./my-components/sheetView-v0.1/SheetViewV01.tsx";

import { registerBuiltInCellPlugins } from "./my-components/cell/initCellPlugins.ts"
import { registerBuiltInSheetPlugins } from "./my-components/sheet/initShetPlugin.ts";

import { getSheetPlugin, SheetPluginDefalutTool } from "./my-components/sheet/SheetPluginSystem.ts";
import { createDefaultCell } from "./my-components/cell/cellPluginSystem.ts";


import { invoke } from "@tauri-apps/api/core";

// 只需要定義前端傳送的類型，以及後端回傳的 DrawingCommand
interface CellRenderRequest {
  type: string; // 必須是 'type'
  payload: any;
  rowIndex: number;
  colIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DrawingCommand {
  bgFillStyle: string;
  borderStrokeStyle: string;
  text: string;
  textFont: string;
  textColor: string;
  textAlign: string;
  textBaseline: string;
  textX: number;
  textY: number;
}

// 測試 get_cell_render_data 命令
async function testGetCellRenderData() {
  const requestData: CellRenderRequest = {
    type: "Text", // 必須是 "Text"，因為 TextCellPlugin 的 type_id 是 "Text"
    payload: {
      value: "今天心情好",
      label: "快速測試",
    },
    rowIndex: 0,
    colIndex: 0,
    x: 10.0,
    y: 10.0,
    width: 100.0,
    height: 30.0,
  };

  console.log("前端發送請求:", requestData);

  try {
    const response: DrawingCommand = await invoke("get_cell_render_data", {
      request: requestData,
    });
    console.log("前端收到成功回應:", response);

    // 您可以在這裡簡單地更新一個 DOM 元素來顯示回傳的文本，以確認成功
    const resultDiv = document.getElementById("result");
    if (resultDiv) {
      resultDiv.innerText = `成功收到數據：${response.text} (背景: ${response.bgFillStyle})`;
      resultDiv.style.color = "green";
      resultDiv.style.backgroundColor = response.bgFillStyle
    }
  } catch (error) {
    console.error("前端收到錯誤回應:", error);
    const resultDiv = document.getElementById("result");
    if (resultDiv) {
      resultDiv.innerText = `發生錯誤: ${error}`;
      resultDiv.style.color = "red";
    }
  }
}



registerBuiltInCellPlugins();
registerBuiltInSheetPlugins();



function App() {

  const plugin = getSheetPlugin("sparse");

  const init_sheet = useMemo(() => {
    return plugin!.createSheet(12800, 512)
  }, []) 

  const [sheet, setSheet] = React.useState(init_sheet);

  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    let nc = createDefaultCell("Text");
    nc.payload.value = "⚡⚡1234567879";
    let sheet2 = SheetPluginDefalutTool.updateSheetData(sheet, [
      [2, null, nc],
      [null, 2, nc],
      [5000, 50, nc],
    ]);

    setSheet(sheet2)

    let res = testGetCellRenderData();
    console.log(res);

  }, [])

  requestAnimationFrame

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

        <div id="result">err</div>

        <SheetView01 sheet={sheet} setSheet={setSheet} />

      </div>
    </main>
    <div id="canvas-table-quickEdit-portal-root"/>
    </FluentProvider>
  );
}

export default App;
