import { open } from "@tauri-apps/plugin-dialog";
import { RibbonSmallButton } from "../RibbonGroup"
import { BsDatabaseAdd } from "react-icons/bs";
import { latestLoadDB$ } from "../../sql-tool-db-list/ListDB";
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Divider, Input, Text, tokens } from "@fluentui/react-components";
import { useState } from "react";
import { SiDuckdb } from "react-icons/si";

export const ButtonLoadDB = () => {
    const [openLoadFileDialog, setOpenLoadFileDialog] = useState(false);
    const [dbPath, setDBPath] = useState<null | string>(null);

    const onClick = async () => {
      const file = await open({
        title: "load database",
        multiple: false,
        directory: false,
        filters: [
          {
            name: "", 
            extensions: ["duckdb"]
          },
        ],
      });
      if(file === null) return;
      setDBPath(file)
      // latestLoadDB$.next(file);
    }
    
    return (
      <>
        <RibbonSmallButton 
          icon={<BsDatabaseAdd size={32}/>} 
          label="加載" 
          onClick={() => {
            setOpenLoadFileDialog(true)
            setDBPath(null)
          }}
          tipContent="開啟 .duckdb 連線"
        />
        {
          openLoadFileDialog && 
          <Dialog
            open={openLoadFileDialog}
            modalType="modal"
          >
            <DialogSurface aria-describedby={undefined}>
              <DialogBody style={{ userSelect: "none"}}>
                <DialogTitle style={{ marginBottom: "12px" }}>Attach duckdb 資料庫</DialogTitle>
                  <DialogContent
                    style={{ 
                      display: "flex", 
                      flexDirection: "column",
                      rowGap: "8px",
                      height: "300px",
                    }}
                  >
                    <div>
                      選擇一個本地的 .duckdb 資料庫連線並給予一個 alias。
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      設定並按下 Attach 按鈕後，
                      該資料庫將以 attach 'path/to/db' as alias 的方法加入到當前的 connection。
                      之後你便可以在程式碼區塊以 from alias.table 的語句查詢。  
                    </div>
                    <div>
                      <Button appearance="transparent" icon={<SiDuckdb/>} onClick={onClick}>選擇資料庫</Button>
                    </div>
                    <div style={{ marginBottom: "8px",}}>
                      <Text size={200} style={{ paddingLeft: "12px", }}>{dbPath ?? "點選上方按鈕"}</Text>
                      <Divider />
                    </div>
                    <div>
                      <Button tabIndex={-1} style={{ cursor: "default" }} appearance="transparent" icon={<SiDuckdb/>} >
                        Alias (資料庫別名)
                      </Button>
                    </div>
                    <Input appearance="underline" placeholder="輸入 alias"></Input>
                  </DialogContent>
                  <DialogActions>
                    <Button appearance="primary">Attach</Button>
                    <DialogTrigger disableButtonEnhancement>
                      <Button
                        appearance="secondary" 
                        onClick={() => setOpenLoadFileDialog(false)}>
                        Close
                      </Button>
                    </DialogTrigger>
                  </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        }
      </>
    )
}