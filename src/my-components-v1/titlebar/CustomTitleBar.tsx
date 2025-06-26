// src/components/CustomTitleBar.tsx
import React from "react";
import { makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  titlebar: {
    height: "32px",
    WebkitAppRegion: "drag",                        // 拖曳區
    backgroundColor: "rgba(255, 255, 255, 0.65)",     // ✅ 半透明
    borderBottom: "1px solid rgba(255,255,255,0.15)",// ✅ 邊線強調區塊
    display: "flex",
    alignItems: "center",
    paddingInline: "12px",
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: "black",
  },
});

export const CustomTitleBar: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.titlebar}>
      <span className={styles.title}>My Tauri App</span>
    </div>
  );
};
