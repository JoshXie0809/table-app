import { fromEvent, BehaviorSubject } from "rxjs";
import { throttleTime, map } from "rxjs/operators";
import { debounceTime, startWith } from "rxjs/operators";
export type ScrollState = "scrolling";

// 可被外部觀察的 stream
export const scrolling$ = new BehaviorSubject<{ state: ScrollState, event: UIEvent, target: EventTarget } | null>(null);

export class ScrollEventManager {
  private target: EventTarget;
  private subscription: any;

  constructor(target: EventTarget = window) {
    this.target = target;

    this.subscription = fromEvent<UIEvent>(this.target, "scroll").pipe(
      throttleTime(Math.round(1000 / 120)), // 控制最大觸發頻率為 120fps
      map((event): { state: ScrollState, event: UIEvent, target: EventTarget } => ({
        state: "scrolling",
        event,
        target: this.target
      }))
    ).subscribe(payload => {
      scrolling$.next(payload); // 僅推送狀態，如果你需要完整 payload 也可以改寫
    });
  }

  destroy() {
    this.subscription.unsubscribe();
  }
}


export const isScrolling$ = scrolling$.pipe(
  startWith(null),
  map(() => true),
  debounceTime(50),
  map(() => false)
);
