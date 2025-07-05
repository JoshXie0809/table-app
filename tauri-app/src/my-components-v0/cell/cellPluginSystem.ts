export interface BasePayload {
  value: any,
  label?: string,
  [key: string]: any
}

export interface Cell {
  type: string;
  payload: BasePayload;
}

// --- Pluging: Cell 註冊表
export interface CellPlugin {
  type: string;

  render: (
    ctx: CanvasRenderingContext2D,
    cell: Cell,
    x: number, // cell 左上角的座標 x
    y: number, // cell 左上角的座標 y
    w: number, // width
    h: number, // height
    options?: { [key: string]: any},
  ) => void;  

  getDefaultPayload: () => BasePayload;
  // 你也可以加 editor, validator, formatFn 等

}

const cellPluginRegistry = new Map<string, CellPlugin>();

export function registerCellPlugin (
  plugin: CellPlugin,
  options: { override?: boolean } = {}
) {

  if (cellPluginRegistry.has(plugin.type) && !options.override)
    throw new Error(`type '${plugin.type}' already registered.`);
    // 確認是否誤寫
  
  cellPluginRegistry.set(plugin.type, plugin);  
}

export function getCellPlugin(type: string): CellPlugin | undefined {
  return cellPluginRegistry.get(type);
}

export function getCellRenderer (type: string) {
  return cellPluginRegistry.get(type)?.render;
}

export function listRegisteredCellTypes(): string[] {
  return Array.from(cellPluginRegistry.keys());
}

export function createDefaultCell(type: string): Cell {
  const plugin = cellPluginRegistry.get(type);
  if (!plugin) {
    throw new Error(`Unknown cell type '${type}'`);
  }

  return {
    type,
    payload: plugin.getDefaultPayload()
  };
}

export function clearRegistryCellPlugin() {
  cellPluginRegistry.clear();
}