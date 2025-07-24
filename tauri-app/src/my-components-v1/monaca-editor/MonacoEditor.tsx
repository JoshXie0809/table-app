import { Button, tokens } from '@fluentui/react-components';
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { showDBTable$ } from '../sql-tool-arrow-table/SetShowArrowTable';

export const MonacoEditor: React.FC = () => {
  const [val, setVal] = useState("select 1 + 1 as ans;");
  return(
    <div 
      style={{
        border: `1px solid ${tokens.colorNeutralStroke1}`, 
        height: "90%",
        borderRadius: tokens.borderRadiusLarge,
      }}
    >
      <Editor 
        options={{ renderWhitespace: "all"}} 
        language='sql'
        value={val}
        onChange={(newVal) => {
          if(newVal === undefined)
            setVal("")
          else
            setVal(newVal)
        }}
      />
      <Button onClick={() => {
        showDBTable$.next({dbPath: "", tableName: "", sql: val, type: "Query"})
      }}>Run</Button>
    </div>
  )
}