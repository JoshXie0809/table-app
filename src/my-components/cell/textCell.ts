import {
  CellPlugin,
  BasePayload,
} from "./cellPluginSystem"


export const TextCellPlugin: CellPlugin = {
  type: "Text",

  getDefaultPayload: (): BasePayload => ({
    value: "",
    label: "",
  }),

  render: (ctx, cell, x, y, _w, h, options) => {
    if (cell.type === "Text") {

      let str = String(cell.payload.value ?? "");
      if (str.length > 6) str = str.slice(0, 6) + "..";

      let paddingX = options?.paddingX ?? 4;

      // 🔥 關鍵：文字樣式設定一定要放 plugin 裡
      ctx.fillStyle = options?.textColor ?? "#000";
      ctx.font = options?.font ?? "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      ctx.fillText(str, x + paddingX, y + h / 2);

    } 
    else
      throw new Error(`this cell type:${cell.type} is not Text!`);

  }

}
