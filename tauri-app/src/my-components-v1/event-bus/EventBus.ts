export type EventType = 
  "pointer:stateChange" |
  "pointer:activity"


export interface EventBus {
  emit(eventType: EventType, payload: any): void;
}


export const EventBus: EventBus = {
  emit(eventType, payload) {
    switch(eventType) {
      case "pointer:activity":
        console.log(payload);
        break;
      
      case "pointer:stateChange":
        const { from, to, event } = payload;
        console.log(`[EventBus] pointer state: ${from} → ${to}`, event);
        break;
    }


  }
};


