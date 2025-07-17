import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "@fluentui/react-components";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { $getSelection, $isRangeSelection, } from "lexical";
import { INSERT_TIMESTAMP_COMMAND } from "../NodePlugin/TimeStampNodePlugin";
import { editable$, useLexicalToolBarStyles, useStreamState } from "../Lexical-ToolBar";


export function InsertTimestampButton() {
  const [editor] = useLexicalComposerContext();
  const editable = useStreamState(editable$, true);
  const styles = useLexicalToolBarStyles();
  
  const handleClick = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const payload = selection.getTextContent();
        editor.dispatchCommand(INSERT_TIMESTAMP_COMMAND, payload);
      }
    });
  };

  return (
    <Button 
      onClick={handleClick} 
      className={styles["toolbar-button"]}
      disabled={!editable} 
      appearance="subtle"
      icon={<IoCalendarNumberOutline className={styles["toolbar-button-icon"]} />}
      title="插入時間戳"
    />
  )
}
