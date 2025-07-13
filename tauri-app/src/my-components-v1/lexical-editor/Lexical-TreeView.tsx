import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";

export const LexicalTreeViewPlugin = () => {
  const [editor] = useLexicalComposerContext();
  if(!editor) return null;
  return(  
    <TreeView editor={editor}/>
  )
}