import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getSelection, $isRangeSelection, $isTextNode, KEY_SPACE_COMMAND, $createTextNode } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";

export function LexicalHeadingInputRulePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_SPACE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const anchor = selection.anchor;
            const node = anchor.getNode();
            if ($isTextNode(node)) {
              const parent = node.getParent();
              if (parent && parent.getType() === "paragraph") {
                const textContent = node.getTextContent();
                // 偵測 :## (空白) 格式
                const match = textContent.match(/^:(#{1,6})$/);
                if (match) {
                  const level = match[1].length;
                  // 替換 paragraph → heading
                  editor.update(() => {
                    const heading = $createHeadingNode(`h${level}` as any);
                    heading.append($createTextNode(""));
                    parent.replace(heading);
                    heading.selectEnd();
                  });
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
