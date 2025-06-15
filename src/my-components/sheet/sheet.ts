// import { Cell, createDefaultCell } from "../cell/cellPluginSystem";

// // sheet
// // 1. column-header,
// // 2. row-header,
// // 3. matrix

// export type Sheet = {
//   columnHeader: string[],
//   rowHeader: string[],
//   cellMatrix: Cell[][],
//   sheetName: string,
//   sheetOrder: number,
//   sheetCellWidth: number,
//   sheetCellHeight: number,
// }

// interface createSheetProps {
//   nRow: number
//   nCol: number
//   sheetName?: string,
//   sheetOrder?: number,
//   sheetCellWidth?: number,
//   sheetCellHeight?: number,
// }


// export function sheetSize(sheet: Sheet) : [nRow: number, nCol: number] {
//   const nRow = sheet.rowHeader.length;
//   const nCol = sheet.columnHeader.length;

//   return [nRow, nCol]
// }

// export function createSheet (
//   {
//     nRow,
//     nCol,
//     sheetName = "",
//     sheetOrder = -1,
//     sheetCellWidth = 112,
//     sheetCellHeight = 44,
//   } : createSheetProps
// ) : Sheet
// {
//   const rows: number[] = Array.from({length: nRow}, (_, i) => i);
//   const cols: number[] = Array.from({length: nCol}, (_, i) => i);

//   const columnHeader = cols.map((i) => `C${i}`)
//   const rowHeader = rows.map((i) => `R${i}`)
//   const cellMatrix: Cell[][] = rows.map((_) => {
//     return cols.map((_) => {
//       const _temp: Cell = createDefaultCell("Text");
//       return _temp;
//     })
//   })

//   const sheet: Sheet = {
//     columnHeader,
//     rowHeader,
//     cellMatrix,
//     sheetName,
//     sheetOrder,
//     sheetCellWidth,
//     sheetCellHeight
//   }

//   return sheet;
// }

// export function getCellBoundaryCheck(sheet: Sheet, r: number, c:number) : null | Cell
// {
//   // boundery check
//   const size = sheetSize(sheet);
//   const nRow = size[0];
//   const nCol = size[1];
  
//   if ((r < 0) || (c < 0) || r >= nRow || c >= nCol )  
//     return null;

//   return sheet.cellMatrix[r][c];
// }

// export function getColumnHeaderBoundaryCheck(sheet: Sheet, c: number) {
//   // boundery check
//   const size = sheetSize(sheet);
//   const nCol = size[1];
//   if ( (c < 0) || c >= nCol )  
//     return null;

//   return sheet.columnHeader[c];
// }


// export function getRowHeaderBoundaryCheck(sheet: Sheet, r: number) {
//   // boundery check
//   const size = sheetSize(sheet);
//   const nRow = size[0];
//   if ( (r < 0) || r >= nRow )  
//     return null;
  
//   return sheet.rowHeader[r];
// }


// export function getCellNoCheck(sheet: Sheet, r: number, c:number)
// {
//   return sheet.cellMatrix[r][c];
// }

// export function getColumnHeaderNoCheck(sheet: Sheet, c: number) {
  
//   return sheet.columnHeader[c];
// }


// export function getRowHeaderNoCheck(sheet: Sheet, r: number) {
  
//   return sheet.rowHeader[r];
// }


// export function updateSheetCellMatrix(
//   sheet: Sheet,
//   cells: [r: number | null, c: number | null, newCell: Cell][]
// ) : Sheet
// {
//   const newSheet: Sheet = { ...sheet, cellMatrix: [...sheet.cellMatrix] };
//   const [nR, nC] = sheetSize(newSheet);

//   cells.forEach(cell => {
//     const r = cell[0];
//     const c = cell[1];
//     const newCell = cell[2];

//     if(r === null && c === null) {
//       for(let i = 0; i < nR; i++) 
//         for(let j = 0; j < nC; j++) 
//           newSheet.cellMatrix[i][j] = structuredClone(newCell);
//     } else 
//     if(c === null) {
//       const newRow = [...newSheet.cellMatrix[r!]];
//       for(let j = 0; j < nC; j++)
//         newRow[j] = structuredClone(newCell);
//       newSheet.cellMatrix[r!] = newRow;

//     } else 
//     if(r === null) {
//       for(let i = 0; i < nR; i++) {
//         const newRow = [...newSheet.cellMatrix[i]];
//         newRow[c!] = structuredClone(newCell);
//         newSheet.cellMatrix[i] = newRow;
//       }

//     } else 
//     if((r !== null && c !== null)){
//       const newRow = [...newSheet.cellMatrix[r]];
//       newRow[c] = structuredClone(newCell);
//       newSheet.cellMatrix[r] = newRow;
//     }
//   })

//   return newSheet;
// }