import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "./tiptap-editor.css"

export const MyTiptapEditor: React.FC = () => {
  // 建立 editor 實例
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello, <b>world!</b> 這是 Tiptap 編輯器 🚀</p>",
  });

  if(!editor) return null;

  return (
    <div>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            Toggle bold
          </button>
          <button onClick={() => editor.chain().focus().setBold().run()} disabled={editor.isActive('bold')}>
            Set bold
          </button>
          <button onClick={() => editor.chain().focus().unsetBold().run()} disabled={!editor.isActive('bold')}>
            Unset bold
          </button>
        </div>
      </div>
      <h3>Tiptap 編輯器 Demo</h3>
      <div style={{
        border: "1px solid #ccc",
        borderRadius: 4,
        minHeight: 100,
        padding: "12px",
      }}>
        <EditorContent editor={editor} spellCheck={false} />
      </div>
    </div>
  );
};
