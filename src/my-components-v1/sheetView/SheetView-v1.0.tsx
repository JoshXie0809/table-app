import React from "react";

import { useVirtualCells, UseVirtualCellsOptions } from "../hooks/useVirtualCell";

export interface SheetViewProps {
  options: UseVirtualCellsOptions;
}

export const SheetView11: React.FC<SheetViewProps> = ({
  options
}) =>
{
  const virtualCells = useVirtualCells(options);
  console.log(virtualCells)
  return null;
}