import React, {useEffect, useRef} from "react";

const SimpleCanvasTable: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const cellWidth = 100;
  const cellHeight = 40;
  const rows = 200;
  const cols = 50;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;


    // 初始繪製
    drawVisibleCells(ctx, 0, 0);
  }, []);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!container || !ctx) return;

    // console.log("scroll!", container.scrollTop, container.scrollLeft);


    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    drawVisibleCells(ctx, scrollTop, scrollLeft);
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      style={{ width: "calc(100%)", height: "calc(100%)", overflow: "auto" }}
    >
      <canvas
        ref={canvasRef}
        width={cols * cellWidth + 2}
        height={rows * cellHeight + 2}
        style={{ display: "block" }}
      />
    </div>
  );
};



function drawVisibleCells(ctx: CanvasRenderingContext2D, scrollTop: number, scrollLeft: number) {
  const cellWidth = 100;
  const cellHeight = 40;
  const rows = 200;
  const cols = 50;

  const canvas = ctx.canvas;

  const viewWidth = canvas.parentElement?.clientWidth  || canvas.width;
  const viewHeight = canvas.parentElement?.clientHeight || canvas.height;

  const startRow = Math.floor(scrollTop / cellHeight);
  const endRow = Math.min(rows, Math.ceil((scrollTop + viewHeight) / cellHeight));
  const startCol = Math.floor(scrollLeft / cellWidth);
  const endCol = Math.min(cols, Math.ceil((scrollLeft + viewWidth) / cellWidth));

  ctx.clearRect(startCol * cellWidth, startRow * cellHeight, endCol * cellWidth, endRow * cellHeight);
  

  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      // 正確的計算方式
      const x = col * cellWidth;
      const y = row * cellHeight;

      // 畫格線
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(x, y, cellWidth, cellHeight);

      // 畫資料
      ctx.fillStyle = "#000";
      ctx.fillText(`${(row + col) % 31 === 0 ? "⚡⚡" : ""}`, x + cellWidth / 2, y + cellHeight / 2);
    }
  }
}


export default SimpleCanvasTable;