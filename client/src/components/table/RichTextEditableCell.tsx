import React from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Project } from '../../types';
import { useData } from '../../contexts/DataContext';
import * as api from '../../api';
import toast from 'react-hot-toast';
import { Bold, Paintbrush } from 'lucide-react';

interface RichTextEditableCellProps {
  getValue: () => any;
  row: { original: Project };
  column: { id: string };
}

const RichTextEditableCell: React.FC<RichTextEditableCellProps> = ({ getValue, row, column }) => {
  const initialContent = getValue() || '';
  const { updateProjectInState } = useData();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable unnecessary extensions to keep it simple
        heading: false,
        blockquote: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
      }),
      TextStyle,
      Color,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-1 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-md',
      },
    },
    onBlur: async ({ editor }) => {
      const html = editor.getHTML();
      // Tiptap might return '<p></p>' for empty content
      const isActuallyEmpty = html === '<p></p>';
      if (html === initialContent || (isActuallyEmpty && !initialContent)) {
        return; // No change
      }

      const project = row.original;
      const toastId = toast.loading('正在保存...');
      try {
        const updatedProject = await api.updateProject(project.id, { [column.id]: isActuallyEmpty ? '' : html });
        updateProjectInState(updatedProject);
        toast.success('保存成功！', { id: toastId });
      } catch (error) {
        toast.error('保存失败，请重试。', { id: toastId });
        editor.commands.setContent(initialContent, false); // Revert on failure
      }
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <>
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="bg-gray-800 text-white rounded-md p-1 flex gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-600' : ''}`}
          title="加粗"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setColor('#E00000').run()}
          className={`p-1 rounded ${editor.isActive('textStyle', { color: '#E00000' }) ? 'bg-gray-600' : ''}`}
          title="标红"
        >
          <Paintbrush className="w-4 h-4" />
        </button>
      </BubbleMenu>
      <EditorContent editor={editor} />
    </>
  );
};

export default RichTextEditableCell;