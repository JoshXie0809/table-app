import { BehaviorSubject } from "rxjs";
import { Temporal } from "@js-temporal/polyfill";

// 使用 Temporal 取得現在的 zoned datetime（附帶時區）
const getCurrentTime = () => Temporal.Now.instant();

// ✅ 全域唯一的時間資料流（型別為 Temporal.ZonedDateTime）
const nowTime$ = new BehaviorSubject(getCurrentTime());

// 啟動唯一的時間更新計時器
let started = false;
const startClock = () => {
  if (started) return;
  started = true;

  setInterval(() => {
    nowTime$.next(getCurrentTime());
  }, 1000);
};
startClock();

// ✅ 提供給 React `useSyncExternalStore` 的 subscribe 函數
export const subscribe = (callback: () => void) => {
  const sub = nowTime$.subscribe(callback);
  return () => sub.unsubscribe();
};

// ✅ 提供快照函數（React 呼叫）
export const getNow = () => nowTime$.getValue();

// 如需 RxJS 操作，可 export
export { nowTime$ };
