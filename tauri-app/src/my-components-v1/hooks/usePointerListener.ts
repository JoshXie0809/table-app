// hooks/usePointerListener.ts
import { useEffect } from "react";
import { PointerEventHandler, PointerEventType, pointerManager } from "../pointer-manager/PointerManger";

export function usePointerListener(type: PointerEventType, handler: PointerEventHandler) {
  useEffect(() => {
    pointerManager.on(type, handler);
    return () => {
      pointerManager.off(type, handler);
    };
  }, [type, handler]);
}
