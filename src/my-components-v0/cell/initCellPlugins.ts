import { clearRegistryCellPlugin, registerCellPlugin } from "./cellPluginSystem";

import { NullCellPlugin } from "./nullCell";
import { TextCellPlugin } from "./textCell";

export function registerBuiltInCellPlugins() {
  clearRegistryCellPlugin();
  registerCellPlugin(NullCellPlugin);
  registerCellPlugin(TextCellPlugin);
}