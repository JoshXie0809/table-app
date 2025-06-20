import { ICellData } from "./ICellData";

export interface ICell {
    row: number;
    col: number;
    cellData: ICellData;
}

export interface IVirtualCells {
    readonly type: string;

    sheetName: string,

    cellsMap: Map<string, ICellData>;
    fields: Map<string, any>;
    
    sheetSize: {nRow: number, nCol:number};
    cellWidth: number;
    cellHeight: number;

    toKey: (row: number, col: number) => string | undefined;
    toRC:  (key: string) => { row: number, col: number } | undefined;

    setCellData: (cell:ICell) => void;
    setCellDataBoundaryCheck: (cell:ICell) => boolean;

    getCellData: (row: number, col: number) => ICellData | undefined;
    getCellDataBoundaryCheck: (row: number, col: number) => ICellData | null;

}