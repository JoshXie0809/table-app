import { BehaviorSubject, Subject } from "rxjs";
import { throttleTime } from "rxjs/operators";

// === 定義狀態與事件 ===
export type PointerEventType =
  | "POINTER_DOWN"
  | "POINTER_MOVE"
  | "POINTER_UP"
  | "POINTER_CANCEL";

export type PointerState =
  | "idle"
  | "pressing"
  | "selecting"
  | "hovering"
  | "dragging";

const transitionTable: Record<
  PointerState,
  Partial<Record<PointerEventType, PointerState>>
> = {
  idle: {
    POINTER_MOVE: "hovering",
    POINTER_DOWN: "pressing",
    POINTER_CANCEL: "idle",
  },

  pressing: {
    POINTER_UP: "selecting",
    POINTER_MOVE: "dragging",
    POINTER_CANCEL: "idle",
  },
  selecting: {
    POINTER_DOWN: "pressing",
    POINTER_MOVE: "idle",
    POINTER_CANCEL: "idle",
  },
  hovering: {
    POINTER_DOWN: "pressing",
    POINTER_CANCEL: "idle",
    POINTER_MOVE: "hovering",
  },
  dragging: {
    POINTER_MOVE: "dragging",
    POINTER_UP: "idle",
    POINTER_CANCEL: "idle",
  },
};

// === RxJS Streams ===
export const pointerState$ = new BehaviorSubject<PointerState>("idle");

export const pointerActivity$ = new Subject<{
  state: PointerState;
  event: PointerEvent;
}>();

export const throttledPointerActivity$ = pointerActivity$.pipe(
  throttleTime(Math.round(1000 / 120), undefined, { leading: true, trailing: true })
);

// === Pointer 管理器 ===
export class PointerStateManager {
  private state: PointerState = "idle";
  private target: EventTarget;

  constructor(target: EventTarget = window) {
    this.target = target;

    this.target.addEventListener("pointerdown", this.handlePointerDown);
    this.target.addEventListener("pointermove", this.handlePointerMove);
    this.target.addEventListener("pointerup", this.handlePointerUp);
    this.target.addEventListener("pointercancel", this.handlePointerCancel);
  }

  public destroy() {
    this.target.removeEventListener("pointerdown", this.handlePointerDown);
    this.target.removeEventListener("pointermove", this.handlePointerMove);
    this.target.removeEventListener("pointerup", this.handlePointerUp);
    this.target.removeEventListener("pointercancel", this.handlePointerCancel);
  }

  private handlePointerDown = (e: Event) =>
    this.dispatch("POINTER_DOWN", e as PointerEvent);
  private handlePointerMove = (e: Event) =>
    this.dispatch("POINTER_MOVE", e as PointerEvent);
  private handlePointerUp = (e: Event) =>
    this.dispatch("POINTER_UP", e as PointerEvent);
  private handlePointerCancel = (e: Event) =>
    this.dispatch("POINTER_CANCEL", e as PointerEvent);

  private dispatch(eventType: PointerEventType, event: PointerEvent) {
    const nextState = transitionTable[this.state]?.[eventType];

    if (nextState) {
      pointerActivity$.next({ state: nextState, event });
      if (nextState !== this.state) {
        this.state = nextState;
        pointerState$.next(this.state);
      }
    }
  }
}


