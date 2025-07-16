import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getSelection, $isRangeSelection, createCommand } from "lexical";
import { $createTimestampNode } from "./TimeStampNode";
export const INSERT_TIMESTAMP_COMMAND = createCommand<string>();

export function TimestampPlugin() {
  const [editor] = useLexicalComposerContext();
  editor.registerCommand(
    INSERT_TIMESTAMP_COMMAND,
    (payload) => {
      editor.update(() => {
        const selection = $getSelection();
        if(!$isRangeSelection(selection)) return;
        // range-selection
        if(payload === "") {
          // 代表沒有選取到文字
          // 表示所有的時間都插入
          const timestampNode = $createTimestampNode(new Date().toLocaleTimeString());
          const textNodeAfter = $createTextNode(" ");
          const textNodeBefore = $createTextNode(" ");
          selection.insertNodes([textNodeBefore, timestampNode, textNodeAfter]);
          textNodeAfter.selectEnd();
          return;
        }
      })

      return true;
    },
    0
  )

  return null;
}