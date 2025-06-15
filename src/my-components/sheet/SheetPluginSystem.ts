import { Cell } from "../cell/cellPluginSystem";

export const defaultSheetCellHeight = 44;
export const defaultSheetCellWidth = 112;
export const defaultSheetOrder = -111;


export interface Sheet {
  type: string;
  sheetName: string;

  fields: { [key: string]: any };

  sheetOrder: number;
  sheetCellWidth: number;
  sheetCellHeight: number;

}

export interface SheetPlugin {
  readonly type: string;

  checker(sheet: Sheet): boolean,

  createSheet(
    nRow: number,
    nCol: number,
    sheetName?: string
  ): Sheet;

  sheetSize(sheet: Sheet): [nRow: number, nCol: number];

  getCellBoundaryCheck(sheet: Sheet, row: number, col: number): Cell | null;
  getCellNoCheck(sheet: Sheet, row: number, col: number): Cell;

  getRowHeaderBoundaryCheck(sheet: Sheet, row: number): string | null;
  getRowHeaderNoCheck(sheet: Sheet, row: number): string;

  getColumnHeaderBoundaryCheck(sheet: Sheet, col: number): string | null;
  getColumnHeaderNoCheck(sheet: Sheet, col: number): string;

  customTools?: {
    [tool: string]: any
  };
}



const SheetPluginRegistry = new Map<string, SheetPlugin>();

export const registerSheetPlugin = (
  plugin: SheetPlugin,
  options: { override?: boolean } = {}
) => {
  if(SheetPluginRegistry.has(plugin.type) && !options.override)
    throw new Error(`type '${plugin.type}' already registered.`);

  SheetPluginRegistry.set(plugin.type, plugin);
}

export const clearRegistrySheetPlugin = () => {
  SheetPluginRegistry.clear();
}

export const getSheetPlugin = (type: string): SheetPlugin | undefined => 
{
  return SheetPluginRegistry.get(type);
}


export function listRegisteredSheetTypes(): string[] {
  return Array.from(SheetPluginRegistry.keys());
}


// get-Custom-Tool
export function CTool(
  plugin: SheetPlugin | undefined,
  tool: string
): any | undefined {
  return plugin?.customTools?.[tool];
}