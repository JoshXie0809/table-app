import React, { createContext, RefObject, useContext } from "react";
import { VirtualCells } from "../VirtualCells";
import { RManager, TransSystemName } from "./canvas-table-v1.1/RenderManager";
import { VManager } from "./canvas-table-v1.1/VirtualizationMangaer";

export type RefBundle = {
  vmRef: RefObject<VManager>;
  rmRef: RefObject<RManager>;
  vcRef: RefObject<VirtualCells>;
};


export interface SheetViewContextValue {
  containerRef: RefObject<HTMLDivElement>;
  vcRef: RefObject<VirtualCells>;
  registerRef: (key: string, refs: RefBundle) => void;
  unregisterRef: (key: string) => void;
  getRef: (key: string) => RefBundle | undefined;
  setRefOK: (key: string, ok?: boolean) => void;
  allRefOK: boolean,
}

export const SheetViewContext = createContext<SheetViewContextValue | null>(null);

export const useSheetView = () => {
  const ctx = useContext(SheetViewContext);
  if (!ctx) throw new Error("useSheetView must be used inside <SheetViewContext.Provider>");
  return ctx;
}

export const useCreateSheetViewContextValue = (
  vcRef: RefObject<VirtualCells>,
  containerRef: RefObject<HTMLDivElement>,
) => 
{
  const refMap = React.useRef(new Map<string, RefBundle>());
  const refOKMap = React.useRef(new Map<string, boolean>);
  const [allRefOK, setAllRefOK] = React.useState(false);

  const registerRef = (key: string, refs: RefBundle) => {
    refMap.current.set(key, refs);
    setRefOK(key, false);
    setAllRefOK(false);
  };

  const getRef = (key: string) => {
    return refMap.current.get(key);
  };

  const unregisterRef = (key: string) => {
    refMap.current.delete(key);
    refOKMap.current.delete(key);
  };

  const setRefOK = (key: string, ok: boolean = true) => {
    refOKMap.current.set(key, ok);
    if (isAllRefOK()) setAllRefOK(true);
  }

  const isAllRefOK = () => {
    for(const kv of refOKMap.current) {
      const ok: boolean = kv[1];
      if(!ok) return false;
    }

    return true;
  }

  const value: SheetViewContextValue = {
    vcRef,
    containerRef,
    getRef,
    unregisterRef,
    registerRef,
    setRefOK,
    allRefOK,
  };

  return value;
}

export const useRegisterSystemRef = (
  transSystemName: TransSystemName,
  refs: RefBundle
) => {
  const { registerRef, setRefOK, unregisterRef } = useSheetView();
  React.useEffect(() => {    
    registerRef(transSystemName, refs);
    setRefOK(transSystemName, true);
    return () => unregisterRef(transSystemName);
  }, [transSystemName, refs]);
};