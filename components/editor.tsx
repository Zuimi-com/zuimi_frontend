"use client";

import { useEditorStore } from "@/store/use-editor";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import EditorToolbar from "./admin/editor-toolbar";

const DocumentEditor = () => {
  const { setEditor } = useEditorStore();

  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "focus:outline-none print:border-0 bg-[#F3F3F5] flex flex-col min-h-[500px] w-full pr-10 pt-5 pb-10 cursor-text",
      },
    },
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Enter newsletter content",
      }),
      Image.configure({
        resize: {
          enabled: true,
          directions: ["top", "bottom", "left", "right"], // can be any direction or diagonal combination
          minWidth: 50,
          minHeight: 50,
          alwaysPreserveAspectRatio: true,
        },
      }),
    ],
    onCreate({ editor }) {
      setEditor(editor);
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="w-full bg-white border rounded-[14.78px] shadow-md p-5 space-y-3">
      <div className="space-y-2">
        <h2>Create and send a new newsletter to your subscribers</h2>
        <div className="">
          <p className="font-semibold">Subject Line</p>
          <input
            type="text"
            placeholder="Enter title of newsletter"
            className="w-full bg-[#F3F3F5] pl-5 rounded-[8px] h-9"
          />
        </div>
      </div>
      <h3 className="font-semibold">Content</h3>
      <div className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* Toolbar */}
        <EditorToolbar />

        {/* Editor */}
        <EditorContent
          placeholder=""
          editor={editor}
          className="prose min-h-[300px] bg-[#F3F3F5] w-full max-w-none px-4 py-3 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
};

export default DocumentEditor;
