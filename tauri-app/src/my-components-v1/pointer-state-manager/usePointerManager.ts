import { useEffect, useState } from "react";
import { Subscription } from "rxjs";
import { pointerState$ } from "./PointerStateManger";

export function usePointerState() {

  const [state, setState] = useState(() => pointerState$.getValue());

  useEffect(() => {
    const sub: Subscription = pointerState$.subscribe(setState);
    return () => sub.unsubscribe();
  }, []);

  return state;
}
