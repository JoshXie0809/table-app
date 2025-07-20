import { FluentProvider, webLightTheme } from "@fluentui/react-components"
import { MyLexicalEditor } from "../../my-components-v1/lexical-editor/LexicalEditor"
import { useStyles } from "../../App";

export const EditorApp = () => {
  const styles = useStyles();
  return(
    <FluentProvider theme={webLightTheme}>
      <div className={styles.root}>
        <main className={styles.content}>
          <div style={{overflow: "auto"}}>
            <MyLexicalEditor />
          </div>
        </main>
      </div>
    </FluentProvider>
  )
}