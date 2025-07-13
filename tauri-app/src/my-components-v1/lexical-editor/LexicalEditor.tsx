import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { makeStyles, Text, tokens } from "@fluentui/react-components";
import { LexicalHeadingInputRulePlugin } from "./Lexical-Heading-Inputrule";
import { LexicalTreeViewPlugin } from "./Lexical-TreeView";
import { LexicalToolBar } from "./Lexical-ToolBar";
import { LexicalCalcInputRulePlugin } from "./Lexical-Calc";


const useStyles = makeStyles({
  "editor-container": {
    minWidth: "400px",
    maxWidth: "1000px", 
    margin: "24px auto 16px", 
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.fontSizeBase300, 
    padding: "24px",
    position: "relative",
  },
  "editor-input": {
    padding: "12px",
    "& > *:first-child": {
      marginTop: "0px",
    },

    "& > *:last-child": {
      marginBottom: "0px",
    },
    
  },
  "editor-input-container": {
    position: "relative", 
  },
  "divider": {
    width: "100%",
    border: "none",
    borderTop: `2px solid ${tokens.colorNeutralStroke1}`,
    margin: "24px 0",
    height: "0",
    background: "linear-gradient(to right, #0a5acf 0%, #00ff99 100%)", // 例
  },
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
      <LexicalComposer initialConfig={initialConfig}>
        <LexicalToolBar />
        <div className={styles["editor-input-container"]}>
          <RichTextPlugin
            placeholder={
              <Text 
                className={styles["editor-input"]} 
                style = {{ position: "absolute", top: "0", left: "0", pointerEvents: "none"}}
              >
                Enter some text...
              </Text>
            }
            contentEditable={<ContentEditable className={styles["editor-input"]} spellCheck={false}/>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <LexicalHeadingInputRulePlugin />
          <LexicalCalcInputRulePlugin />
          {/* 我要在這裡分割出上半和下半 */}
          <hr className={styles.divider} />
          <LexicalTreeViewPlugin />
        </div>
      </LexicalComposer>
    </div>
    
  );
}

            

