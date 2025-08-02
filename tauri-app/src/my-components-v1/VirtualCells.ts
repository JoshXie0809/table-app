import { getDisplayValue } from "../tauri-api/getDisplayValue";
import { CellContent } from "../tauri-api/types/CellContent";
import { CellMeta } from "../tauri-api/types/CellMeta";
import { CellMetaMap } from "../tauri-api/types/CellMetaMap";
import { DisplayCellResult } from "../tauri-api/types/DisplayCellResult";
import { ICell } from "../tauri-api/types/ICell";
import { IVirtualCells } from "./IVirtualCells";
import Ajv, { ErrorObject, ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";

export class VirtualCells implements IVirtualCells {
  cellsMap: Map<string, CellContent> = new Map();
  rowHeaderMap: Map<string, CellContent> = new Map(); 
  colHeaderMap: Map<string, CellContent> = new Map();
  cellMetaMap: Map<string, CellMeta | undefined>;
  validatorMap = new Map<string, ValidateFunction>();
  sheetPath: string;
  private ajv: Ajv;
  private dirtyCells: Set<string> = new Set();
  constructor(
    readonly sheetName: string,
    readonly gridType: string,
    readonly sheetSize: { nRow: number; nCol: number },
    readonly cellWidth: number,
    readonly cellHeight: number,
    cells: [string, CellContent][],
    rowHeader: [string, CellContent][],
    colHeader: [string, CellContent][],
    cellMetaMap: CellMetaMap,
    sheetPath: string,
  ) {
    this.sheetPath = sheetPath;
    cells.forEach(cell => this.cellsMap.set(cell[0], cell[1]));
    rowHeader.forEach(cell => this.rowHeaderMap.set(cell[0], cell[1]));
    colHeader.forEach(cell => this.colHeaderMap.set(cell[0], cell[1]));
    this.ajv = new Ajv;
    addFormats(this.ajv);
    this.cellMetaMap = new Map(Object.entries(cellMetaMap));
    this.cellMetaMap.forEach((v, k) => this.registerCellValidator(k, v?.cellSchema));
  }

  private registerCellValidator(cellType: string, schema: object | undefined) {
    if(schema === undefined) return;
    const validate = this.ajv.compile(schema);
    this.validatorMap.set(cellType, validate);
  }

  getCellValidator(cellType: string): ValidateFunction | undefined {
    return this.validatorMap.get(cellType);
  }

  toKey(row: number, col: number): string {
    return `${row},${col}`;
  }

  toRC(key: string): { row: number; col: number } {
    const [r, c] = key.split(',').map(Number);
    if (isNaN(r) || isNaN(c)) throw new Error(`Invalid key: ${key}`);
    return { row: r, col: c };
  }

  setCell(cell: ICell): void {
    this.setCellByCoord(cell.row, cell.col, cell.cellData);
  }

  setCellByCoord(row: number, col: number, cellContent: CellContent): void {
    this.cellsMap.set(this.toKey(row, col), cellContent);
  }
  setCellTypeByCoord(row: number, col: number, newType: string): void {
    let cell = this.getCell(row, col);
    if(cell === undefined) cell = this.getDefaultCell();
    if(cell === undefined) return;
    cell.type = newType;
    this.setCell({row, col, cellData: cell});
  }

  getCell(row: number, col: number): CellContent | undefined {
    return this.cellsMap.get(this.toKey(row, col));
  }

  getDefaultCell(cellType: string = "Text") :CellContent | undefined {
    const textCellMeta = this.cellMetaMap.get(cellType);
    if(textCellMeta === undefined) return undefined;
    return textCellMeta.defaultCellContent;
  }

  getCellDisplayValue(row: number, col: number): string | null {
    let cell = this.getCell(row, col);
    // 暫定邏輯 要改成去取得 textCell default value
    if (!cell) cell = this.getDefaultCell();
    // 如果 meta 出問題
    if (!cell) return ""

    // 檢查對應 plugin 是否含有 formatter
    // 沒有的話直接回傳 value 當作 displayvalue
    if( !this.hasCellFormatter(cell) )  return String(cell.payload.value);
    
    // 如果有 formatter
    // 檢查是否有 displayValue
    if(cell.payload.displayValue) return cell.payload.displayValue;
    // 如果沒有在 markdirty
    this.markDirty(row, col);
    return null;
  }

  getCellIsQuickEditable(row: number, col: number): boolean {
    let cell = this.getCell(row, col);
    if(cell === undefined) cell = this.getDefaultCell();
    // 如果預設出問題，設定不行
    if(cell === undefined) return false;
    const type = cell.type
    const meta = this.cellMetaMap.get(type);
    if(meta === undefined) return false
    const quickEdiable = meta.isQuickEditable;
    if(quickEdiable) return quickEdiable;
    return false;
  }

  hasCellFormatter(cell: CellContent | undefined) {
    if(!cell) return false;
    const type = cell.type;
    const cellMeta = this.cellMetaMap.get(type);
    if( !cellMeta ) return false;
    if( cellMeta.hasDisplayFormatter === null) return false;
    return cellMeta.hasDisplayFormatter;
  }

  getCellDisplayStyleClass(row: number, col: number): string {
    let cell = this.getCell(row, col);
    if(!cell) cell = this.getDefaultCell();
    if(!cell) return "";
    
    if(Object.hasOwn(cell.payload, "displayStyleClass")) {
      const styleClass = cell.payload.displayStyleClass!;
      return styleClass;
    }
    const type = cell.type;
    const cellMeta = this.cellMetaMap.get(type);
    if(!cellMeta) return ""
    if(cellMeta.displayStyleClass !== null) return cellMeta.displayStyleClass;
    return "";
  }

  hasCell(row: number, col: number): boolean {
    return this.cellsMap.has(this.toKey(row, col));
  }

  deleteCell(row: number, col: number): void {
    const key = this.toKey(row, col);
    this.cellsMap.delete(key);
    this.dirtyCells.delete(key);
  }

  markDirty(row: number, col: number): void {
    this.dirtyCells.add(this.toKey(row, col));
  }

  getDirtyKeys(): string[] {
    return [...this.dirtyCells];
  }

  clearDirty(): void {
    this.dirtyCells.clear();
  }

  getCellCurrnetType(row: number, col: number): string {
    let cell = this.getCell(row, col);
    if(cell === undefined) cell = this.getDefaultCell();
    if(cell === undefined) return "Text";
    const type: string = cell.type;
    return type;
  }

  getAllCellType(): string[] {
    const list = this.cellMetaMap.keys();
    const arr = Array.from(list);
    return arr.sort();
  }

  async requestDisplayValueAndUpdate() {
    const cells: ICell[] = []
    this.dirtyCells.forEach((v) => {
      const {row, col} = this.toRC(v);
      const cellData = this.getCell(row, col);
      if(!cellData) return;
      cells.push({row, col, cellData});
    })

    const res = await getDisplayValue({cells});
    if(!res.success) return;
    res.data!.forEach(d => this.applyDisplayResult(d))
  }
  
  private applyDisplayResult(result: DisplayCellResult): void {
    const { row, col, ok, displayValue, error } = result;
    const cell = this.getCell(row, col);
    if (!cell) return;

    cell.payload.displayValue = ok ? displayValue : error;
    this.setCell({ row, col, cellData: cell });
    this.dirtyCells.delete(this.toKey(row, col));
  }
}

export type setCellContentError = 
  | {errorType: "META_NOT_FOUND", type: string }
  | {errorType: "VALIDATOR_NOT_FOUND", type: string }
  | {errorType: "EXTRACT_PAYLOAD_VALUE_TYPE_FAILED", type: string}
  | {errorType: "CELL_VALIDATION_FAILED", type: string, errors: ErrorObject[] }

export type setCellContentOk = 
  | {okType: "GET_VALIDATOR", validator: ValidateFunction}

export type setCellContentResult = 
  | { success: true; ok?: setCellContentOk }
  | { success: false; error?: setCellContentError }

export function getCellContentValue(cell: CellContent) {
  return cell.payload.value;
}

export function setCellContentCellType(cell: CellContent, newCellType: string, vc: VirtualCells) 
{
  
}

export function setCellContentValue(cell: CellContent, newValue: string, vc: VirtualCells) : setCellContentResult
{
  const type = cell.type;
  // 取得 meta 
  const meta = vc.cellMetaMap.get(type);
  if(meta === undefined) return {success: false, error: {errorType: "META_NOT_FOUND", type}};
  const cellSchema = meta.cellSchema;
  const payloadValueType = __GetPayloadValueType(cellSchema);
  if(payloadValueType === undefined) 
    return {success: false, error: {errorType: "EXTRACT_PAYLOAD_VALUE_TYPE_FAILED", type}} 
  // convert value
  const nv = __ConvertStringToSchemaType(newValue, payloadValueType);
  // 修改值
  const oldValue = cell.payload.value;
  cell.payload.value = nv;
  // 檢查 newValue
  const validationResult = validateCellContent(cell, vc);
  // 沒通過檢查將值修改回來
  if(validationResult.success === false)
    cell.payload.value = oldValue;
  return validationResult;
}

export function validateCellContent(cell: CellContent, vc: VirtualCells) : setCellContentResult
{
  const type = cell.type;
  const getValidatorResult = __CellGetValidator(type, vc);
  if(getValidatorResult.success !== true || getValidatorResult.ok?.okType !== "GET_VALIDATOR") 
    return getValidatorResult;
  const validator = getValidatorResult.ok.validator;
  const validationResult = validator(cell);
  validator.errors
  if(!validationResult)
    return {
      success: false, 
      error: {
        errorType: "CELL_VALIDATION_FAILED", 
        type, 
        errors: validator.errors ?? [] 
      }
    };
  return {success: true}
}

function __CellGetValidator(type: string, vc: VirtualCells) : setCellContentResult
{
  const validator = vc.getCellValidator(type);
  if(validator === undefined) return {success: false, error: {errorType: "VALIDATOR_NOT_FOUND", type}};
  return {success: true, ok: {okType: "GET_VALIDATOR", validator}}
}

function __GetPayloadValueType(schema: any): string | undefined {
  const ref = schema?.properties?.payload?.$ref;
  if (typeof ref !== 'string') return;
  // 例如 "#/$defs/TextPayload" → "TextPayload"
  const defKey = ref.split('/').pop();
  if( defKey === undefined) return undefined;
  const valueType = schema?.$defs?.[defKey]?.properties?.value?.type;
  return valueType;
}

function __ConvertStringToSchemaType(value: string, type: string) 
{
  switch (type) {
    case "string": return value;
    case "number": return parseFloat(value);
    case "integer": return parseInt(value, 10);
    case "boolean": return value === "true";
    case "null": return null;
    default: return value;
  }
}