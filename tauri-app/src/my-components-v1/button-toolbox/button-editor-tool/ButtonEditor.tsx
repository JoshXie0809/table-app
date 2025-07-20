import { RibbonLargeButton } from "../RibbonGroup"
import { BsFileTextFill  } from "react-icons/bs";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Toast, Toaster, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { LogicalPosition, Window } from "@tauri-apps/api/window";

const label = `window-lexical-rich-text-editor`;
async function openNewWindow(dispatchToast: (content: React.ReactNode, options?: any) => void) {
  const mainWindow = await Window.getByLabel("main");
  const size = await mainWindow?.innerSize();
  const position = await mainWindow?.innerPosition();
  const width = 800;
  const height = 600;
  if(!size || !position ) return;
  const x = position.x + Math.round((size.width - width) / 2);
  const y = position.y + Math.round((size.height - height) / 2);
  
  // 確認存在
  const sqlWindow = await WebviewWindow.getByLabel(label); 
  if(sqlWindow) {
    await sqlWindow.setPosition(new LogicalPosition(x, y))
    await sqlWindow.setFocus();
    dispatchToast(
      <Toast>
        <ToastTitle>文字編輯器頁面已經存在</ToastTitle>
      </Toast>,
      {intent: "info"}
    )
    return;
  }
  const win = new WebviewWindow(label, {
    url: "/src/windows/editor/editor.html",
    width,
    height,
    resizable: true,
    title: "文字編輯器",
    x, 
    y
  });
  win.once('tauri://created', () => {
    const notify = () => {
      dispatchToast(
        <Toast>
          <ToastTitle>文字編輯器頁面成功開啟</ToastTitle>
        </Toast>,
        {intent: "success"}
      )
    }
    notify()
  });
  win.once('tauri://error', (e) => {
    
    const notify = () => {
        dispatchToast(
          <Toast>
            <ToastTitle>{`${e}`}</ToastTitle>
          </Toast>,
          {intent: "info"}
        )
    }    
    notify()
  });
}

export const ButtonLexicalTextEditor = () => {
  const toasterId = useId(`${label}-open-toaster`)
  const { dispatchToast } = useToastController(toasterId);
  return(
    <>
      <Toaster toasterId={toasterId} />
      <RibbonLargeButton
        icon={<BsFileTextFill size={52} />}
        label="編輯器"
        onClick={() => openNewWindow(dispatchToast)}
      />
    </>   
  )
}