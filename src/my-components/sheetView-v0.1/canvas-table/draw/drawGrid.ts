import { getCellRenderer } from "../../../cell/cellPluginSystem";
import { getCellNoCheck, getColumnHeaderNoCheck, getRowHeaderNoCheck, Sheet } from "../../../sheet/sheet";
import { CanvasLayout } from "../cavas-layout-engine/CanvasLayoutEngine";

export function drawGrid(
  ctx: CanvasRenderingContext2D, 
  layout: CanvasLayout,
  sheet: Sheet,
  dpr: number,
) 
{

  const font = "14px system-ui, sans-serif";
  const paddingX = 12;
  const showBorder = true;
  const borderColor = "#ddd";
  const textColor = "#000";

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // 文字
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";      // 水平置中（center of the x position）
  ctx.textBaseline = "middle";   // 垂直置中（center of the y position）
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.strokeStyle = borderColor;

  for(let i = 0; i < layout.visibleCells.length; i++) {
    const row = layout.visibleCells[i];

    for(let j of row) {
      const r = j.rowIndex;
      const c = j.colIndex;

      const cell = getCellNoCheck(sheet, r, c);
      const renderer = getCellRenderer(cell.type);

      let {x, y, w, h} = j.position
      
      //  背景
      ctx.fillStyle = r % 2 === 0 ? "#fff" : "#f9f9f9";
      ctx.fillRect(x, y, w, h);

      // 邊框
      if (showBorder) 
        ctx.strokeRect(x, y, w, h);

      if (renderer) 
        renderer(ctx, cell, x, y, w, h, {
          paddingX,
          font,
          textColor,
      });
    }
  }
  
  ctx.save();
  ctx.textAlign = "center";     
  ctx.textBaseline = "middle";  
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.strokeStyle = borderColor;

  for(let j of layout.visibleColumnHeaders) {
    let {x, y, w, h} = j.position
    // 背景
    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(x, y, w, h);

    // 邊框
    if (showBorder) 
      ctx.strokeRect(x, y, w, h);
    
    let str = getColumnHeaderNoCheck(sheet, j.index)
    ctx.fillStyle = textColor;
    ctx.fillText(str, x + w / 2, y + h / 2);
  }

  ctx.save();
  for(let i of layout.visibleRowHeaders) {
    let {x, y, w, h} = i.position
    // 背景
    ctx.fillStyle = i.index % 2 === 0 ? "#fff" : "#f9f9f9";
    ctx.fillRect(x, y, w, h);

    // 邊框
    if (showBorder) 
      ctx.strokeRect(x, y, w, h);
    
    let str = getRowHeaderNoCheck(sheet, i.index)
    ctx.fillStyle = textColor;
    ctx.fillText(str, x + w / 2, y + h / 2);
  }

  ctx.save();

  ctx.fillStyle = "#f9f9f9";
  let {x, y, w, h} = layout.Null.position

  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  ctx.save();
  ctx.restore();

};


