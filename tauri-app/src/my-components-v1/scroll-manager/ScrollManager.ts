import { throttle } from "lodash";
import { EventBus } from "../event-bus/EventBus";

export type ScrollState = "scrolling";

export class ScrollEventManager {
  private bus: EventBus;
  private target: EventTarget;

  constructor(bus: EventBus, target: EventTarget = window) {
    this.bus = bus;
    this.target = target;
    this.target.addEventListener("scroll", this.emitScroll);
  }

  private emitScroll = throttle((e: Event) => {
    this.bus.emit("scroll:scrolling", {
      state: "scrolling",
      event: e as UIEvent,
      target: this.target,
    })
  }, Math.round(1000 / 360));

  public destroy() {
    this.target.removeEventListener("scroll", this.emitScroll);
  }
}