import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $isParagraphNode,
  $createTextNode,
} from "lexical";
import { $createMyCodeNode } from "../NodePlugin/MyCodeNode";
import { editable$, useLexicalToolBarStyles, useStreamState } from "../Lexical-ToolBar";
import { Button } from "@fluentui/react-components";
import { CodeBlock24Regular } from '@fluentui/react-icons';

export function InsertCodeBlockButton() {
  const [editor] = useLexicalComposerContext();
  const editable = useStreamState(editable$, true);
  const styles = useLexicalToolBarStyles();

  const handleClick = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();
      const parent = anchorNode.getTopLevelElement();

      if ($isParagraphNode(parent)) {
        const codeNode = $createMyCodeNode();
        const children = parent.getChildren();
        // 👇 先搬移原來的文字（不可在 replace() 之後執行）
        if (children.length === 0) {
          codeNode.append($createTextNode());
        } else {
          for (const child of children) {
            codeNode.append(child); // 把原段落的子節點搬進來
          }
        }
        // 👇 然後才用 code block 取代掉原段落
        parent.replace(codeNode);
        // 👇 最後在 code block 後面加個 paragraph
        const paragraph = $createParagraphNode();
        codeNode.insertAfter(paragraph);
        paragraph.select(); // 移動游標到下一行
      }
    });
  };

  return (
    <Button 
      disabled={!editable}
      onClick={handleClick}
      appearance="subtle"
      icon={<CodeBlock24Regular className={styles["toolbar-button-icon"]}/>}
      title="插入 code 區塊"
    />
  );
}
