import { PointerEventType, PointerState } from "../pointer-state-manager/PointerStateManger";

export type EventType = 
  | "pointer:stateChange"
  | "pointer:activity";

export interface EventPayloadMap {
  "pointer:stateChange": {
    from: PointerState;
    to: PointerState;
    event: PointerEvent;
  };
  "pointer:activity": {
    state: PointerEventType;
    event: PointerEvent;
  };
}

export interface EventBus {
  emit<K extends keyof EventPayloadMap>(
    event: K,
    payload: EventPayloadMap[K]
  ): void;
}


export const EventBus: EventBus = {
  emit(eventType, payload) {
    if(eventType === "pointer:activity") {
      console.log(payload)
    } else
    if(eventType === "pointer:stateChange") {
      const { from, to, event } = payload as EventPayloadMap["pointer:stateChange"];
      console.log(`[EventBus] pointer state: ${from} → ${to}`, event);
    }
  }
};


