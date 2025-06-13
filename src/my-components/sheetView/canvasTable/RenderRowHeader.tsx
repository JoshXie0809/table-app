import { getRowHeaderBoundaryCheck, Sheet, sheetSize } from "../../sheet/sheet";
import { RenderGridOptions} from "./RenderGrid";



export default function RenderRowHeader ({
  ctx,
  sheet,
  scrollTop,
  cellWidth,
  cellHeight,
  canvasHeight,
  options = {},
}: {
  ctx: CanvasRenderingContext2D;
  sheet: Sheet;
  scrollTop: number;
  cellWidth: number;
  cellHeight: number;
  canvasHeight: number;
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

  const nRow = sheetSize(sheet)[0];

  const startRow = Math.max(Math.floor(scrollTop / cellHeight) - overscan, 0);
  const endRow = Math.min(Math.ceil((scrollTop + canvasHeight) / cellHeight) + overscan, nRow);


  for (let i = startRow; i < endRow; i++) {
    const cellTop = (i+1) * cellHeight - scrollTop;
    const cellLeft = 0;
    // 背景
    ctx.fillStyle = i % 2 === 0 ? "#fff" : "#f9f9f9";
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
    
    const text = getRowHeaderBoundaryCheck(sheet, i);
    if (text === null) return;

    ctx.fillText(text, cellLeft + paddingX + cellWidth / 2, cellTop + cellHeight / 2);

  }

  ctx.restore();
}
