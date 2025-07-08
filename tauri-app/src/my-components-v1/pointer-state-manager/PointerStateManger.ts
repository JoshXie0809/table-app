import { throttle } from "lodash";
import { EventBus } from "../event-bus/EventBus";

export type PointerEventType =
  | "POINTER_DOWN"
  | "POINTER_MOVE"
  | "POINTER_UP"
  | "POINTER_CANCEL";

export type PointerState =
  | "idle"
  | "selecting"
  | "hovering"
  | "dragging";

const transitionTable: Record<PointerState, Partial<Record<PointerEventType, PointerState>>> = {
  idle: {
    POINTER_MOVE: "hovering",
    POINTER_DOWN: "selecting",
    POINTER_CANCEL: "idle",
  },

  selecting: {
    POINTER_MOVE: "dragging",
    POINTER_UP: "idle",
    POINTER_CANCEL: "idle",
  },
  
  hovering: {
    POINTER_DOWN: "selecting",
    POINTER_CANCEL: "idle",
    POINTER_MOVE: "hovering",
  },

  dragging: {
    POINTER_MOVE: "dragging",
    POINTER_UP: "idle",
    POINTER_CANCEL: "idle"
  }
}


export class PointerStateManager {
  private state: PointerState = "idle";
  private bus: EventBus;
  private target: EventTarget;

  private handlePointerDown = (e: Event) => {
    this.dispatch("POINTER_DOWN", e as PointerEvent);
  }
  private handlePointerMove = (e: Event) => {
    this.dispatch("POINTER_MOVE", e as PointerEvent);
  }
  private handlePointerUp = (e: Event) => {
    this.dispatch("POINTER_UP", e as PointerEvent);
  }
  
  private handlePointerCancel = (e: Event) => {
    this.dispatch("POINTER_CANCEL", e as PointerEvent);
  }

  constructor(bus: EventBus, target: EventTarget = window) {
    this.bus = bus;
    this.target = target;
    // 自動註冊事件監聽
    this.target.addEventListener("pointerdown", this.handlePointerDown);
    this.target.addEventListener("pointermove", this.handlePointerMove);
    this.target.addEventListener("pointerup", this.handlePointerUp);
    this.target.addEventListener("pointercancel", this.handlePointerCancel);

  }

  public getState() { return this.state; }

  public dispatch(eventType: PointerEventType, event: PointerEvent) 
  {
    const nextState = transitionTable[this.state]?.[eventType];

    if(nextState) {
      this.emitPointerActivity({state: nextState, event});
      
      if(nextState !== this.state) {
        const prev = this.state;
        this.state = nextState;

        this.bus.emit(
          "pointer:stateChange", 
          {from: prev, to: this.state, event}
        )
      }
    }
  }

  public destroy() {
    this.target.removeEventListener("pointerdown", this.handlePointerDown);
    this.target.removeEventListener("pointermove", this.handlePointerMove);
    this.target.removeEventListener("pointerup", this.handlePointerUp);
    this.target.removeEventListener("pointercancel", this.handlePointerCancel);
  }

  private emitPointerActivity = throttle((payload) => {
    this.bus.emit("pointer:activity", payload);
  }, Math.round(1000/60))

}