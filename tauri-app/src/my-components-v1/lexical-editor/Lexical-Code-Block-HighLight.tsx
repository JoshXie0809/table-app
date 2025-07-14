import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // 換你喜歡的主題

export function LexicalCodeBlockHighlightPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      setTimeout(() => {
        // 只 highlight 編輯器內的 code block
        document.querySelectorAll("code").forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      }, 0);
    });
  }, [editor]);

  return null;
}
