// components/LoadingOverlay.tsx
import React from "react";
import { Spinner, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.16)", // 灰色半透明背景
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none", // 不阻擋滑鼠操作
    transition: "opacity 0.3s ease-in-out",
    opacity: 1,

},
  hidden: {
    opacity: 0,
  },
});

export const LoadingOverlay: React.FC<{ active: boolean }> = ({ active }) => {
  const styles = useStyles();
  return (
    <div className={`${styles.overlay} ${!active ? styles.hidden : ""}`}>
      <Spinner label="Loading..." size="medium" />
    </div>
  );
};
