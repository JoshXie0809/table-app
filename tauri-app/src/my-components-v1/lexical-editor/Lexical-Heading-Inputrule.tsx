import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $createTextNode } from "lexical";
import { useEffect } from "react";

import { $createHeadingNode } from "@lexical/rich-text";


export function LexicalHeadingInputRulePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        // 只處理單一游標的情境
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const anchor = selection.anchor;
          const node = anchor.getNode();
          // 僅處理段落（避免 block-level 以外誤觸）
          const parent = node.getParent();
          if ( parent && parent.getType() === "paragraph") {
            const textContent = node.getTextContent();
            // 使用正則偵測 "## " 開頭
            const match = textContent.match(/^:(#{1,6}) $/); // 1~6 個 # + 空白
            if (match) {
              const level = match[1].length; // 幾個 # 就幾級標題
              editor.update(() => {
                // 建立新的 heading node
                const heading = $createHeadingNode(`h${level}` as any);
                heading.append($createTextNode("")); // 保持一行空白
                // 用新的 heading 取代原來的 paragraph
                parent.replace(heading);
                heading.selectEnd();
              });
            }
          }
        }
      });
    });
  }, [editor]);

  return null;
}
