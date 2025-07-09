import { fromEvent, Subject, merge, Subscription } from "rxjs";
import { map, throttleTime, debounceTime, distinctUntilChanged } from "rxjs/operators";

export type ScrollState = "scrolling";

// 滾動事件的 Payload 型別
export interface ScrollPayload {
  state: ScrollState;
  event: UIEvent;
  target: EventTarget;
}

// 觀察 scroll 的主 stream
export const scrolling$ = new Subject<ScrollPayload>();

// 滾動狀態（true/false）stream
export const isScrolling$ = merge(
  scrolling$.pipe(
    map(() => {
      // console.log("✅ isScrolling = true");
      return true;
    })
  ),
  scrolling$.pipe(
    debounceTime(100),
    map(() => {
      // console.log("🛑 isScrolling = false");
      return false;
    })
  )
).pipe(distinctUntilChanged());


// ScrollEventManager：綁定滾動事件、產生 scroll stream
export class ScrollEventManager {
  private target: EventTarget;
  private subscription: Subscription | null = null;

  constructor(target: EventTarget = window) {
    this.target = target;

    this.subscription = fromEvent<UIEvent>(this.target, "scroll").pipe(
      throttleTime(1000 / 120), // 最多 120fps
      map((event): ScrollPayload => ({
        state: "scrolling",
        event,
        target: this.target,
      }))
    ).subscribe(payload => {
      scrolling$.next(payload);
    });
  }

  destroy() {
    this.subscription?.unsubscribe();
  }
}
