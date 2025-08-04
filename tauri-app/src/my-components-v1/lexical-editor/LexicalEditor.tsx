import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { makeStyles, Text, tokens } from "@fluentui/react-components";
import { LexicalHeadingInputRulePlugin } from "./Lexical-Heading-Inputrule";
// import { LexicalTreeViewPlugin } from "./Lexical-TreeView";
import { LexicalToolBar } from "./Lexical-ToolBar";
import { LexicalCalcInputRulePlugin } from "./Lexical-Calc-Inputrule";
import { MyCodeNode } from "./NodePlugin/MyCodeNode";
import { LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"

import {
  ListNode,
  ListItemNode,
} from "@lexical/list";
import { LexicalListInputRulePlugin } from "./Lexical-List-Inputrule";
import { TimestampNode } from "./NodePlugin/TimeStampNode";
import { TimestampPlugin } from "./NodePlugin/TimeStampNodePlugin";

const initialConfig = {
  namespace: "MyLexicalEditor",
  onError(error: Error) {
    throw error;
  },
  nodes: [
    HeadingNode, MyCodeNode, LinkNode,
    ListItemNode, ListNode,
    TimestampNode
  ],
};

export function MyLexicalEditor() {
  const styles = useLexicalStyles();
  return (
    <div className={styles["editor-container"]}>
      <LexicalComposer initialConfig={initialConfig}>
        <LexicalToolBar />
        <div className={styles["editor-input-container"]}>
          <RichTextPlugin
            placeholder={
              <Text 
                className={styles["editor-input"]} 
                style = {{ position: "absolute", top: "0", left: "0", pointerEvents: "none"}}
              >
                Enter some text...
              </Text>
            }
            contentEditable={<ContentEditable className={styles["editor-input"]} spellCheck={false}/>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <LexicalHeadingInputRulePlugin />
          <LexicalListInputRulePlugin />
          <LexicalCalcInputRulePlugin />
          <LinkPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <TimestampPlugin />
          
          {/* <hr className={styles.divider} /> */}
          {/* <LexicalTreeViewPlugin /> */}
        </div>
      </LexicalComposer>
    </div>
  );
}

export const useLexicalStyles = makeStyles({
  "editor-container": {
    minWidth: "400px",
    // maxWidth: "1000px",
    // maxWidth: "90%",
    overflow: "auto",
    margin: "24px auto 16px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.fontSizeBase300,
    padding: "24px",
    position: "relative",
  },

  "editor-input": {
    padding: "12px",
    fontSize: "16px",
    "&:focus": {
      outline: "none",
    },
    "& > *:first-child": {
      marginTop: "0px",
    },
    "& > *:last-child": {
      marginBottom: "0px",
    },

    // ✅ code block
    "& .my-code-wrapper": {
      border: `2px solid ${tokens.colorBrandBackground3Static}`,
      padding: "12px 16px",
      borderRadius: "4px",
      whiteSpace: "pre-wrap",
      maxHeight: "400px",
      overflow: "auto",
      display: "block",
      marginBottom: "4px",
    },

    "& li[role='checkbox']": {
      listStyle: "none",
      display: "flex", // 使用 Flexbox 保持對齊
      alignItems: "flex-start", // ✨ 讓 check box 自身與文本內容的頂部對齊
      gap: "12px", // ✨ 調整為更精確的像素值，或繼續使用 rem 如果你喜歡
      paddingLeft: "0",
      position: "relative",
      outline: "none", // 移除 li 本身的預設 outline
      marginLeft: "-20px", // 確保這個值與 ul 的 paddingLeft 以及 ::before 的 left 負值對應
                            // 它會讓 li 元素的內容框和可點擊區域向左移動

      "&::before": {
        content: '""',
        display: "inline-block", // 保持，或使用 flex 容器的一部分
        flexShrink: 0, // ✨ 確保 checkbox 不會被壓縮
        width: "16px",
        height: "16px",
        minWidth: "16px", // 確保最小寬度
        border: `2px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: "4px", // 使用 4px 圓角與 Fluent UI 風格更接近
        backgroundColor: tokens.colorNeutralBackground1,
        boxSizing: "border-box",
        cursor: "pointer", // ✨ 增加游標，表示可點擊
      },

      // ✨ 當項目被選中時的 ::before 樣式
      '&[aria-checked="true"]::before': {
        backgroundColor: tokens.colorBrandBackgroundHover, // 使用 Fluent UI 的品牌色
        border: `2px solid ${tokens.colorBrandBackgroundHover}`,
        // 添加一個 SVG 來模擬打勾圖標 (更美觀)
        // 注意：這裡的背景圖需要經過 URL encode，或者單獨作為一個 SVG 組件
        // 為了簡潔，我使用一個簡化的 CSS 打勾
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M9.5 17.5L4 12l1.5-1.5L9.5 14.5 18 6l1.5 1.5z'/%3E%3C/svg%3E")`,
        backgroundSize: "80%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      },

      // 也可以考慮添加 active 狀態的樣式
      "&:active::before": {
          transform: "scale(0.85)", // 點擊時輕微縮小
      },
    },
  },

  "editor-input-container": {
    position: "relative",
  },

  "divider": {
    width: "95%",
    border: "none",
    borderTop: `2px solid ${tokens.colorNeutralStroke1}`,
    margin: "12px auto 24px",
    height: "0",
  },

  timstamp: {
    backgroundColor: tokens.colorNeutralBackground6,
    padding: "2px 4px",
    borderRadius: "4px",
  }
});
