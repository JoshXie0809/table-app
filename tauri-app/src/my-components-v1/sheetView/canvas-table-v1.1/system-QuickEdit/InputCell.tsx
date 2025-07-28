import React, { forwardRef, RefObject, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { VirtualCells } from "../../../VirtualCells";
import { Button, Input, tokens } from "@fluentui/react-components";
import { SettingsRegular} from "@fluentui/react-icons";

export interface QuickEditInputCellProps {
  vcRef: RefObject<VirtualCells>
  containerRef: RefObject<HTMLElement>
}

export interface QuickEditInputCellHandle {
  focus: () => void;
  blur: () => void;
  isFocused: boolean;
  getInputElement: () => HTMLInputElement | null;
  setQuickEditInputCellValue: React.Dispatch<React.SetStateAction<string>>
  setQuickEditable: React.Dispatch<React.SetStateAction<boolean>>
  latestValueRef: RefObject<string>;
}

export const QuickEditInputCell = forwardRef<QuickEditInputCellHandle, QuickEditInputCellProps>(
  ({ containerRef, vcRef }, ref) => {
    const vc = vcRef.current;
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [quiclEditable, setQuickEditable] = useState(false);
    const [quickEditInputCellValue, setQuickEditInputCellValue] = useState("");
    const latestValueRef = useRef("");

    useEffect(() => {
      latestValueRef.current = quickEditInputCellValue;
    }, [quickEditInputCellValue])

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      isFocused,
      getInputElement: () => inputRef.current,
      setQuickEditInputCellValue,
      setQuickEditable,
      latestValueRef,
    }), [isFocused]);
    if (!vc) return null;

    const handleKeyDown = () => {
      requestAnimationFrame(() => {
        const container = containerRef.current;
        const vc = vcRef.current;
        const inputEl = inputRef.current;
        if (!container || !inputEl || !vc) return;

        const containerRect = container.getBoundingClientRect();
        const inputRect = inputEl.getBoundingClientRect();

        const headerHeight = Math.round(vc.cellHeight) +2;
        const headerWidth = Math.round(vc.cellWidth) +2;

        const cond1 = (inputRect.top < containerRect.top + headerHeight);
        const cond2 = (inputRect.left < containerRect.left + headerWidth)
        const isCoveredByHeader =  cond1 || cond2;
        if (!isCoveredByHeader) return;

        if(cond1) {
          const offsetY = containerRect.top + headerHeight - inputRect.top;
          container.scrollTop -= offsetY;
        }
        
        if(cond2) {
          const offsetX = containerRect.left + headerWidth - inputRect.left;
          container.scrollLeft -= offsetX;
        }
      
      });
    };

    const sizerRef = useRef<HTMLSpanElement>(null);
    const [inputWidth, setInputWidth] = useState<string | number>('auto');

     // 使用 useLayoutEffect 能確保在瀏覽器繪製前完成寬度測量和設定，避免畫面閃爍
    useLayoutEffect(() => {
      if (sizerRef.current) {
        // 測量 sizer span 的寬度
        const newWidth = sizerRef.current.getBoundingClientRect().width;
        // 加上一個小小的緩衝空間 (約等於左右 padding)，讓文字不會緊貼邊緣
        setInputWidth(newWidth + 52); 
      }
    }, [quickEditInputCellValue]); // 每當 value 改變時，就重新執行此 effect

    return (
      <div data-zone = "system-quick-edit" tabIndex={0}>
        <Input 
          id="system-quick-edit-cell"
          data-zone = "system-quick-edit-inputcell"
          disabled={!quiclEditable}
          placeholder="輸入"
          autoComplete="on"
          value={quickEditInputCellValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuickEditInputCellValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="none"
          contentAfter={
            <Button 
              data-zone="system-quick-edit-setting"
              icon={<SettingsRegular />} 
              onClick={() => {
                console.log("fffji")
              }}
              appearance="transparent"
            />
          }
          style={{
            height: `${Math.round(vc.cellHeight)}px`,
            minWidth: `${Math.round(vc.cellWidth)}px`,
            width: inputWidth,
            display: "flex",
            border: "1px solid rgb(96, 151, 96)",
            boxShadow: tokens.shadow2,
            boxSizing: "border-box",
            backgroundColor: tokens.colorNeutralBackground1,
          }}
          input={{ref: inputRef}}
        />

        <span ref={sizerRef} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          height: 0,
          overflow: 'hidden',
          whiteSpace: 'pre', // "pre" 可以保留空格，使測量更精確
          fontFamily: tokens.fontFamilyBase,
          fontSize: tokens.fontSizeBase300,
          fontWeight: tokens.fontWeightRegular,
          lineHeight: tokens.lineHeightBase300,
          paddingLeft: tokens.spacingHorizontalM,
        }}>
          {/* 如果 input 是空的，我們用 placeholder 來決定最小寬度 */}
          {quickEditInputCellValue}
        </span>
      </div>
    );
  }
);