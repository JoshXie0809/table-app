import React from "react";
import { PointerState } from "../pointer-state-manager/PointerStateManger";

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
    state: PointerState;
    event: PointerEvent;
  };
}

type EventHandler<K extends keyof EventPayloadMap> = (payload: EventPayloadMap[K]) => void;

export interface EventBus {
  emit<K extends keyof EventPayloadMap>(
    event: K,
    payload: EventPayloadMap[K]
  ): void;

  on<K extends keyof EventPayloadMap>(
    event: K,
    handler: (payload: EventPayloadMap[K]) => void
  ): void;

  off<K extends keyof EventPayloadMap>(
    event: K,
    handler: (payload: EventPayloadMap[K]) => void
  ): void;
}

export class TypedEventBus {
  private listeners = new Map<keyof EventPayloadMap, Set<(payload: any) => void>>();

  emit<K extends keyof EventPayloadMap>(event: K, payload: EventPayloadMap[K]) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      (handler as EventHandler<K>)(payload);
    }
  }

  on<K extends keyof EventPayloadMap>(event: K, handler: EventHandler<K>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler as (payload: any) => void);
  }

  off<K extends keyof EventPayloadMap>(event: K, handler: EventHandler<K>) {
    this.listeners.get(event)?.delete(handler as (payload: any) => void);
  }
}


export const EventBus: EventBus = new TypedEventBus();

export function useRegisterToBus<K extends keyof EventPayloadMap>
  (eventType: K, handler: EventHandler<K>) 
{
  React.useEffect(() => {
    EventBus.on(eventType, handler);
    return () => {
      EventBus.off(eventType, handler);
    }
  }, [eventType, handler]);
}