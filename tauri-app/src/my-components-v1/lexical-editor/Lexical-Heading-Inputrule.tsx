import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getSelection, $isRangeSelection, $isTextNode, KEY_DOWN_COMMAND, $createTextNode } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";

export function LexicalHeadingInputRulePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key !== " ") return false; // 只攔空白鍵
        // Lexical 還沒插空白！你可以自由控制
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const anchor = selection.anchor;
            const node = anchor.getNode();
            if ($isTextNode(node)) {
              const parent = node.getParent();
              if (parent && parent.getType() === "paragraph") {
                const textContent = node.getTextContent();
                const match = textContent.match(/^(#{1,6})$/); // 無空白
                if (match) {
                  const level = match[1].length;
                  editor.update(() => {
                    const heading = $createHeadingNode(`h${level}` as any);
                    heading.append($createTextNode(""));
                    parent.replace(heading);
                    heading.selectEnd();
                  });
                  event.preventDefault(); // 阻止插入空白
                }
              }
            }
          }
        });
        return false;
      },
      0
    );
  }, [editor]);

  return null;
}
