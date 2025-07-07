import { useRef } from "react"

export const useTickingRef = () => {
  const tickingRef = useRef<boolean>(false);
  return tickingRef;
}