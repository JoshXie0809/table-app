import { forwardRef, RefObject, useImperativeHandle, useRef, useState } from "react";
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
    }), [isFocused]);

    if (!vc) return null;

      
  const handleKeyDown = () => {

    requestAnimationFrame(() => {
      const container = containerRef.current; // 從 props 傳入 containerRef
      const vc = vcRef.current
      const inputEl = inputRef.current;
      if (!container || !inputEl || !vc) return;

      const containerRect = container.getBoundingClientRect();
      const rect = inputEl.getBoundingClientRect();
      const HEADER_HEIGHT = Math.round(vc.cellHeight * 1.5);
      const offset = containerRect.top + HEADER_HEIGHT - rect.top;

      if (offset > 0) {
        container.scrollTop -= offset;
      }
    });
  };

    return (
      <Input
        placeholder="輸入"
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
    );
  }
);