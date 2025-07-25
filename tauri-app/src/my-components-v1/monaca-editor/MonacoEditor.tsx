import { Button, tokens, Toolbar } from '@fluentui/react-components';
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { showDBTable$ } from '../sql-tool-arrow-table/SetShowArrowTable';
import { Play20Regular } from '@fluentui/react-icons';

export const MonacoEditor: React.FC = () => {
  const [val, setVal] = useState("");
  return(
    <div 
      style={{
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        height: '100%',
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        borderRadius: tokens.borderRadiusLarge,
      }}
    >
      <Toolbar 
        style= {{
          backgroundColor: tokens.colorNeutralBackground2,
        }}
      >
        <Button 
          icon={<Play20Regular />}
          appearance='subtle'
          title='執行 sql 程式碼'
          onClick={() => {
            showDBTable$.next({dbPath: "", tableName: "", sql: val, type: "Query"})
          }}
        />
      </Toolbar>
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
      
    </div>
  )
}