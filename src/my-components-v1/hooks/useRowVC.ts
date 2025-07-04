import { RefObject, useRef } from "react";
import { VirtualCells } from "../VirtualCells";
import { createRowVC } from "../createVirtualCells";

export function useRowVC(mainVCRef: RefObject<VirtualCells | null>) {
  const rowVCRef = useRef<VirtualCells | null>(null);

  if (!rowVCRef.current && mainVCRef.current) {
    rowVCRef.current = createRowVC(mainVCRef.current);
  }

  return rowVCRef;
}
