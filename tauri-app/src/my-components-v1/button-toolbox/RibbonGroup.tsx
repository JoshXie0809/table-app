import { Button, makeStyles, Slot, Text, tokens, Tooltip } from "@fluentui/react-components";
import React from "react";

const useStyles = makeStyles({
  group: {
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: "red",
  },
  gridArea: {
    display: "grid",
    gridAutoFlow: "column",
    gridTemplateRows: "repeat(3, auto)", // 每 column 固定 3 row
    gap: "4px 12px",
  },
  groupLabel: {
    marginTop: "6px",
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    textAlign: "center",
  },
  smallButton: {
    gridRow: "span 1",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start", // ✅ Fluent UI className 可以覆蓋內部 slot
    textAlign: "left",
  },

  smallButtonText: {},

  largeButton: {
    gridRow: "span 3",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // ✅ 全部靠左
    justifyContent: "flex-start",
    gap: "4px",
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
    width: "100%",
  },

});

export const RibbonGroup: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => {
  const styles = useStyles();
  return (
    <div className={styles.group}>
      <div className={styles.gridArea}>{children}</div>
      <Text className={styles.groupLabel} weight="semibold">{label}</Text>
    </div>
  );
};


export const RibbonSmallButton: React.FC<{
  icon: Slot<"span">;
  label: string;
  onClick?: () => void;
  tipContent?: string
}> = ({icon, label, onClick, tipContent }) => {
  const styles = useStyles();
  const button = 
    <Button
      onClick={onClick}
      appearance="subtle"
      icon={icon}
      className={styles.smallButtonText}
    >
      <Text size={200}>{label}</Text>
    </Button>;

  return (
    tipContent ? 
    
      <Tooltip content={tipContent} relationship="description">
        {button}
      </Tooltip>
    : button
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


