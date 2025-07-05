import { clearRegistrySheetPlugin, registerSheetPlugin } from "./SheetPluginSystem";

import { ArraySheetPlugin } from "./ArraySheet";
import { SparseSheetPlugin } from "./SparseSheet";


export const registerBuiltInSheetPlugins = () => {
  clearRegistrySheetPlugin();
  registerSheetPlugin(ArraySheetPlugin);
  registerSheetPlugin(SparseSheetPlugin)
}