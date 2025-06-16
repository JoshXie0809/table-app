// import { useEffect } from "react";
// import { Sheet } from "../../sheet/sheet-old";
// import { SheetVirtualTableImpl } from "../sheet-virtual-table/SheetVirtualTable";

// export function useVirtualTableRenderer({
//   sheet,
//   virtualTable,
//   canvas,
//   container,
//   drawFn
// }: {
//   sheet: Sheet;
//   virtualTable: SheetVirtualTableImpl;
//   canvas: HTMLCanvasElement | null;
//   container: HTMLDivElement | null;
//   drawFn: () => void;
// }) {
//   useEffect(() => {
//     if (virtualTable.sheet !== sheet) {
//       virtualTable.setSheet(sheet); // ✅ 更新資料
//     }
    
//     if (canvas && container) {
//       requestAnimationFrame(drawFn);      // ✅ 重繪畫面
//     }
//   }, [sheet, canvas, container, drawFn, virtualTable]);
// }