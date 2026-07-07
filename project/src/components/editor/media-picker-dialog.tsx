'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Video, Music, FileText, File as FileIcon, Upload, Loader2 } from 'lucide-react';
import { fetchMedia, uploadMediaFile } from '@/lib/media/api-client';
import type { MediaRow, MediaType } from '@/lib/media/types';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<MediaType, React.ReactNode> = {
  image: <ImageIcon className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  pdf: <FileText className="h-5 w-5" />,
  document: <FileIcon className="h-5 w-5" />,
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: MediaRow) => void;
}) {
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Déclenche le chargement à chaque ouverture — reset pendant le rendu (pattern
  // officiel React), l'effet ne fait que l'appel asynchrone lui-même.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setLoading(true);
      setError(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    fetchMedia()
      .then(setMedia)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadMediaFile(file);
      setMedia((prev) => [uploaded, ...prev]);
      onSelect(uploaded);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Insérer un média</DialogTitle>
          <DialogDescription>Image, vidéo, audio, PDF ou document — depuis la bibliothèque ou un nouvel envoi.</DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Tabs defaultValue="library">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Bibliothèque</TabsTrigger>
            <TabsTrigger value="upload">Uploader</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto">
                {media.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelect(m);
                      onOpenChange(false);
                    }}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-border/40 p-2 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    {m.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="h-14 w-full rounded object-cover" />
                    ) : (
                      <div className="flex h-14 w-full items-center justify-center rounded bg-muted text-muted-foreground">{TYPE_ICON[m.type]}</div>
                    )}
                    <span className="w-full truncate text-[10px] text-muted-foreground">{m.url.split('/').pop()}</span>
                  </button>
                ))}
                {media.length === 0 && <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">Bibliothèque vide.</p>}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-3">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 p-8 text-center transition-colors',
                !uploading && 'cursor-pointer hover:border-primary/40'
              )}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              <p className="text-sm text-muted-foreground">{uploading ? 'Envoi en cours…' : 'Cliquez pour choisir un fichier'}</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
