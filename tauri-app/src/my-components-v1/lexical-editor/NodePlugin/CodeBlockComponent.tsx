import { makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    backgroundColor: tokens.colorNeutralBackground6,
    
    borderRadius: "8px",
    padding: "16px",
    fontFamily: "monospace",
    fontSize: "14px",
    whiteSpace: "pre",
    overflowX: "auto",
    color: tokens.colorNeutralForeground1,
  },
});

export const CodeBlockComponent = () => {
  const styles = useStyles();

  // 可搭配編輯狀態、語法 highlight 或 innerText
  return (
    <div className={styles.root}>
      console.log("my-code: Hello world");
    </div>
  );
};
