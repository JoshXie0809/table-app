import { open } from "@tauri-apps/plugin-dialog";
import { RibbonSmallButton } from "../RibbonGroup"
import { BsDatabaseAdd } from "react-icons/bs";
import { latestLoadDB$ } from "../../sql-tool-db-list/ListDB";

export const ButtonLoadDB = () => {
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
      latestLoadDB$.next(file);
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