import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getSelection, $isRangeSelection, $isTextNode, KEY_SPACE_COMMAND } from "lexical";
import { LuaFactory } from "wasmoon";

// Lua 虛擬機初始化
const factory = new LuaFactory();
const luaVMPromise = factory.createEngine();

function matchCalcCommand(str: string) {
  // 支援 :calc( ... ):，抓內容
  const m = str.match(/:calc\((.*?)\):/);
  return m ? m[1] : null;
}

export function LexicalCalcInputRulePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_SPACE_COMMAND,
      () => {
        editor.getEditorState().read(async () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const anchor = selection.anchor;
            const node = anchor.getNode();
            if ($isTextNode(node)) {
              const textContent = node.getTextContent();
              const expr = matchCalcCommand(textContent);
              if (expr) {
                const vm = await luaVMPromise;
                let result;
                try {
                  result = String(await vm.doString(`return ${expr}`));
                } catch {
                  result = "錯誤";
                }
                editor.update(() => {
                  node.setTextContent(
                    textContent.replace(/:calc\((.*?)\):/, result + " ")
                  );
                });
              }
            }
          }
        });
        return false;
      },
      0
    );
  }, [editor]);

  return null;
}
