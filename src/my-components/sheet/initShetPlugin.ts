import { clearRegistrySheetPlugin, registerSheetPlugin } from "./SheetPluginSystem";

import { ArraySheetPlugin } from "./ArraySheet";

export const registerBuiltInSheetPlugins = () => {
  clearRegistrySheetPlugin();
  registerSheetPlugin(ArraySheetPlugin);
}