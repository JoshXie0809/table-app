import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { makeStyles } from "@fluentui/react-components";
import { LexicalHeadingInputRulePlugin } from "./Lexical-Heading-Inputrule";

const useStyles = makeStyles({
  "editor-container": {
    minWidth: "400px",
    maxWidth: "800px", 
    margin: "40px auto", 
    border: "2px solid #ccc", 
    borderRadius: "8px", 
    padding: "24px",

    "& > *:first-child": {
      marginTop: "0px",
    }
  },
  "editor-input": {
    padding: "12px",
    "& > *:first-child": {
      marginTop: "0px",
    },

    "& > *:last-child": {
      marginBottom: "0px",
    }
  }
})


const initialConfig = {
  namespace: "MyEditor",
  onError(error: Error) {
    throw error;
  },
  nodes: [HeadingNode],
};

export function MyLexicalEditor() {
  const styles = useStyles();

  return (
    <div className={styles["editor-container"]}>
      <h2>Lexical Rich Text Editor DEMO</h2>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className={styles["editor-input"]}>
            </ContentEditable>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <LexicalHeadingInputRulePlugin />
      </LexicalComposer>
    </div>
    
  );
}

            

