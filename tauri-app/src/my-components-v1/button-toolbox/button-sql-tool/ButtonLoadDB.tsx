import { open } from "@tauri-apps/plugin-dialog";
import { RibbonSmallButton } from "../RibbonGroup"
import { BsDatabaseAdd } from "react-icons/bs";

export interface ButtonLoadDBProps {
  setDBPath: React.Dispatch<React.SetStateAction<string | null>>  
}
export const ButtonLoadDB: React.FC<ButtonLoadDBProps> = ({ 
  setDBPath
}) => {
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
      setDBPath(file);
    }
    
    return (
      <RibbonSmallButton 
        icon={<BsDatabaseAdd size={32}/>} 
        label="加載" 
        onClick={onClick}
        tipContent="開啟 .db .sqlite .duckdb 連線"
      />  
    )
}