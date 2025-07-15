import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  KEY_DOWN_COMMAND,
  TextNode,
} from "lexical";
import { $createListNode, $createListItemNode, ListType } from "@lexical/list";

export function LexicalListInputRulePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key !== " ") return false;

        const text = editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
          const anchor = selection.anchor;
          const node = anchor.getNode();
          if (!$isTextNode(node)) return null;
          const parent = node.getParent();
          if (!parent || parent.getType() !== "paragraph") return null;
          const text = node.getTextContent();
          return text;
        });

        if (!text) return false;

        let listType: ListType | null = null;
        switch (text) {
          case "-":
            listType = "bullet"
            break;
          case "+":
            listType = "number"
            break;
          case "*":
            listType = "check"
            break;
          default:
            listType = null;
        }
        if(!listType) return false;
        event.preventDefault();
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          const anchor = selection.anchor;
          const node = anchor.getNode() as TextNode;
          const parent = node.getParent();
          if (!parent || parent.getType() !== "paragraph") return;
          console.log(listType === "check");
          const listItem = $createListItemNode(listType === "check" ? false : undefined);
          listItem.append(); // 可選：插入空白或初始內容
          const list = $createListNode(listType);
          list.append(listItem);
          parent.insertAfter($createParagraphNode())
          parent.replace(list);
          listItem.selectEnd(); // ✅ 將游標放在 <li> 的最後
        });
        return true;
      },
      0
    );
  }, [editor]);

  return null;
}
