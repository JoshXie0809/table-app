import { RefObject, useRef } from "react";
import { VirtualCells } from "../VirtualCells";
import { createHeaderVC, HeaderType } from "../createVirtualCells";

export function useHeaderVC(headerType: HeaderType, mainVCRef: RefObject<VirtualCells | null>) {
  const VCRef = useRef<VirtualCells | null>(null);

  if (!VCRef.current && mainVCRef.current) {
    VCRef.current = createHeaderVC(headerType, mainVCRef.current);
  }

  return VCRef;
}
