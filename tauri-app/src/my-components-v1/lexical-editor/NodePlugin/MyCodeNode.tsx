import {
  CodeNode,
} from "@lexical/code";
import {
  EditorConfig,
} from "lexical";

export class MyCodeNode extends CodeNode {
  static getType(): string {
    return "code"; // ✅ 保持一致，讓 Lexical 判斷為 code block
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.classList.add("my-code-wrapper");
    console.log(dom)
    return dom;
  }
}

export function $createMyCodeNode() {
  return new MyCodeNode();
}