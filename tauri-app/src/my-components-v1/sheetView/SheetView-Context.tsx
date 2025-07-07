import { createContext, RefObject, useContext } from "react";
import { VirtualCells } from "../VirtualCells";

export interface SheetViewContext {
  containerRef: RefObject<HTMLDivElement>,
  vcRef: RefObject<VirtualCells>,
}

export const SheetViewContext = createContext<SheetViewContext | null>(null);

export const useSheetView = () => {
  const ctx = useContext(SheetViewContext);
  if (!ctx) throw new Error("useSheetView must be used inside <SheetViewContext.Provider>");
  
  return ctx;
}