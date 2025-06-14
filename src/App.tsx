import React, { useEffect, useMemo } from "react";
import { FluentProvider, webLightTheme, Text } from "@fluentui/react-components";
import { FloatingInputPanel } from "./my-components/ProtalPanel";
import { createSheet, updateSheetCellMatrix } from "./my-components/sheet/sheet";
import { registerBuiltInCellPlugins } from "./my-components/cell/initCellPlugins.ts"
import { createDefaultCell } from "./my-components/cell/cellPluginSystem.ts";
import SheetView01 from "./my-components/sheetView-v0.1/SheetViewV01.tsx";

registerBuiltInCellPlugins();


function App() {

  const init_sheet = useMemo(() => {
    return createSheet({nRow: 15000, nCol: 150})
  }, []) 
  const [sheet, setSheet] = React.useState(init_sheet);

  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    let nc = createDefaultCell("Text");
    nc.payload.value = "⚡⚡1234567879";

    const sheet2 = updateSheetCellMatrix(sheet, [
      [2, null, nc],
      [null, 2, nc],
    ]);

    setSheet(sheet2)
    
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

        <SheetView01 sheet={sheet} setSheet={setSheet} />

      </div>
    </main>
    </FluentProvider>
  );
}

export default App;
