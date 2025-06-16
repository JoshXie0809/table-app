import { SheetPlugin, Sheet, defaultSheetCellWidth, defaultSheetCellHeight, defaultSheetOrder } from "./SheetPluginSystem";
import { Cell, createDefaultCell } from "../cell/cellPluginSystem";

// ArraySheet
// tpye: "ArraySheet"
// sheetName
// fields {
//   cellMatrix: Cell[][]
// }

export const ArraySheetPlugin: SheetPlugin = 
{
  type: "array" as const,

  checker(sheet: Sheet): boolean {
    if(sheet.type !== "array") return false;
    
    return true;
  },

  createSheet(
    nRow: number,
    nCol: number,
    sheetName?: string
  ): Sheet {

    if (!sheetName) sheetName = ""

    const rows: number[] = Array.from({length: nRow}, (_, i) => i);
    const cols: number[] = Array.from({length: nCol}, (_, i) => i);

    const columnHeader: string[] = cols.map((i) => `C${i}`)
    const rowHeader: string[] = rows.map((i) => `R${i}`)
    const cellMatrix: Cell[][] = rows.map((_) => {
      return cols.map((_) => {
        const _temp: Cell = createDefaultCell("Text");
        return _temp;
      })
    })

    return ({
      type: "array",
      sheetName,
      sheetCellWidth: defaultSheetCellWidth,
      sheetCellHeight: defaultSheetCellHeight,
      sheetOrder: defaultSheetOrder,
      fields: {
        columnHeader, 
        rowHeader,
        cellMatrix,
      },
      
    })
  },
  
  sheetSize(sheet: Sheet): [nRow: number, nCol: number] {
    if(!this.checker(sheet)) return [0, 0];
    return [sheet.fields.rowHeader.length, sheet.fields.columnHeader.length];
  },

  setCellBoundaryCheck(sheet: Sheet, row: number, col: number, newCell: Cell): boolean {
    const [nRow, nCol] = this.sheetSize(sheet);
    if(row < 0 || row >= nRow) return false;
    if(col < 0 || col >= nCol) return false;

    sheet.fields.cellMatrix[row][col] = newCell;
    return true;
  },


  setCellNoCheck(sheet: Sheet, row: number, col: number, newCell: Cell): void {
    sheet.fields.cellMatrix[row][col] = newCell;
  },


  getCellBoundaryCheck(sheet: Sheet, row: number, col: number): Cell | null {
    const [nRow, nCol] = this.sheetSize(sheet);

    if(row < 0 || row >= nRow) return null;
    if(col < 0 || col >= nCol) return null;

    return sheet.fields.cellMatrix[row][col];
  },

  getCellNoCheck(sheet: Sheet, row: number, col: number): Cell {
    return sheet.fields.cellMatrix[row][col];
  },

  getRowHeaderBoundaryCheck(sheet: Sheet, row: number): string | null {
    const [nRow, _nCol] = this.sheetSize(sheet);
    if(row < 0 || row >= nRow) return null;
    return sheet.fields.rowHeader[row];
  },

  getRowHeaderNoCheck(sheet: Sheet, row: number): string {
    return sheet.fields.rowHeader[row];
  },

  getColumnHeaderBoundaryCheck(sheet: Sheet, col: number): string | null {
    const [_nRow, nCol] = this.sheetSize(sheet);
    if(col < 0 || col >= nCol) return null;
    return sheet.fields.columnHeader[col];
  },

  getColumnHeaderNoCheck(sheet: Sheet, col: number): string {
    return sheet.fields.columnHeader[col];
  },

  customTools: {
    hello: () => "hello plugin "
  }
}