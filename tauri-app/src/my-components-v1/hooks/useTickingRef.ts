import { useEffect, useRef } from "react"

export const useTickingRef = () => {
  const tickingRef = useRef<boolean | null>();
  useEffect(() => {
    tickingRef.current = false;
    
    return () => {
      tickingRef.current = null
    }
  }, []);
  return tickingRef;
}