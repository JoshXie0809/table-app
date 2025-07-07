export type PointerEventType = "pointerdown" | "pointermove" | "pointerup";
export type PointerEventHandler = (e: PointerEvent) => void;

export interface ListenMap {
  pointerdown: Set<PointerEventHandler>
  pointerup: Set<PointerEventHandler>
  pointermove: Set<PointerEventHandler>
}

export class PointerManager {
  private listeners: ListenMap = {
    pointerdown: new Set(),
    pointerup: new Set(),
    pointermove: new Set(),
  }

  private pointerState = {
    x: 0,
    y: 0,
    target: null as EventTarget | null,
    mode: "idle" as "idle" | "dragging" | "resizing" | "hovering" | "selecting"
  };

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("pointerdown", e => this.handle("pointerdown", e));
      window.addEventListener("pointermove", e => this.handle("pointermove", e));
      window.addEventListener("pointerup", e => this.handle("pointerup", e));
    }
  }


  private handle(type: PointerEventType, e: PointerEvent) {
    this.pointerState.x = e.clientX;
    this.pointerState.y = e.clientY;
    this.pointerState.target = e.target;

    for (const handler of this.listeners[type]) {
      handler(e);
    }
  }

  on(type: PointerEventType, handler: PointerEventHandler) {
    this.listeners[type].add(handler);
  }

  off(type: PointerEventType, handler: PointerEventHandler) {
    this.listeners[type].delete(handler);
  }

  getState() {
    return this.pointerState;
  }

  setMode(mode: typeof this.pointerState.mode) {
    this.pointerState.mode = mode;
  }
}


export const pointerManager = new PointerManager();
