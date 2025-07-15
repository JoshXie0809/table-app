import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TOGGLE_LINK_COMMAND } from "@lexical/link"; // 引入 TOGGLE_LINK_COMMAND
import { Button } from "@fluentui/react-components";
import {
  $getSelection,
  $isRangeSelection,
} from "lexical";
import {
  editable$,
  useLexicalToolBarStyles,
  useStreamState,
} from "../Lexical-ToolBar"

import { LinkFilled } from "@fluentui/react-icons";


export function InsertLinkButton() {
  const [editor] = useLexicalComposerContext();
  const editable = useStreamState(editable$, true);
  const styles = useLexicalToolBarStyles();

  const handleClick = () => {
    editor.update(() => {
      console.log("Button clicked!")
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        // 如果不是範圍選取，則不做任何操作或處理其他選取類型
        return;
      }

      let url = prompt("請輸入超連結網址"); // 暫時使用 prompt，建議換成 Modal
      if (!url) {
        return; // 如果使用者取消或沒輸入，則返回
      }

      // 簡單的 URL 驗證 (你可以使用更複雜的正則表達式)
      // 這將確保連結以 http:// 或 https:// 開頭，如果沒有，就加上去
      if (!url.match(/^(http|https):\/\//i)) {
        url = 'https://' + url;
      }

      // **Lexical 推薦使用 TOGGLE_LINK_COMMAND 來處理連結的插入和更新**
      // 它會自動處理選取、展開、以及正確地包裹或替換節點。
      // 當有選取時，它會將選取的文字變成連結。
      // 當沒有選取時，它會插入一個新的 LinkNode，其文字內容就是 URL 本身。

      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);

      // 如果你希望在沒有選取時，插入的文字不是 URL 本身，而是自定義的文字
      // 並且你真的需要處理「沒選取時插入自定義文字，有選取時包裹」兩種情況，
      // 你可以這樣做：
      // (但通常 TOGGLE_LINK_COMMAND 已經足夠靈活，尤其當你想編輯連結文字時)
      /*
      if (selection.isCollapsed()) {
        // 沒選取：插入一個帶有預設文字（例如「新連結」）的超連結
        const linkNode = $createLinkNode(url);
        const textNode = $createTextNode("新連結"); // 你可以自定義預設文字
        linkNode.append(textNode);
        selection.insertNodes([linkNode]);
      } else {
        // 有選取：將選取的內容轉為超連結
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
      */
    });
  };

  return (
    <Button 
      onClick={handleClick} disabled={!editable} 
      appearance="subtle"
      icon={<LinkFilled />} className={styles["toolbar-button-icon"]} 
      title="文字插入超連結"
    />
  )
}