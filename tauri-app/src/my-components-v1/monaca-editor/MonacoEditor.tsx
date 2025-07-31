import { Button, tokens, Toolbar } from '@fluentui/react-components';
import Editor, { OnMount } from '@monaco-editor/react';
import { useRef, useState } from 'react';
import { showDBTable$ } from '../sql-tool-arrow-table/SetShowArrowTable';
import { Play20Regular } from '@fluentui/react-icons';

export const MonacoEditor: React.FC = () => {
  const [val, setVal] = useState("-- 請在這邊寫 duckdb sql 查詢資料\n-- Alt+] 是縮排指令\n-- Ctrl + Enter 是執行程式碼\n");
  const valRef = useRef<string | null>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Bind indent shortcut (Ctrl + ])
    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.BracketRight, // Corrected: Use BracketRight for ']'
      () => {
        editor.trigger('keyboard', 'editor.action.indentLines', null);
      }
    );

    // Bind outdent shortcut (Ctrl + [)
    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.BracketLeft,
      () => {
        editor.trigger('keyboard', 'editor.action.outdentLines', null);
      }
    );

    // Shift + Enter to run
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => {
        console.log(valRef)
        showDBTable$.next({alias: "", tableName: "", sql: valRef.current ?? "", type: "Query"});
      }
    )
  };

  return (
    <div 
      style={{
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        height: '100%',
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: tokens.borderRadiusLarge,
      }}
    >
      <Toolbar style={{ backgroundColor: tokens.colorNeutralBackground2 }}>
        <Button 
          icon={<Play20Regular />}
          appearance='subtle'
          title='執行 sql 程式碼'
          onClick={() => {
            showDBTable$.next({alias: "", tableName: "", sql: val, type: "Query"})
          }}
        />
      </Toolbar>
      <Editor 
        options={{ 
          renderWhitespace: "all",
          tabSize: 2,
          insertSpaces: true,
          autoIndent: "full",
          fontSize: 16,
        }}
        language='sql'
        value={val}
        onChange={(newVal) => {
          setVal(newVal ?? "");
          valRef.current = newVal ?? "";
        }}
        onMount={handleEditorMount}
        theme='vs-light'
      />
    </div>
  );
};
