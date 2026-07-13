'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import katex from 'katex';

export function FormulaDialog({
  open,
  onOpenChange,
  initialLatex,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLatex: string;
  onConfirm: (latex: string) => void;
}) {
  const [latex, setLatex] = useState(initialLatex);

  // Réinitialise le brouillon à chaque (ré)ouverture du dialogue — pattern de reset
  // pendant le rendu plutôt qu'un effet (voir content-page.tsx pour le même mécanisme).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setLatex(initialLatex);
  }

  let preview = '';
  let previewError = false;
  try {
    preview = katex.renderToString(latex || '', { throwOnError: false, displayMode: true });
  } catch {
    previewError = true;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Formule mathématique / scientifique</DialogTitle>
          <DialogDescription>Syntaxe LaTeX — ex. {'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>LaTeX</Label>
            <Textarea className="mt-1 font-mono text-sm" rows={3} value={latex} onChange={(e) => setLatex(e.target.value)} />
          </div>
          <div>
            <Label>Aperçu</Label>
            <div className="mt-1 min-h-16 rounded-lg border border-border/40 bg-muted/30 p-4 text-center">
              {previewError ? (
                <span className="text-sm text-rose-600">Formule invalide</span>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: preview }} />
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            disabled={!latex.trim()}
            onClick={() => {
              onConfirm(latex);
              onOpenChange(false);
            }}
          >
            Insérer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
