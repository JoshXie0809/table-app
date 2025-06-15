import React, { useContext, useEffect, useState } from "react";
import { CanvasContext } from "../CanvasContext";
import ReactDOM from "react-dom";
import { Input } from "@fluentui/react-components";

import { FloatingInputPanel } from "../../../ProtalPanel";
import { throttle } from 'lodash';
import { getSheetPlugin } from "../../../sheet/SheetPluginSystem";



export const SystemQuickEdit: React.FC = () => {
  

  const {isReady, layoutEngine, containerRef} =  useContext(CanvasContext);
    // --- 內部狀態 ---
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCellValue, setEditingCellValue] = useState("");
  const [open, setOpen] = React.useState(false);
  

  
   // --- 邏輯：監聽clock事件來觸發編輯器 ---
  useEffect(() => {
    if (!isReady || !containerRef?.current || !layoutEngine) return;
    const container = containerRef.current;

    const cellType = layoutEngine.getSheet().type;
    const getCellNoCheck = getSheetPlugin(cellType)!.getCellNoCheck;

    const handleClick = throttle((event: MouseEvent) => {
      // 1. 獲取滑鼠在容器內的座標
      const rect = container.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;
      const cell = layoutEngine.getCellAtPoint(canvasX, canvasY);

      if (cell) {
        // 2. 從引擎獲取儲存格在「滾動容器內」的相對佈局
        setEditingCellValue(getCellNoCheck(layoutEngine.getSheet(), cell.row, cell.col).payload.value);
        const cellLayout = layoutEngine.getCellLayout(cell.row, cell.col);

        if (cellLayout) {
          // 3. 計算儲存格在「整個螢幕」上的絕對位置
          // 公式：容器的螢幕位置 + 儲存格在容器內的位置
          const {x, y} = cellLayout.position;
          const absoluteTop = rect.top + y;
          const absoluteLeft = rect.left + x;
          
          // 4. 更新狀態，準備顯示編輯框
          setPosition({ top: absoluteTop, left: absoluteLeft });
          setEditingCell( {row: cellLayout.rowIndex, col: cellLayout.colIndex} )
          setIsVisible(true);
        }
      }
    });

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [isReady, layoutEngine, containerRef]);


  // --- 監聽滾動事件來「同步位置」---
  useEffect(() => {
    if (!isVisible || !isReady || !containerRef?.current || !layoutEngine || !editingCell) {
      return;
    }

    const container = containerRef.current;
    let animationFrameId: number; // 用來儲存 requestAnimationFrame 的 ID

    const handleScroll = () => {
      // ✨ 優化點：取消上一個未執行的 frame，避免重複執行
      cancelAnimationFrame(animationFrameId);

      // ✨ 優化點：請求瀏覽器在下一次繪製時才執行更新
      animationFrameId = requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const cellLayout = layoutEngine.getCellLayout(editingCell.row, editingCell.col);

        if (cellLayout) {
          const { x, y } = cellLayout.position;
          const newTop = containerRect.top + y;
          const newLeft = containerRect.left + x;
          setPosition({ top: newTop, left: newLeft });
        } else {
          setIsVisible(false);
        }
      });
  };

  container.addEventListener('scroll', handleScroll, { passive: true }); // passive: true 告訴瀏覽器這個監聽器不會阻止滾動

  return () => {
    container.removeEventListener('scroll', handleScroll);
    cancelAnimationFrame(animationFrameId); // ✨ 組件卸載時，確保取消最後一個 frame
  };
}, [isVisible, editingCell]);

  // --- 渲染 ---

  
  
  if(!isReady || !layoutEngine || !containerRef) return null;
  // ✅ 如果可見，就使用 Portal 將我們的 JSX 「傳送」出去
  return ReactDOM.createPortal(
    // 這是我們要渲染的 JSX (編輯框)
    <div
      style={{
        position: 'fixed', // 使用 'fixed' 定位，其基準是整個瀏覽器視窗
          // ✅ 修正：明確設定基準點 (anchor point) 在畫面的左上角
        top: 0,
        left: 0,

        // 如果不可見，就什麼隱藏確保html物件存在
        display: isVisible ? 'block' : 'none',

        // ✨ 優化：基於 (0,0) 點進行位移，這部分由 GPU 加速，效能更好
        transform: `translate(${position.left}px, ${position.top}px)`,
        willChange: 'transform', // ✅ 提前 hint 瀏覽器為 transform 做 GPU buffer
        border: '0px solid #2196F3', // 藍色邊框
        backgroundColor: "white",
        boxSizing: "border-box",
        zIndex: 10,
      }}
    >
      <Input
        autoFocus // 自動聚焦
        appearance="underline"
        // onBlur={() => setIsVisible(false)}
        value={editingCellValue}
        onChange={e => setEditingCellValue(e.target.value)}
        style={{
          width: `${layoutEngine.getCellWidth()}px`,
          height: `${layoutEngine.getCellHeight()}px`,
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            console.log(editingCellValue)
            setIsVisible(false);
          } else if(e.key === 'Escape') {
            setIsVisible(false);
          }
        }}
        
      />

      
      <div>
        <button onClick={() => setOpen(true)}>
          open
        </button>
      </div>

      {open &&
        <FloatingInputPanel onClose={() => setOpen(false)} />
      }

    </div>,

    // 這是「傳送門」的出口，也就是我們在 index.html 中建立的 div
    document.getElementById('canvas-table-quickEdit-portal-root')!
  );
  
}