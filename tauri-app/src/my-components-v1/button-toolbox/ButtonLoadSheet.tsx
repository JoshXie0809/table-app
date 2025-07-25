import { FaFolderOpen } from "react-icons/fa";
import { open } from "@tauri-apps/plugin-dialog";
import React from "react";
import { RibbonSmallButton } from "./RibbonGroup";
import { dirname } from "@tauri-apps/api/path";
import { currentPath$, setCurrentPath } from "../now-path-manager/now-path";
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
    const currentPath = currentPath$.getValue();
    const startPath = currentPath ? currentPath : undefined;

    let file = await open({
      multiple: false,
      directory: true,
      defaultPath: startPath,
      filters: [
        {
          name: ".sheetpkg",
          extensions: ["sheetpkg"],
        },
      ],
    });

    if (file !== null) {
      const parentPath = await dirname(file);
      setCurrentPath(parentPath); // 更新 stream
      setSheetName((oldFile: string | null) => {
        if (oldFile !== file) {
          setVCReady(false);
          return file;
        }
        return oldFile; // 不變更
      });
    }
  };

  return(
    <RibbonSmallButton
      icon={<FaFolderOpen size={32} color="#fbc02d" />} 
      onClick={onClick}
      label="載入檔案"
      tipContent="載入 .sheetpkg 檔案"
    />
  )
}

