import "./SQLApp.css"
import { FluentProvider, makeStyles, tokens, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import { ButtonToolBox } from "../../my-components-v1/button-toolbox/ButtonToolBox";
import { RibbonGroup } from "../../my-components-v1/button-toolbox/RibbonGroup";
import { ButtonLoadDB } from "../../my-components-v1/button-toolbox/button-sql-tool/ButtonLoadDB";
import { ListDB } from "../../my-components-v1/sql-tool-db-list/ListDB";
import { SetShowArrowTable } from "../../my-components-v1/sql-tool-arrow-table/SetShowArrowTable";
import { MonacoEditor } from "../../my-components-v1/monaca-editor/MonacoEditor";

// 引入 resizable-panels 的元件
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from "react-resizable-panels";

// 樣式定義保持不變，但需要為拖動條新增樣式
const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    minHeight: 0,
    padding: "16px 24px",
    gap: "2px",
  },
  pane: { // 一個通用的面板樣式，用來取代 leftPane, editorContainer 等
    display: 'flex',
    flexDirection: 'column',
    position: 'relative', // 確保子元件定位正確
    borderRadius: tokens.borderRadiusLarge,
    overflow: 'auto', // 讓內容超出時可以滾動
    padding: "2px 2px",
    width: "100%",
    height: "100%",
  },
  leftPaneContent: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingHorizontalS, // 為 ListDB 內容增加一些內邊距
  },
  // 拖動條的樣式
  resizeHandle: {
    position: 'relative',
    outline: 'none',
    backgroundColor: tokens.colorNeutralBackground4,
    transition: 'background-color 0.2s ease-in-out',
    // 垂直拖動條
    '&[data-direction="vertical"]': {
        height: '8px',
        margin: `${tokens.spacingVerticalS} 0`,
    },
    // 水平拖動條
    '&[data-direction="horizontal"]': {
        width: '8px',
        margin: `0 ${tokens.spacingHorizontalS}`,
    },
    '&:hover': {
        backgroundColor: tokens.colorBrandBackgroundHover,
    },
  },
  // 拖動條中間的視覺提示線
  resizeHandleGrip: {
    position: 'absolute',
    backgroundColor: tokens.colorStatusDangerBackground3Pressed,
    '&[data-direction="vertical"]': {
        height: '2px',
        width: '100px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
    '&[data-direction="horizontal"]': {
      width: '2px',
      height: '72px',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
});

// 您的組件
export const SQLApp = () => {
  const styles = useStyles();
  return (
    <FluentProvider theme={webLightTheme} applyStylesToPortals={true}>
      <div className={styles.root}>
        <ButtonToolBox>
          <RibbonGroup label="檔案">
            <ButtonLoadDB />
          </RibbonGroup>
        </ButtonToolBox>

        {/* 使用 PanelGroup 取代原本的 main 容器 */}
        <PanelGroup direction="horizontal" className={styles.content}>
          {/* 左半邊 Panel */}
          <Panel defaultSize={20} minSize={5} order={1}>
            <div className={`${styles.pane} ${styles.leftPaneContent}`}>
                <ListDB />
            </div>
          </Panel>

          {/* 水平拖動條 */}
          <PanelResizeHandle className={styles.resizeHandle}>
            <div data-direction="horizontal" className={styles.resizeHandleGrip} />
          </PanelResizeHandle>

          {/* 右半邊 Panel，內部再嵌套一個垂直的 PanelGroup */}
          <Panel defaultSize={80} minSize={30} order={2}>
            <PanelGroup direction="vertical">
              {/* 右上: Code Editor */}
              <Panel defaultSize={60} minSize={5} order={1}>
                <div className={styles.pane}>
                    <MonacoEditor />
                </div>
              </Panel>

              {/* 垂直拖動條 */}
              <PanelResizeHandle className={styles.resizeHandle}>
                <div data-direction="vertical" className={styles.resizeHandleGrip} />
              </PanelResizeHandle>

              {/* 右下: Table 輸出 */}
              <Panel defaultSize={40} minSize={20} order={2}>
                <div className={styles.pane}>
                    <SetShowArrowTable />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>

      </div>
      <div id="sql-tool-page-portal-root" />
    </FluentProvider>
  );
};
