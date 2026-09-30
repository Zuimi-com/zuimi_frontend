"use client";

import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";
import { useEditorStore } from "@/store/use-editor";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import EditorToolbar from "./admin/editor-toolbar";

export default function DocumentEditor({
  subject,
  onSubjectChange,
}: {
  subject: string;
  onSubjectChange: (subject: string) => void;
}) {
  const { setEditor } = useEditorStore();
  const { isPlayback } = useAdminTutorial();

  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "focus:outline-none print:border-0 bg-[#F3F3F5] flex flex-col min-h-[500px] w-full pr-10 pt-5 pb-10 cursor-text",
      },
    },
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Enter newsletter content" }),
      Image.configure({
        resize: {
          enabled: true,
          directions: ["top", "bottom", "left", "right"],
          minWidth: 50,
          minHeight: 50,
          alwaysPreserveAspectRatio: true,
        },
      }),
    ],
    content: "",
    onCreate({ editor: createdEditor }) {
      setEditor(createdEditor);
    },
    immediatelyRender: false,
    editable: !isPlayback,
  });

  useEffect(() => {
    editor?.setEditable(!isPlayback);
  }, [editor, isPlayback]);

  if (!editor) return null;

  return (
    <div className="w-full space-y-3 rounded-[14.78px] border bg-white p-5 shadow-md">
      <div className="space-y-2">
        <h2 className="font-semibold">Create and send a newsletter to your subscribers</h2>
        <label className="block" data-tutorial="newsletter-subject">
          <span className="font-semibold">Subject line</span>
          <input
            type="text"
            value={subject}
            disabled={isPlayback}
            onChange={(event) => onSubjectChange(event.target.value)}
            placeholder="Enter newsletter subject"
            className="mt-1 h-9 w-full rounded-[8px] bg-[#F3F3F5] px-5 disabled:cursor-default"
          />
        </label>
      </div>
      <div
        data-tutorial="newsletter-personalization"
        className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800"
      >
        Personalise greetings with {"{{name}}"}, {"{{full_name}}"}, {"{{first_name}}"}, or {"{{last_name}}"}.
      </div>
      <h3 className="font-semibold">Content</h3>
      <div
        data-tutorial="newsletter-content"
        className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <EditorToolbar />
        <EditorContent
          editor={editor}
          className="prose min-h-[300px] w-full max-w-none bg-[#F3F3F5] px-4 py-3 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}

