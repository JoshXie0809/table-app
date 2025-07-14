import { Button, makeStyles, tokens, Toolbar, ToolbarDivider } from "@fluentui/react-components";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CAN_REDO_COMMAND, CAN_UNDO_COMMAND, REDO_COMMAND, UNDO_COMMAND } from "lexical";
import { useEffect, useState } from "react";
import { IoIosUndo, IoIosRedo } from "react-icons/io";
import { LockClosed24Regular, LockOpen24Regular } from "@fluentui/react-icons"; // 用更明顯的鎖icon
import { Subject } from "rxjs";
import { InsertCodeBlockButton } from "./Button/Lexical-InsertCodeNodeButton";
import { InsertLinkButton } from "./Button/Lexical-HyperLinkButton";


export const editable$ = new Subject<boolean>();
export const undoable$ = new Subject<boolean>();
export const redoable$ = new Subject<boolean>();

export function useStreamState<T>(observable: Subject<T>, initial: T): T {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const sub = observable.subscribe(setValue);
    return () => sub.unsubscribe();
  }, [observable]);
  return value;
}

export const useLexicalToolBarStyles = makeStyles({
  "toolbar": { 
    position: "sticky", 
    top: "0px", 
    zIndex: 1, 
    backgroundColor: tokens.colorNeutralBackground3, 
    margin: '2px'
  },
  "toolbar-button": { fontSize: tokens.fontSizeBase300 },
  "toolbar-button-icon": { fontSize: tokens.fontSizeBase300 }
});

export const LexicalToolBar = () => {
  const styles = useLexicalToolBarStyles();
  const [editor] = useLexicalComposerContext();

  // 【註冊 Lexical 狀態改變→推送到 stream】
  useEffect(() => {
    // 可編輯狀態
    editable$.next(editor.isEditable());
    const editableDispose = editor.registerEditableListener((v) => editable$.next(v));

    // Undo/Redo 狀態（Lexical 需手動註冊監控）
    undoable$.next(false); // 預設不能 undo
    redoable$.next(false);
    const undoDispose = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload: boolean) => {
        undoable$.next(payload);
        return false;
      },
      0
    );
    const redoDispose = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload: boolean) => {
        redoable$.next(payload);
        return false;
      },
      0
    );
    return () => {
      editableDispose();
      undoDispose();
      redoDispose();
    };
  }, [editor]);

  return (
    <Toolbar className={styles.toolbar}>
      <Lock />
      <ToolbarDivider />
      <Undo /> <Redo />
      <ToolbarDivider />
      <InsertCodeBlockButton />
      <InsertLinkButton />
    </Toolbar>
  );
};

// ---------------------------

const Lock = () => {
  const styles = useLexicalToolBarStyles();
  const [editor] = useLexicalComposerContext();
  const editable = useStreamState(editable$, true);

  const toggleEditable = () => {
    editor.setEditable(!editable);
    // Lexical 內部 setEditable 會自動觸發 listener，不需要手動 next
  };

  return (
    <Button
      appearance="subtle"
      className={styles["toolbar-button"]}
      icon={editable
        ? <LockOpen24Regular className={styles["toolbar-button-icon"]} />
        : <LockClosed24Regular className={styles["toolbar-button-icon"]} />
      }
      onClick={toggleEditable}
      aria-label={editable ? "鎖定編輯" : "解除鎖定"}
      title={editable ? "點擊鎖定編輯（只讀）" : "點擊解鎖"}
    />
  );
};

const Undo = () => {
  const styles = useLexicalToolBarStyles();
  const [editor] = useLexicalComposerContext();
  const editable = useStreamState(editable$, true);
  const undoable = useStreamState(undoable$, false);

  return (
    <Button
      appearance="subtle"
      className={styles["toolbar-button"]}
      icon={<IoIosUndo className={styles["toolbar-button-icon"]} />}
      onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      disabled={!editable || !undoable}
      title="復原 (Undo)"
    />
  );
};

const Redo = () => {
  const styles = useLexicalToolBarStyles();
  const [editor] = useLexicalComposerContext();
  const editable = useStreamState(editable$, true);
  const redoable = useStreamState(redoable$, false);

  return (
    <Button
      appearance="subtle"
      className={styles["toolbar-button"]}
      icon={<IoIosRedo className={styles["toolbar-button-icon"]} />}
      onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      disabled={!editable || !redoable}
      title="重做 (Redo)"
    />
  );
};

