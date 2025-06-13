import { getCellRenderer } from "../../../cell/cellPluginSystem";
import { SheetVirtualTableImpl } from "../../sheet-virtual-table/SheetVirtualTable";

export function drawGrid(
  ctx: CanvasRenderingContext2D, 
  opts: {
    virtualTable: SheetVirtualTableImpl;
    container: HTMLDivElement;
    canvas: HTMLCanvasElement;
    cellWidth: number;
    cellHeight: number;
    dpr: number;
}) 
{
  const { virtualTable, container, canvas, cellWidth, cellHeight, dpr } = opts;
  
  const ctxWidth = canvas.width / dpr;
  const ctxHeight = canvas.height / dpr;
  
  const scrollLeft = container.scrollLeft;
  const scrollTop = container.scrollTop;

  virtualTable.updateVisibleRange(scrollLeft, scrollTop, ctxWidth, ctxHeight);

  const visibleData = virtualTable.getVisibleData();
  const visibleRange = virtualTable.visibleRange;

  const rowOffset = scrollTop % cellHeight;
  const colOffset = scrollLeft % cellWidth;

  const font = "14px system-ui, sans-serif";
  const paddingX = 12;
  const showBorder = true;
  const borderColor = "#ddd";
  const textColor = "#000";

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  // ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  
  for (let i = 0; i < visibleData.length; i++) {
    const cellTop = (i+1) * cellHeight - rowOffset;

    for (let j = 0; j < visibleData[i].length; j++) {
      const cellLeft = (j+1) * cellWidth - colOffset;
      const cell = visibleData[i][j];

      ctx.fillStyle = (visibleRange.startRow + i) % 2 === 0 ? "#fff" : "#f9f9f9";
      ctx.fillRect(cellLeft, cellTop, cellWidth, cellHeight);

      if (showBorder) {
        ctx.strokeStyle = borderColor;
        ctx.strokeRect(cellLeft, cellTop, cellWidth, cellHeight);
      }

      const renderer = getCellRenderer(cell.type);
      if (renderer) {
        renderer(ctx, cell, cellLeft, cellTop, cellWidth, cellHeight, {
          paddingX,
          font,
          textColor,
        });
      }
    }
  }

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.font = font;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 1;

  const VisibleColumnHeaders = virtualTable.getVisibleColumnHeader();
  for(let j = 0; j < VisibleColumnHeaders.length; j++) {
    const cellLeft = (j + 1) * cellWidth - colOffset;
    // 背景
      ctx.fillStyle = "#f9f9f9";
      ctx.fillRect(cellLeft, 0, cellWidth, cellHeight);

    // 邊框
    if (showBorder) {
      ctx.strokeStyle = borderColor;
      ctx.strokeRect(cellLeft, 0, cellWidth, cellHeight);
    }

    // 文字
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";      // 水平置中（center of the x position）
    ctx.textBaseline = "middle";   // 垂直置中（center of the y position）
    ctx.font = "bold 14px system-ui, sans-serif";
    
    ctx.fillText(VisibleColumnHeaders[j], paddingX + cellLeft + cellWidth / 2, 0 + cellHeight / 2);
  }

  ctx.font = font;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 1;

  const VisibleRowHeaders = virtualTable.getVisibleRowHeader();
  for(let i = 0; i < VisibleRowHeaders.length; i++) {
    const cellTop = (i + 1) * cellHeight - rowOffset;
    // 背景
    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, cellTop, cellWidth, cellHeight);

    // 邊框
    if (showBorder) {
      ctx.strokeStyle = borderColor;
      ctx.strokeRect(0, cellTop, cellWidth, cellHeight);
    }

    // 文字
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";      // 水平置中（center of the x position）
    ctx.textBaseline = "middle";   // 垂直置中（center of the y position）
    ctx.font = "bold 14px system-ui, sans-serif";
    
    ctx.fillText(VisibleRowHeaders[i],  cellWidth / 2, cellTop + cellHeight / 2);
  }

  ctx.fillStyle = "#f9f9f9";
  ctx.fillRect(0, 0, cellWidth, cellHeight);

  ctx.strokeStyle = borderColor;
  ctx.strokeRect(0, 0, cellWidth, cellHeight);
  ctx.restore();
};


