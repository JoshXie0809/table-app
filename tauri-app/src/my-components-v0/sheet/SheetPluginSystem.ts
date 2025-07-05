import { Cell } from "../cell/cellPluginSystem";

export const defaultSheetCellHeight = 44;
export const defaultSheetCellWidth = 112;
export const defaultSheetOrder = -111;


export interface Sheet {
  readonly type: string;
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

  setCellBoundaryCheck(sheet: Sheet, row: number, col: number, newCell: Cell): boolean;
  setCellNoCheck(sheet: Sheet, row: number, col: number, newCell: Cell): void;

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

export const SheetPluginDefalutTool = {

  updateSheetData(
    sheet: Sheet, 
    cells: [r: number | null, c: number | null, newCell: Cell][],

  ): Sheet {

    const plugin = getSheetPlugin(sheet.type)!;
    const newSheet: Sheet = {...sheet};

    const [nR, nC] = plugin.sheetSize(newSheet);

    cells.forEach(cell => {
      const r = cell[0];
      const c = cell[1];
      const newCell = cell[2];

      if(r === null && c === null) {
        for(let i = 0; i < nR; i++) 
          for(let j = 0; j < nC; j++) 
            plugin.setCellNoCheck(newSheet, i, j, structuredClone(newCell))     
          
      } else 
      if(c === null && r !== null && (r >= 0 && r < nR)) {
        for(let j = 0; j < nC; j++) 
          plugin.setCellNoCheck(newSheet, r, j, structuredClone(newCell)) 
        

      } else 
      if(r === null && c!== null && (c >= 0 && c < nC)) {
        for(let i = 0; i < nR; i++) 
          plugin.setCellNoCheck(newSheet, i, c, structuredClone(newCell)) 
        

      } else 
      if((r !== null && c !== null))
        plugin.setCellNoCheck(newSheet, r, c, structuredClone(newCell)) 
    })

    return newSheet;

  }

  
}
