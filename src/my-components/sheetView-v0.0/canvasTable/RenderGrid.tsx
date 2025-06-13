import { getCellRenderer } from "../../cell/cellPluginSystem";
import { getCellBoundaryCheck, Sheet, sheetSize } from "../../sheet/sheet";
// import { DirtyCells } from "../SheetView";

export type RenderGridOptions = {
  overscan?: number;
  font?: string;
  paddingX?: number;
  showBorder?: boolean;
  borderColor?: string;
  textColor?: string;
};


export default function RenderGrid({
  ctx,
  sheet,
  scrollLeft,
  scrollTop,
  cellWidth,
  cellHeight,
  canvasWidth,
  canvasHeight,
  // dirtyCells,
  options = {},
} : {
  ctx: CanvasRenderingContext2D;
  sheet: Sheet;
  scrollLeft: number;
  scrollTop: number;
  cellWidth: number;
  cellHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  // dirtyCells: DirtyCells;
  options?: RenderGridOptions;
}) {

  const {
    overscan = 0,
    font = "14px system-ui, sans-serif",
    paddingX = 12,
    showBorder = true,
    borderColor = "#ddd",
    textColor = "#000",
  } = options;

  const dpr = window.devicePixelRatio || 1;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  // ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  const size = sheetSize(sheet);
  const nRow = size[0];
  const nCol = size[1];

  const startRow = Math.max(Math.floor(scrollTop / cellHeight) - overscan, 0);
  const endRow = Math.min(Math.ceil((scrollTop + canvasHeight) / cellHeight) + overscan, nRow);

  const startCol = Math.max(Math.floor(scrollLeft / cellWidth) - overscan, 0);
  const endCol = Math.min(Math.ceil((scrollLeft + canvasWidth) / cellWidth) + overscan, nCol);

  for (let i = startRow; i < endRow; i++) {
    const cellTop = (i+1) * cellHeight - scrollTop;

    for (let j = startCol; j < endCol; j++) {
      const cellLeft = (j+1) * cellWidth - scrollLeft;

      // 背景
      ctx.fillStyle = i % 2 === 0 ? "#fff" : "#f9f9f9";
      ctx.fillRect(cellLeft, cellTop, cellWidth, cellHeight);

      // 邊框
      if (showBorder) {
        ctx.strokeStyle = borderColor;
        ctx.strokeRect(cellLeft, cellTop, cellWidth, cellHeight);
      }

      // 文字
      // from sheet
      let cell = getCellBoundaryCheck(sheet, i, j);
      if (cell === null) return;
      
      // // dirty
      // let dirtyCell = dirtyCells.get(`r${i}c${j}`);
      // if(dirtyCell) // not null
      //     cell = dirtyCell;

      let renderer = getCellRenderer(cell.type);
      if (renderer)
        renderer
        (ctx, cell, cellLeft, cellTop, cellWidth, cellHeight, 
            { ...options, paddingX: paddingX, font: font, textColor: textColor, }
        );
    }
  }

  ctx.restore();
}
