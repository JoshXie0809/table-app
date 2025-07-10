import { RibbonLargeButton } from "../RibbonGroup"
import { BsDatabaseFill } from "react-icons/bs";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

export function openNewWindow() {
  const label = `window-sql-tool`;
  const win = new WebviewWindow(label, {
    url: `src/windows/sql.html`,
    width: 800,
    height: 600,
    resizable: true,
    title: `SQL 工具`,
  });

  win.once('tauri://created', () => {
    console.log(`${label} created`);
  });

  win.once('tauri://error', (e) => {
    console.error('Window creation error:', e);
  });
}

export const ButtonSQL = () => {
  return(
    <RibbonLargeButton
      icon={<BsDatabaseFill size={52} color="rgb(141, 152, 190)"/>}
      label="SQL"
      onClick={() => openNewWindow()}
    />
  )
}