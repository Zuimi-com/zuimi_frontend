import { useEditorStore } from "@/store/use-editor";
import {
  Bold,
  Italic,
  LinkIcon,
  List,
  Strikethrough,
  Image as ImageIcon,
} from "lucide-react";

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-md p-2 transition
      ${
        active ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
      }
      disabled:opacity-50`}
  >
    {children}
  </button>
);

const EditorToolbar = () => {
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
    <div className="flex items-center bg-[#f9fafb] gap-1 border-b border-gray-200 px-3 py-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
      >
        <Strikethrough size={18} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-gray-200" />

      <ToolbarButton onClick={setLink} active={editor.isActive("link")}>
        <LinkIcon size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List size={18} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-gray-200" />

      <ToolbarButton
        onClick={() => {
          const url = window.prompt("Image URL");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
      >
        <ImageIcon size={18} />
      </ToolbarButton>
    </div>
  );
};

export default EditorToolbar;
