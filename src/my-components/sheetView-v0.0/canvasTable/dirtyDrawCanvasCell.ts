import { Cell, getCellRenderer } from "../../cell/cellPluginSystem";
import { RenderGridOptions } from "./RenderGrid";

export function dirtyDrawCanvasCell ({
  ctx,
  cell,
  cellLeft,
  cellTop,
  cellWidth,
  cellHeight,
  row,
  
  options = {},
} : {
  ctx: CanvasRenderingContext2D;
  cell: Cell,
  cellLeft: number,
  cellTop: number,
  cellWidth: number;
  cellHeight: number;
  row: number,

  options?: RenderGridOptions;
}) 
{
  const {
    font = "14px system-ui, sans-serif",
    paddingX = 12,
    showBorder = true,
    borderColor = "#ddd",
    textColor = "#000",
  } = options;

  // 背景
  ctx.fillStyle = row % 2 === 0 ? "#fff" : "#f9f9f9";
  ctx.fillRect(cellLeft, cellTop, cellWidth, cellHeight);

  // 邊框
  if (showBorder) {
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(cellLeft, cellTop, cellWidth, cellHeight);
  }

  // 文字
  let renderer = getCellRenderer(cell.type);
  if (renderer)
  renderer
  (ctx, cell, cellLeft, cellTop, cellWidth, cellHeight, 
    { paddingX: paddingX, font: font, textColor: textColor }
  );
}