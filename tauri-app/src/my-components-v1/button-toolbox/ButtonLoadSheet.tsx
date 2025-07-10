import { FaFolderOpen } from "react-icons/fa";
import { open } from "@tauri-apps/plugin-dialog";
import React from "react";
import { RibbonSmallButton } from "./RibbonGroup";

export interface ButtonLoadSheetProps {
  setSheetName: React.Dispatch<React.SetStateAction<string | null>>
  setVCReady: React.Dispatch<boolean>
}

export const ButtonLoadSheet: React.FC<ButtonLoadSheetProps> 
= ({
  setSheetName,
  setVCReady
}) => {

    const onClick = async () => {
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
    }

    return(
      <RibbonSmallButton
        icon={<FaFolderOpen size={32} color="#fbc02d" />} 
        onClick={onClick}
        label="載入檔案"
        tipContent="載入 .sheetpkg.zip 檔案"
      />
    )
}

