import { tokens } from '@fluentui/react-components';
import Editor from '@monaco-editor/react';

export const MonacoEditor: React.FC = () => {
  return(
    <div 
      style={{
        border: `1px solid ${tokens.colorNeutralStroke1}`, 
        height: "100%",
        borderRadius: tokens.borderRadiusLarge,
      }}
    >
      <Editor height={"100%"} width={"100%"} options={{ renderWhitespace: "all"}} language='sql'/>
    </div>
  )
}