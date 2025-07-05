import { invoke } from "@tauri-apps/api/core";
import { TauriApiResponse } from "./api";
import { CssMap as LoadCellPluginCssMapPayload } from "./types/CssMap";

export async function loadCellPluginCssMap() : Promise<TauriApiResponse<LoadCellPluginCssMapPayload>>
{
  return invoke("load_cell_plugin_css_map", {});
} 

export function injectCellPluginCSS(cssMap: Record<string, string>) {
  const STYLE_ID = "cell-plugin-style-sheet"
  // 若已有樣式標籤，先移除（避免重複）
  const existing = document.getElementById(STYLE_ID);
  if (existing) existing.remove();

  const styleTag = document.createElement("style");
  styleTag.id = STYLE_ID;

  // 將所有 CSS 組合成一段大字串
  const combinedCSS = Object.values(cssMap).join("\n\n");

  styleTag.textContent = combinedCSS;
  document.head.appendChild(styleTag);
}