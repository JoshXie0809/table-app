export type RenderGridOptions = {
  overscan?: number;
  font?: string;
  paddingX?: number;
  showBorder?: boolean;
  borderColor?: string;
  textColor?: string;
};

export default function RenderColHeader({
  ctx,
  columnHeader,
  scrollLeft,
  cellWidth,
  cellHeight,
  canvasWidth,
  options = {},
}: {
  ctx: CanvasRenderingContext2D;
  columnHeader: string[];
  scrollLeft: number;
  cellWidth: number;
  cellHeight: number;
  canvasWidth: number;

  options?: RenderGridOptions;
}) {
  const {
    overscan = 1,
    font = "bold 14px system-ui, sans-serif",
    paddingX = 0,
    showBorder = true,
    borderColor = "#ddd",
    textColor = "#000",
  } = options;

  const dpr = window.devicePixelRatio || 1;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.font = font;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 1;


  const nCol = columnHeader.length;

  const startCol = Math.max(Math.floor(scrollLeft / cellWidth) - overscan, 0);
  const endCol = Math.min(Math.ceil((scrollLeft + canvasWidth) / cellWidth) + overscan, nCol);

  const cellTop = 0;

  for (let j = startCol; j < endCol; j++) {
    const cellLeft = (j + 1) * cellWidth - scrollLeft;
    // 背景
      ctx.fillStyle = "#f9f9f9";
      ctx.fillRect(cellLeft, cellTop, cellWidth, cellHeight);

    // 邊框
    if (showBorder) {
      ctx.strokeStyle = borderColor;
      ctx.strokeRect(cellLeft, cellTop, cellWidth, cellHeight);
    }

    // 文字
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";      // 水平置中（center of the x position）
    ctx.textBaseline = "middle";   // 垂直置中（center of the y position）
    const text = columnHeader[j] ?? "";
    ctx.fillText(text, paddingX + cellLeft + cellWidth / 2, cellTop + cellHeight / 2);
  }


  ctx.restore();
}
