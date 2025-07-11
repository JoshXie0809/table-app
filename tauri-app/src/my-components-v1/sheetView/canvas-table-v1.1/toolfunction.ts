import { TransSystemName } from "./RenderManager";

export function findTransSystemElement(el: HTMLElement | null): HTMLElement | null {
  while (el) {
    if (el.dataset?.transSystem) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

// 計算 cell 元素在當前 scrollTop, scrollLeft 的相對位置
export function getCellPositionOnMainContainer(
  el: HTMLElement, 
  scrollTop: number, scrollLeft: number,
  rowHeight: number, cellWidth: number
) {
  const transSystemName = el.dataset.transSystem as TransSystemName;
  const transX = Number(el.dataset.transX);
  const transY = Number(el.dataset.transY);

  let paddingX = 0;
  let paddingY = 0;
  let x = 0;
  let y = 0;

  if(transSystemName === "cells") {
    paddingX = cellWidth;
    paddingY = rowHeight;
    x = transX + paddingX - scrollLeft;
    y = transY + paddingY - scrollTop;
  } 
  else 
  if(transSystemName === "column-header") {
    paddingX = cellWidth;
    y = 0;
    x = transX + paddingX - scrollLeft;
  }
  else
  if(transSystemName === "row-header") {
    paddingY = rowHeight;
    x = 0;
    y = transY + paddingY - scrollTop;
  }
  else
  if(transSystemName === "tlc") {
    x = 0;
    y = 0;
  }


  return {x, y};

}