import { useEffect } from "react";
import { throttledPointerActivity$ } from "../../../pointer-state-manager/PointerStateManger";
import { filter, Subject } from "rxjs";
import { useInputCell } from "./useInputCell";
import { findTransSystemElement } from "../toolfunction";
import { useTransformInputCell } from "./useTransfromInputCell";
import { rc$, useInputCellStateManager } from "./useInputCellStateManager";

export const target$ = new Subject<{target: HTMLElement | null}>();
export const SystemQuickEdit = () => {
  // 註冊 target$ stream 給後續使用
  useEffect(() => {
    const pressing$ = throttledPointerActivity$.pipe(
      filter(({event}) => event.pointerType === 'mouse' ? event.button === 0 : true)
    );
    const sub = pressing$.subscribe((payload) => {
      if(payload.state !== "pressing") return;
      const {clientX, clientY} = payload.event;
      const hoveredElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const target = findTransSystemElement(hoveredElement)
      target$.next({target});
    });
    return () => sub.unsubscribe();
  }, [])
  // 每次載入將 input cell 位置設為 null
  rc$.next({row: null, col: null});
  // 將編輯的的 Input 先掛到 container 上
  const { divRef, inputCellRef } = useInputCell();
  // 移動編輯框的功能
  useTransformInputCell(divRef);
  // 管理編輯框狀態的功能
  useInputCellStateManager(divRef, inputCellRef)
  
  return null;
}