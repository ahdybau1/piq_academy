'use client';

import 'katex/dist/katex.min.css';
import React, { useState } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImagePlus,
  Sigma,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MathNode } from './math-node';
import { MediaEmbedNode } from './media-embed-node';
import { MediaPickerDialog } from './media-picker-dialog';
import { FormulaDialog } from './formula-dialog';
import type { MediaItem } from '@/lib/media/types';

/** Doc Tiptap vide, utilisé pour les nouvelles leçons ou en secours si `content_json` est invalide. */
export const EMPTY_LESSON_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

/**
 * Convertit l'ancien shape `{ text?: string }` (avant l'éditeur riche) en document
 * Tiptap, pour que les leçons créées avant cette évolution restent lisibles/éditables.
 */
export function toEditorDoc(contentJson: unknown): JSONContent {
  if (contentJson && typeof contentJson === 'object' && (contentJson as JSONContent).type === 'doc') {
    return contentJson as JSONContent;
  }
  const legacyText = (contentJson as { text?: string } | null)?.text;
  if (legacyText) {
    return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: legacyText }] }] };
  }
  return EMPTY_LESSON_DOC;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30',
        active && 'bg-primary/10 text-primary'
      )}
    >
      {children}
    </button>
  );
}

export function RichLessonEditor({
  content,
  onChange,
  classNodeId,
}: {
  content: JSONContent;
  onChange: (doc: JSONContent) => void;
  /** Un média inséré ici est toujours rattaché à cette classe/série (section 2.7). */
  classNodeId: string;
}) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [editingLatex, setEditingLatex] = useState('');
  const [applyLatex, setApplyLatex] = useState<((latex: string) => void) | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    content,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Rédigez le contenu de la leçon…' }),
      MediaEmbedNode,
      MathNode.configure({
        onEdit: (currentLatex, apply) => {
          setEditingLatex(currentLatex);
          setApplyLatex(() => apply);
          setShowFormula(true);
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert w-full max-w-none min-h-[200px] break-words rounded-b-lg border border-t-0 border-border/50 bg-background px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  if (!editor) return null;

  const insertMedia = (media: MediaItem) => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'mediaEmbed',
        attrs: { url: media.url, mediaType: media.type, label: media.url.split('/').pop() ?? '' },
      })
      .run();
  };

  const insertFormula = (latex: string) => {
    editor.chain().focus().insertContent({ type: 'mathFormula', attrs: { latex } }).run();
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-border/50 bg-muted/30 p-1.5">
        <ToolbarButton title="Gras" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Italique" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton title="Titre 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Titre 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton title="Liste à puces" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Liste numérotée" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Citation" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton title="Insérer un média (image/vidéo/audio/PDF/document)" onClick={() => setShowMediaPicker(true)}>
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Insérer une formule"
          onClick={() => {
            setEditingLatex('');
            setApplyLatex(null);
            setShowFormula(true);
          }}
        >
          <Sigma className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton title="Annuler" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Rétablir" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <MediaPickerDialog open={showMediaPicker} onOpenChange={setShowMediaPicker} onSelect={insertMedia} classNodeId={classNodeId} />
      <FormulaDialog
        open={showFormula}
        onOpenChange={setShowFormula}
        initialLatex={editingLatex}
        onConfirm={(latex) => (applyLatex ? applyLatex(latex) : insertFormula(latex))}
      />
    </div>
  );
}
