import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import {
  makeStyles,
  tokens,
  Portal,
  Button,
} from '@fluentui/react-components';

// --- 樣式定義 ---
const useStyles = makeStyles({
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 100,
  },
  // 修正後的 panel 樣式：只保留外觀，移除定位和尺寸
  panel: {
    // position, top, left, transform, width 都已移除
    height: '100%', // 讓 panel 高度填滿 Rnd 元件
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow64,
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box', // 確保 padding 不會影響整體尺寸計算
  },
  panelHeader: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightSemibold,
  },

  rnd: {
    zIndex: 101,
  }
});

interface FloatingInputPanelProps {
  onClose: () => void;
}

// --- 我們自訂的浮動面板元件 ---
export const FloatingInputPanel: React.FC<FloatingInputPanelProps> = ({ onClose }) => {
  const styles = useStyles();

  // 3. 計算初始狀態，讓面板出現在畫面中央
  const initialWidth = 600;
  const initialHeight = 400;
  const [state, setState] = useState({
    width: initialWidth,
    height: initialHeight,
    x: (window.innerWidth - initialWidth) / 2,
    y: (window.innerHeight - initialHeight) / 2,
  });

  const handleDragStop: RndDragCallback = (_e, d) => {
    setState((prevState) => ({ ...prevState, x: d.x, y: d.y }));
  };

  const handleResizeStop: RndResizeCallback = (
    _e,
    _direction,
    ref,
    _delta,
    position
  ) => {
    setState({
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
      ...position,
    });
  };

  return (
    <Portal>
      <div className={styles.backdrop} onClick={onClose} />
      <Rnd
        size={{ width: state.width, height: state.height }}
        position={{ x: state.x, y: state.y }}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        minWidth={300}
        minHeight={250}
        bounds="window" // 限制在視窗內拖曳
        dragHandleClassName={"draggable-title"} // 只有點擊標題才能拖曳
        className={styles.rnd}
      >

        <div className={styles.panel}>
          {/* title */}
          <div className= "draggable-title" 
            style={{cursor: "move", marginBottom: "24px"}}>
            <div className={styles.panelHeader}>
              登入
            </div>
          </div>  
          
          {/* content */}
          <div style={{flex: "1"}}>
            123
          </div>


          <div style={{display: "flex", justifyContent:"end"}} onClick={onClose}>
            <Button>離開</Button>
          </div>


        </div>
      </Rnd>
    </Portal>
  );
};