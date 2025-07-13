import React, { forwardRef, RefObject, useImperativeHandle, useRef, useState } from "react";
import { VirtualCells } from "../../../VirtualCells";
import { Input, tokens } from "@fluentui/react-components";


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
}

export const QuickEditInputCell = forwardRef<QuickEditInputCellHandle, QuickEditInputCellProps>(
  ({ containerRef, vcRef }, ref) => {
    const vc = vcRef.current;
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [quickEditInputCellValue, setQuickEditInputCellValue] = useState("");

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      isFocused,
      getInputElement: () => inputRef.current,
      setQuickEditInputCellValue: setQuickEditInputCellValue,
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

    return (
      <div data-zone = "system-quick-edit">
        <Input 
          id="system-quick-edit-cell"
          placeholder="輸入"
          autoComplete="on"
          value={quickEditInputCellValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuickEditInputCellValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            height: `${Math.round(vc.cellHeight)}px`,
            width: `${Math.round(vc.cellWidth)}px`,
            borderRadius: "0px",
            border: "1px solid rgb(96, 151, 96)",
            boxShadow: tokens.shadow2,
            boxSizing: "border-box",
          }}
          input={{ref: inputRef}}
        />
      </div>
    );

  }
);