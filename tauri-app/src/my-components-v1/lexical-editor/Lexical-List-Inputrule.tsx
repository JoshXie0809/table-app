import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  KEY_DOWN_COMMAND,
  TextNode,
  COMMAND_PRIORITY_HIGH, // ✨ 增加命令優先級，確保我們的輸入規則優先被處理
} from "lexical";
// ✨ 導入列表相關的命令
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
} from "@lexical/list";

export function LexicalListInputRulePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        // 我們只關心按下空格鍵來觸發輸入規則
        if (event.key !== " ") {
          return false;
        }

        // 使用 editor.getEditorState().read() 在只讀模式下安全地讀取狀態
        const shouldApplyRule = editor.getEditorState().read(() => {
          const selection = $getSelection();
          // 確保是摺疊的範圍選取 (即游標沒有選中文字)
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return null;
          }
          const anchor = selection.anchor;
          const node = anchor.getNode();
          // 確保當前節點是文本節點
          if (!$isTextNode(node)) {
            return null;
          }
          const parent = node.getParent();
          // 確保父節點是段落節點，且游標在段落的開頭
          if (!parent || parent.getType() !== "paragraph" || anchor.offset !== node.getTextContent().length) {
              return null; // 游標不在文字末尾或不是段落開頭不觸發
          }

          const text = node.getTextContent();
          return text;
        });

        if (!shouldApplyRule) {
          return false;
        }

        let commandToDispatch: typeof INSERT_UNORDERED_LIST_COMMAND | typeof INSERT_ORDERED_LIST_COMMAND | typeof INSERT_CHECK_LIST_COMMAND | null = null;
        let shouldRemoveText = false; // 標記是否需要清除觸發符號

        switch (shouldApplyRule.trim()) { // 使用 trim() 清除可能的前後空格
          case "-":
            commandToDispatch = INSERT_UNORDERED_LIST_COMMAND;
            shouldRemoveText = true;
            break;
          case "1.": // 有序列表通常以 "1." 開始
            commandToDispatch = INSERT_ORDERED_LIST_COMMAND;
            shouldRemoveText = true;
            break;
          case "*": // 也可以是其他無序列表標記
            commandToDispatch = INSERT_UNORDERED_LIST_COMMAND;
            shouldRemoveText = true;
            break;
          case "-[]": // 待辦事項列表的 Markdown 語法
            commandToDispatch = INSERT_CHECK_LIST_COMMAND;
            shouldRemoveText = true;
            break;
          // 你可以添加更多，例如 "+ "
          default:
            commandToDispatch = null;
        }

        if (commandToDispatch) {
          event.preventDefault(); // 阻止瀏覽器預設行為（例如輸入空格）

          editor.update(() => {
            if (shouldRemoveText) {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const node = selection.anchor.getNode() as TextNode;
                    // 移除觸發符號
                    node.setTextContent(node.getTextContent().replace(shouldApplyRule.trim(), ''));
                }
            }
          });

          // ✨✨✨ 關鍵：分發 Lexical 內置的命令
          editor.dispatchCommand(commandToDispatch, undefined);

          return true; // 表示該命令已被處理
        }

        return false; // 如果沒有匹配的規則，讓其他監聽器處理
      },
      COMMAND_PRIORITY_HIGH // 確保這個輸入規則插件優先級足夠高
    );
  }, [editor]);

  return null;
}