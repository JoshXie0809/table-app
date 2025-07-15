import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "@fluentui/react-components";
import {
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { INSERT_TIMESTAMP_COMMAND } from "../NodePlugin/TimeStampNodePlugin";



export function InsertTimestampButton() {
  const [editor] = useLexicalComposerContext();

  const handleClick = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const payload = selection.getTextContent();
        editor.dispatchCommand(INSERT_TIMESTAMP_COMMAND, payload);
      }
    });
  };

  return <Button onClick={handleClick}>插入時間戳</Button>;
}
