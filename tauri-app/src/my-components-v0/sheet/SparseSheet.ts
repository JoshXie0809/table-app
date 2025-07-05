import { SheetPlugin, Sheet, defaultSheetCellWidth, defaultSheetCellHeight, defaultSheetOrder } from "./SheetPluginSystem";
import { Cell, createDefaultCell } from "../cell/cellPluginSystem";
import { create } from "lodash";

// ArraySheet
// tpye: "ArraySheet"
// sheetName
// fields {
//   CellData: Map<string, Cell>
// }

export const SparseSheetPlugin: SheetPlugin = 
{
  type: "sparse" as const,

  checker(sheet: Sheet): boolean {
    if(sheet.type !== "sparse") return false; 
    return true;
  },

  createSheet(
    nRow: number,
    nCol: number,
    sheetName?: string
  ): Sheet {

    if (!sheetName) sheetName = ""

    const CellData = new Map<string, Cell>();

    return ({
      type: "sparse",
      sheetName,
      sheetCellWidth: defaultSheetCellWidth,
      sheetCellHeight: defaultSheetCellHeight,
      sheetOrder: defaultSheetOrder,
      fields: {
        sheetSize: {nRow, nCol},
        CellData
      },
    })
  },
  
  customTools: {
    toKey(row: number, col: number): string {
      return `r${row}c${col}`;
    },

    fromKey(key: string): { row: number, col: number } | null {
      const match = key.match(/^r(\d+)c(\d+)$/);
      if (!match) return null;

      return {
        row: parseInt(match[1], 10),
        col: parseInt(match[2], 10),
      };
    }


  },

  sheetSize(sheet: Sheet): [nRow: number, nCol: number] {
    if(!this.checker(sheet)) return [0, 0];
    const {nRow, nCol} = sheet.fields.sheetSize;
    return [nRow, nCol];
  },

  setCellBoundaryCheck(sheet: Sheet, row: number, col: number, newCell: Cell): boolean {
    const [nRow, nCol] = this.sheetSize(sheet);
    if(row < 0 || row >= nRow) return false;
    if(col < 0 || col >= nCol) return false;

    const key: string = this.customTools!.toKey(row, col);
    sheet.fields.CellData.set(key, newCell);
    return true;
  },


  setCellNoCheck(sheet: Sheet, row: number, col: number, newCell: Cell): void {
    const key: string = this.customTools!.toKey(row, col);
    sheet.fields.CellData.set(key, newCell);
  },


  getCellBoundaryCheck(sheet: Sheet, row: number, col: number): Cell | null {
    const [nRow, nCol] = this.sheetSize(sheet);
    if(row < 0 || row >= nRow) return null;
    if(col < 0 || col >= nCol) return null;

    const key: string = this.customTools!.toKey(row, col);
    if(!sheet.fields.CellData.has(key)) return createDefaultCell("Text");
    return sheet.fields.CellData.get(key)! as Cell
  },

  getCellNoCheck(sheet: Sheet, row: number, col: number): Cell {
    const key: string = this.customTools!.toKey(row, col);
    if(!sheet.fields.CellData.has(key)) return createDefaultCell("Text");
    return sheet.fields.CellData.get(key)! as Cell

  },

  getRowHeaderBoundaryCheck(sheet: Sheet, row: number): string | null {
    const [nRow, _nCol] = this.sheetSize(sheet);
    if(row < 0 || row >= nRow) return null;
    return `R${row}`
  },

  getRowHeaderNoCheck(_sheet: Sheet, row: number): string {
    return `R${row}`
  },

  getColumnHeaderBoundaryCheck(sheet: Sheet, col: number): string | null {
    const [_nRow, nCol] = this.sheetSize(sheet);
    if(col < 0 || col >= nCol) return null;
    return `C${col}`
  },

  getColumnHeaderNoCheck(_sheet: Sheet, col: number): string {
    return `C${col}`
  },

}