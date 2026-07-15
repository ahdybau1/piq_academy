'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import React from 'react';

/**
 * Nœud Tiptap pour une formule mathématique/scientifique (section 2.3). Stocke le
 * LaTeX source dans l'attribut `latex` et affiche le rendu KaTeX — le LaTeX reste
 * toujours récupérable pour l'édition ultérieure (pas juste une image figée).
 */
export interface MathNodeOptions {
  onEdit?: (currentLatex: string, apply: (latex: string) => void) => void;
}

function MathComponent({ node, updateAttributes, extension }: NodeViewProps) {
  const latex = (node.attrs.latex as string) ?? '';
  const options = extension.options as MathNodeOptions;
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(latex || '', { throwOnError: false, displayMode: true });
    } catch {
      return `<span class="text-rose-600">Formule invalide</span>`;
    }
  }, [latex]);

  return (
    <NodeViewWrapper
      className="my-2 cursor-pointer rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-center transition-colors hover:border-primary/40"
      onClick={() => options.onEdit?.(latex, (next: string) => updateAttributes({ latex: next }))}
      contentEditable={false}
    >
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  );
}

export const MathNode = Node.create<MathNodeOptions>({
  name: 'mathFormula',
  group: 'block',
  atom: true,

  addOptions() {
    return { onEdit: undefined };
  },

  addAttributes() {
    return {
      latex: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-math-formula]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-math-formula': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathComponent);
  },
});
