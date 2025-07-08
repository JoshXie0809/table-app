import React from "react";
import { PointerState } from "../pointer-state-manager/PointerStateManger";
import { ScrollState } from "../scroll-manager/ScrollManager";

export type EventType =
  | "pointer:stateChange"
  | "pointer:activity"
  | "scroll:scrolling";

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
  "scroll:scrolling": {
    state: ScrollState;
    event: UIEvent;
    target: EventTarget;  
  }
}

type EventHandler<K extends keyof EventPayloadMap> = (payload: EventPayloadMap[K]) => void | Promise<void>;

export interface EventBus {
  emit<K extends keyof EventPayloadMap>(
    event: K,
    payload: EventPayloadMap[K]
  ): Promise<void>;

  on<K extends keyof EventPayloadMap>(
    event: K,
    handler: EventHandler<K>
  ): void;

  off<K extends keyof EventPayloadMap>(
    event: K,
    handler: EventHandler<K>
  ): void;
}

export class TypedEventBus implements EventBus {
  private listeners = new Map<keyof EventPayloadMap, Set<(payload: any) => void>>();

  async emit<K extends keyof EventPayloadMap>(event: K, payload: EventPayloadMap[K]): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    const promises: Promise<void>[] = [];

    for (const handler of handlers) {
      const result = (handler as EventHandler<K>)(payload);
      promises.push(Promise.resolve(result));
    }

    await Promise.all(promises);
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