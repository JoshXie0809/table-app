import { createContext, RefObject } from "react";
import { CanvasLayoutEngine } from "./cavas-layout-engine/CanvasLayoutEngine";


// 定義共享內容的型別
export interface ICanvasContext {
  isReady: boolean; // 標誌，表示 ref 是否都已掛載完畢
  layoutEngine: CanvasLayoutEngine | null;
  containerRef: RefObject<HTMLDivElement> | null;
  mainCanvasRef: RefObject<HTMLCanvasElement> | null;
  hoverCanvasRef: RefObject<HTMLCanvasElement> | null;
}

// 建立 Context，並提供一個預設值
export const CanvasContext = createContext<ICanvasContext>({
  isReady: false,
  layoutEngine: null,
  containerRef: null,
  mainCanvasRef: null,
  hoverCanvasRef: null,
});