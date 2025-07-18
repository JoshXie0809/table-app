import { Button, makeStyles, Text, tokens, ToolbarDivider, Tooltip } from "@fluentui/react-components";
import React from "react";



const useStyles = makeStyles({
  group: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    height: "100%",
    boxSizing: "border-box",
    gap: "4px"
  },

  gridArea: {
    display: "grid",
    gridAutoFlow: "column",
    height: "100%",
    gridTemplateRows: "repeat(3, 32px)", // 每 column 固定 3 row
  },
  
  groupLabel: {
    margin: 0,          // ✅ 完全不要加 margin
    padding: 0,
    boxSizing: "border-box",
    fontSize: "12px",
    color: tokens.colorNeutralForeground1,
    textAlign: "center",
  },

  "small-icon-container": {
    width: "20px", // ✅ 固定 icon 寬度，和 VSCode 工具列類似
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  "small-label-text": {
    marginLeft: "8px",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  largeButton: {
    gridRow: "span 3",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // ✅ 全部靠左
    justifyContent: "flex-start",
    // gap: "4px",
    width: "100%",
  },

  iconArea: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    width: "100%",
  },
  
  labelArea: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    width: "100%",
  },
});

export const RibbonGroup: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => {
  const styles = useStyles();
  return (
    <>
      <div className={styles.group}>
        <Text className={styles.groupLabel}>{label}</Text>
        <div className={styles.gridArea}>{children}</div>
      </div>
      <ToolbarDivider />
    </>
  );
};


export const RibbonSmallButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  tipContent?: string;
}> = ({ icon, label, onClick, tipContent }) => {
  const styles = useStyles();

  const button = (
    <Button onClick={onClick} appearance="subtle">
      <span className={styles["small-icon-container"]}>{icon}</span>
      <span className={styles["small-label-text"]}>
        <Text size={200}>{label}</Text>
      </span>
    </Button>
  );

  return tipContent ? (
    <Tooltip content={tipContent} relationship="description">
      {button}
    </Tooltip>
  ) : (
    button
  );
};


export const RibbonLargeButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  tipContent?: string
}> = ({ icon, label, onClick, tipContent }) => {
  const styles = useStyles();

  const button =       
    <Button
      appearance="subtle"
      className={styles.largeButton}
      onClick={onClick}
    >
      <div className={styles.iconArea}>{icon}</div>
      <div className={styles.labelArea}>
        <Text size={200}>{label}</Text>
      </div>
    </Button>

  return (
    tipContent ?
    <Tooltip content={tipContent} relationship="description">
      {button}
    </Tooltip> :
    button
  );
};


