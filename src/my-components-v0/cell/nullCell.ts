import {
  CellPlugin,
  BasePayload,
} from "./cellPluginSystem"


export const NullCellPlugin: CellPlugin = {
  type: "Null",

  getDefaultPayload: (): BasePayload => ({
      value: "",
      label: "",
  }),

  render: (ctx, _cell, x, y, _w, _h, _options) => {
    ctx.fillText("", x, y);
  }
}
