import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function ReviewEditorPage() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start typing here. Try <strong>bold</strong> or a bullet list.</p>',
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-heading font-semibold">Review Editor</h1>
        <p className="text-muted-foreground">A bare editor shell — real meeting data comes in Week 3.</p>
      </div>

      <div className="rounded-lg border bg-background p-4">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none min-h-[300px]"
        />
      </div>
    </div>
  );
}