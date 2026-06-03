"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from './ui/button';
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        }
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'min-h-[200px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none',
      },
    }
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 border border-slate-200 dark:border-slate-700 p-1 rounded-md bg-slate-50 dark:bg-slate-800/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-600' : 'dark:border-slate-600 dark:hover:bg-slate-700'}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-600' : 'dark:border-slate-600 dark:hover:bg-slate-700'}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-slate-600' : 'dark:border-slate-600 dark:hover:bg-slate-700'}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-600' : 'dark:border-slate-600 dark:hover:bg-slate-700'}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-600' : 'dark:border-slate-600 dark:hover:bg-slate-700'}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
