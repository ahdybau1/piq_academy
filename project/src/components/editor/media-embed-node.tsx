'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { FileText, File as FileIcon } from 'lucide-react';
import React from 'react';
import type { MediaType } from '@/lib/media/types';

/**
 * Nœud Tiptap unifié pour les 5 types de médias de la section 2.3 (image, vidéo, audio,
 * PDF, document) — rendu adapté par type plutôt que 5 nœuds séparés.
 */
export interface MediaEmbedAttrs {
  url: string;
  mediaType: MediaType;
  label: string;
}

function MediaEmbedComponent({ node }: NodeViewProps) {
  const { url, mediaType, label } = node.attrs as unknown as MediaEmbedAttrs;

  return (
    <NodeViewWrapper className="my-2" contentEditable={false}>
      {mediaType === 'image' && (
        // eslint-disable-next-line @next/next/no-img-element -- média dynamique venant de Supabase Storage, pas un asset local
        <img src={url} alt={label || 'Média'} className="max-h-96 max-w-full rounded-lg border border-border/40" />
      )}
      {mediaType === 'video' && <video src={url} controls className="max-h-96 w-full rounded-lg border border-border/40" />}
      {mediaType === 'audio' && <audio src={url} controls className="w-full" />}
      {(mediaType === 'pdf' || mediaType === 'document') && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border/40 bg-card p-3 text-sm hover:border-primary/40"
        >
          {mediaType === 'pdf' ? <FileText className="h-5 w-5 text-rose-500" /> : <FileIcon className="h-5 w-5 text-blue-500" />}
          <span className="truncate font-medium">{label || url.split('/').pop()}</span>
        </a>
      )}
    </NodeViewWrapper>
  );
}

export const MediaEmbedNode = Node.create({
  name: 'mediaEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      mediaType: { default: 'image' },
      label: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-media-embed]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-media-embed': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaEmbedComponent);
  },
});
