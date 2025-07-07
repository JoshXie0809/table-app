export type PointerEventType = "pointerdown" | "pointermove" | "pointerup";
export type PointerEventHandler = (e: PointerEvent) => void;

type Mode = "idle" | "hovering" | "dragging" | "resizing" | "selecting";

export class PointerManager {
  private listeners: Record<PointerEventType, Set<PointerEventHandler>> = {
    pointerdown: new Set(),
    pointermove: new Set(),
    pointerup: new Set(),
  };

  private ticking: Record<PointerEventType, boolean> = {
    pointerdown: false,
    pointermove: false,
    pointerup: false,
  };

  private lastEvent: Partial<Record<PointerEventType, PointerEvent>> = {};

  private pointerState = {
    x: 0,
    y: 0,
    target: null as EventTarget | null,
    mode: "idle" as Mode,
  };

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("pointerdown", (e) => this.handle("pointerdown", e));
      window.addEventListener("pointermove", (e) => this.handle("pointermove", e));
      window.addEventListener("pointerup", (e) => this.handle("pointerup", e));
    }
  }

  private handle(type: PointerEventType, e: PointerEvent) {
    this.pointerState.x = e.clientX;
    this.pointerState.y = e.clientY;
    this.pointerState.target = e.target;

    this.lastEvent[type] = e;

    if (!this.ticking[type]) {
      this.ticking[type] = true;

      requestAnimationFrame(() => {
        const evt = this.lastEvent[type];
        if (evt) {
          for (const handler of this.listeners[type]) {
            handler(evt);
          }
        }
        this.ticking[type] = false;
        this.lastEvent[type] = undefined;
      });
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

  setMode(mode: Mode) {
    this.pointerState.mode = mode;
  }
}

export const pointerManager = new PointerManager();
