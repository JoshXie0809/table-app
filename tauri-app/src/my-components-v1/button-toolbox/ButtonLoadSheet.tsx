import { Button, Tooltip } from "@fluentui/react-components";
import { IoFolderOpenOutline } from "react-icons/io5";
import { open } from "@tauri-apps/plugin-dialog";
import React from "react";

export interface ButtonLoadSheetProps {
  setSheetName: React.Dispatch<React.SetStateAction<string | null>>
  setVCReady: React.Dispatch<boolean>
}

export const ButtonLoadSheet: React.FC<ButtonLoadSheetProps> 
= ({
  setSheetName,
  setVCReady
}) => {
    return(
      <Tooltip
        content="開啟 sheetpkg.zip 表格檔案"
        relationship="description"
      >
        <Button icon={<IoFolderOpenOutline size={24} />} 
          onClick={async () => {
            const file = await open({
              multiple: false,
              directory: false,
              filters: [
                {
                  name: "", 
                  extensions: ["sheetpkg.zip"]
                },
              ],
            });
            
            setSheetName((oldFile: string | null) => {
              if(file === null)
                return oldFile;
              
              if (oldFile !== file) {
                setVCReady(false);
                return file;
              }
                
              return oldFile; // 不變更
            });

            console.log(file);
          }}
        >
          load sheet
        </Button>
      </Tooltip>
      
    )
}