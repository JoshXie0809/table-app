import { createContext, RefObject, useContext } from "react";
import { VirtualCells } from "../VirtualCells";
import { RManager } from "./canvas-table-v1.1/RenderManager";
import { VManager } from "./canvas-table-v1.1/VirtualizationMangaer";

export type RefBundle = {
  vmRef: RefObject<VManager>;
  rmRef: RefObject<RManager>;
  vcRef: RefObject<VirtualCells>;
};


export interface SheetViewContextValue {
  containerRef: RefObject<HTMLDivElement>,
  vcRef: RefObject<VirtualCells>,
  registerRef: (key: string, refs: RefBundle) => void;
  getRef: (key: string) => RefBundle | undefined
}

export const SheetViewContext = createContext<SheetViewContextValue | null>(null);

export const useSheetView = () => {
  const ctx = useContext(SheetViewContext);
  if (!ctx) throw new Error("useSheetView must be used inside <SheetViewContext.Provider>");
  
  return ctx;
}