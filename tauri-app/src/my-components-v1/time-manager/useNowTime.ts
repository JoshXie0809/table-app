// useNowTime.ts
import { useSyncExternalStore } from "react";
import { subscribe, getNow } from "./TimeManager";

// ✅ 自訂 Hook：不建立 state、不需要 Provider，最輕量
export const useNowTime = () => {
  return useSyncExternalStore(subscribe, getNow, getNow); // getNow 第三參數為 SSR fallback
};
