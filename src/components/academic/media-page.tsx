'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Search,
  ChevronRight,
  Home,
  Upload,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  File as FileIcon,
  Trash2,
  Loader2,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { fetchMedia, uploadMediaFile, deleteMediaItem } from '@/lib/media/api-client';
import { fetchAcademicNodes } from '@/lib/academic/api-client';
import { useWorkingClass } from '@/lib/working-class-context';
import { HierarchicalNodeSelect } from './hierarchical-node-select';
import type { MediaItem, MediaType } from '@/lib/media/types';
import type { AcademicNodeRow } from '@/lib/academic/types';
import { cn } from '@/lib/utils';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } };
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const TYPE_ICON: Record<MediaType, React.ReactNode> = {
  image: <ImageIcon className="h-8 w-8 text-blue-500/50" />,
  video: <Video className="h-8 w-8 text-emerald-500/50" />,
  audio: <Music className="h-8 w-8 text-violet-500/50" />,
  pdf: <FileText className="h-8 w-8 text-rose-500/50" />,
  document: <FileIcon className="h-8 w-8 text-amber-500/50" />,
};

export function MediaPage({ countryId }: { countryId: string | null }) {
  const [, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [academicNodes, setAcademicNodes] = useState<AcademicNodeRow[] | null>(null);
  useEffect(() => {
    fetchAcademicNodes(countryId ?? undefined).then(setAcademicNodes).catch((e) => setError(e.message));
  }, [countryId]);

  // Préremplit depuis la « classe de travail » du header, resynchronisé si elle change.
  const { workingClassNodeId } = useWorkingClass();
  const [filterClassNodeId, setFilterClassNodeId] = useState(workingClassNodeId ?? '');
  const [media, setMedia] = useState<MediaItem[]>([]);

  const refreshMedia = () => fetchMedia(filterClassNodeId || undefined).then(setMedia).catch((e) => setError(e.message));

  useEffect(() => {
    refreshMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClassNodeId]);

  const [prevWorkingClassNodeId, setPrevWorkingClassNodeId] = useState(workingClassNodeId);
  if (workingClassNodeId !== prevWorkingClassNodeId) {
    setPrevWorkingClassNodeId(workingClassNodeId);
    setFilterClassNodeId(workingClassNodeId ?? '');
  }

  const filteredMedia = searchQuery
    ? media.filter((m) => m.url.split('/').pop()?.toLowerCase().includes(searchQuery.toLowerCase()))
    : media;

  // ── Upload ────────────────────────────────────────────────────────────────
  const [showUpload, setShowUpload] = useState(false);
  const [uploadClassNodeId, setUploadClassNodeId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startUpload = () => {
    setUploadClassNodeId(filterClassNodeId);
    setUploadError(null);
    setShowUpload(true);
  };

  const handleUpload = async (file: File) => {
    if (!uploadClassNodeId) {
      setUploadError('La classe/série est requise.');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      await uploadMediaFile(file, uploadClassNodeId);
      setShowUpload(false);
      refreshMedia();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deleteMediaItem(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      refreshMedia();
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span>Académique</span>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">Bibliothèque de médias</span>
        </nav>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bibliothèque de médias</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Fichiers réutilisables entre leçons — chaque média est rattaché à une classe/série précise.
            </p>
          </div>
          {countryId && (
            <Button size="sm" className="gap-2" onClick={startUpload}>
              <Upload className="h-4 w-4" />
              Uploader
            </Button>
          )}
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
          {error}
        </div>
      )}

      {!countryId && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <Globe className="h-5 w-5 shrink-0" />
          Sélectionnez un pays via le menu « Périmètre » en haut de page pour uploader un média.
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input className="pl-9" placeholder="Rechercher un fichier…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        {countryId && (
          <HierarchicalNodeSelect nodes={academicNodes ?? []} countryId={countryId} value={filterClassNodeId} onChange={setFilterClassNodeId} compact />
        )}
        {filterClassNodeId && (
          <button onClick={() => setFilterClassNodeId('')} className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
            Toutes les classes
          </button>
        )}
      </div>

      <Dialog open={showUpload} onOpenChange={(open) => !open && setShowUpload(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploader un média</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {countryId && (
              <HierarchicalNodeSelect nodes={academicNodes ?? []} countryId={countryId} value={uploadClassNodeId} onChange={setUploadClassNodeId} />
            )}
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 p-8 text-center transition-colors',
                !uploading && uploadClassNodeId && 'cursor-pointer hover:border-primary/40',
                (!uploadClassNodeId || uploading) && 'opacity-50'
              )}
              onClick={() => !uploading && uploadClassNodeId && fileInputRef.current?.click()}
            >
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              <p className="text-sm text-muted-foreground">
                {uploading ? 'Envoi en cours…' : uploadClassNodeId ? 'Cliquez pour choisir un fichier' : "Choisissez d'abord une classe"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                  e.target.value = '';
                }}
              />
            </div>
            {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowUpload(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" variants={stagger} initial="hidden" animate="show">
        {filteredMedia.map((m) => (
          <motion.div
            key={m.id}
            variants={rowItem}
            className="group relative overflow-hidden rounded-xl border border-border/40 bg-card transition-colors hover:border-primary/40"
          >
            <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex aspect-video items-center justify-center bg-muted/40">
              {m.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              ) : (
                TYPE_ICON[m.type]
              )}
            </a>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{m.url.split('/').pop()}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{m.className ?? 'Classe supprimée'}</span>
                <span>{m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : ''}</span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(m.id)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-background/90 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
        {filteredMedia.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground/50">
            <ImageIcon className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucun média — uploadez-en un</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
