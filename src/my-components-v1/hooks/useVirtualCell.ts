import { useCallback, useEffect, useMemo, useState } from "react";
import { ICellData } from "../ICellData";
import { ICell, IVirtualCells } from "../IVirtualCells";


const _toKey = (row: number, col: number) => `${row},${col}`;

const _toRC = (key: string): {row: number, col: number} | undefined => {
    const parts = key.split(',');
    if (parts.length !== 2) return undefined;

    const row = parseInt(parts[0], 10);
    const col = parseInt(parts[1], 10);
    
    if (isNaN(row) || isNaN(col)) return undefined;
    
    return { row, col };
}


// ----------------------------------------------------
// Hook 的選項介面
// ----------------------------------------------------

export interface UseVirtualCellsOptions {
    iType: string;
    iSheetName: string;
    iRowCount: number;
    iColCount: number;
    iCellWidth: number;
    iCellHeight: number;
    iCells?: ICell[]; // 可選的初始 Cell 數據陣列
}


export const useVirtualCells = (options: UseVirtualCellsOptions ) => {
    const { iType, iSheetName, iCellHeight, iCellWidth, iCells, iRowCount, iColCount } = options;
    

    // ------------------------------------
    // State 管理 (使用 useState)
    // ------------------------------------

    // 儲存核心 Cell 數據的 Map
     // 儲存核心 Cell 數據的 Map
    const [cellsMap, setCellsMap] = useState<Map<string, ICellData>>(() => {
        const initialMap = new Map<string, ICellData>();
        if (iCells) {
            iCells.forEach(
                cell => initialMap.set(_toKey(cell.row, cell.col), cell.cellData
            ));
        }
        return initialMap;
    });

    // 暫時擱置 後面更新
    const [fields, _setFields]  = useState<Map<string, any>>(() => {
        const initFields = new Map<string, any>()
        return initFields;
    });

    const [sheetSize, setSheetSize] = useState({ nRow: iRowCount, nCol: iColCount });
    const [cellWidth, setCellWidth] = useState(iCellWidth);
    const [cellHeight, setCellHeight] = useState(iCellHeight);
    const [sheetName, setSheetName] = useState(iSheetName)


    useEffect(() => {
        const map = new Map<string, ICellData>();
        iCells?.forEach(cell => map.set(_toKey(cell.row, cell.col), cell.cellData));
        setCellsMap(map);
        setSheetSize({ nRow: iRowCount, nCol: iColCount });
        setCellWidth(iCellWidth);
        setCellHeight(iCellHeight);
        setSheetName(iSheetName);
    }, [iCells, iRowCount, iColCount, iCellWidth, iCellHeight, iSheetName])


    const toKey = useMemo(() => _toKey, []);
    const toRC = useMemo(() => _toRC, []);


    // 設定 Cell 數據
    const setCellData = useCallback((cell: ICell): void => {
        setCellsMap(prevMap => {
            const newMap = new Map(prevMap); // 創建新 Map 實例以觸發 React 狀態更新
            newMap.set(toKey(cell.row, cell.col), cell.cellData);
            return newMap;
        });
        // 這裡通常還會觸發一個向後端持久化的請求，但這部分邏輯會放在使用 Hook 的組件中
        // 或由另一個 Hook / 服務處理
    }, [toKey]); // 依賴 toKey 函式

    const setCellDataBoundaryCheck = useCallback((cell: ICell): boolean => {
        if (cell.row >= 0 && cell.row < sheetSize.nRow &&
            cell.col >= 0 && cell.col < sheetSize.nCol) {
            setCellData(cell);
            return true;
        }
        console.warn(`Attempted to set cell data out of bounds: (${cell.row}, ${cell.col})`);
        return false;
    }, [setCellData, sheetSize]); // 依賴 setCellData 和 sheetSize


    // 獲取 Cell 數據
    const getCellData = useCallback((row: number, col: number): ICellData | undefined => {
        return cellsMap.get(toKey(row, col));
    }, [cellsMap, toKey]); // 依賴 cellsMap 和 toKey

    // 獲取 Cell 數據並檢查邊界
    const getCellDataBoundaryCheck = useCallback((row: number, col: number): ICellData | null => {
        if (row >= 0 && row < sheetSize.nRow &&
            col >= 0 && col < sheetSize.nCol) {
            return getCellData(row, col) || null; // 如果 Map 中沒有該鍵，回傳 undefined，轉為 null
        }
        return null; // 超出邊界
    }, [getCellData, sheetSize]);


    const virtualCellsInstance = useMemo<IVirtualCells>(() => ({
        type: iType,
        sheetName,
        cellsMap,
        fields,
        sheetSize,
        cellWidth,
        cellHeight,
        toKey,
        toRC,
        setCellData,
        setCellDataBoundaryCheck,
        getCellData,
        getCellDataBoundaryCheck,
    }), [
        iType, cellsMap, sheetSize, toKey, toRC, // 依賴所有被 Hook 捕獲的變數和方法
        sheetName, fields,
        cellWidth, cellHeight,
        setCellData, setCellDataBoundaryCheck, 
        getCellData, getCellDataBoundaryCheck
    ]);

    return virtualCellsInstance;

}