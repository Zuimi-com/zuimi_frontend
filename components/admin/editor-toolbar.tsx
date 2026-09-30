"use client";

import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";
import { useEditorStore } from "@/store/use-editor";
import {
  Bold,
  Image as ImageIcon,
  Italic,
  LinkIcon,
  List,
  Strikethrough,
} from "lucide-react";

const ToolbarButton = ({
  onClick,
  active,
  tutorial,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  tutorial: string;
  children: React.ReactNode;
}) => {
  const { isPlayback } = useAdminTutorial();
  return (
    <button
      type="button"
      data-tutorial={tutorial}
      onClick={() => !isPlayback && onClick()}
      disabled={isPlayback}
      className={`rounded-md p-2 transition ${
        active ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
      } disabled:cursor-default disabled:opacity-70`}
    >
      {children}
    </button>
  );
};

export default function EditorToolbar() {
  const { editor } = useEditorStore();

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 bg-[#f9fafb] px-3 py-2">
      <ToolbarButton
        tutorial="newsletter-toolbar-bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton
        tutorial="newsletter-toolbar-italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic size={18} />
      </ToolbarButton>
      <ToolbarButton
        tutorial="newsletter-toolbar-strike"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
      >
        <Strikethrough size={18} />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-gray-200" />
      <ToolbarButton
        tutorial="newsletter-toolbar-link"
        onClick={setLink}
        active={editor.isActive("link")}
      >
        <LinkIcon size={18} />
      </ToolbarButton>
      <ToolbarButton
        tutorial="newsletter-toolbar-list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List size={18} />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-gray-200" />
      <ToolbarButton
        tutorial="newsletter-toolbar-image"
        onClick={() => {
          const url = window.prompt("Image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
      >
        <ImageIcon size={18} />
      </ToolbarButton>
    </div>
  );
}

