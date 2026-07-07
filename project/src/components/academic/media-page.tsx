'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Search, ChevronRight, Home, Upload, Image as ImageIcon, FileText, Video, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const MOCK_MEDIA = [
  { id: '1', name: 'schema_cellule.png', type: 'image', size: '2.4 MB', date: '12 Jan 2024' },
  { id: '2', name: 'cours_histoire_chap1.pdf', type: 'pdf', size: '5.1 MB', date: '10 Jan 2024' },
  { id: '3', name: 'experience_chimie.mp4', type: 'video', size: '124 MB', date: '08 Jan 2024' },
];

export function MediaPage() {
  const [searchQuery, setSearchQuery] = useState('');

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
            <p className="mt-0.5 text-sm text-muted-foreground">Gestion centralisée des fichiers pédagogiques</p>
          </div>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Uploader
          </Button>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input className="pl-9" placeholder="Rechercher un fichier..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-muted-foreground">
          <HardDrive className="h-4 w-4" />
          <span>1.2 GB / 50 GB utilisés</span>
        </div>
      </div>

      <motion.div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" variants={stagger} initial="hidden" animate="show">
        {MOCK_MEDIA.map((media) => (
          <motion.div
            key={media.id}
            variants={rowItem}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/40 bg-card transition-colors hover:border-primary/40"
          >
            <div className="flex aspect-video items-center justify-center bg-muted/40">
              {media.type === 'image' && <ImageIcon className="h-8 w-8 text-blue-500/50" />}
              {media.type === 'pdf' && <FileText className="h-8 w-8 text-rose-500/50" />}
              {media.type === 'video' && <Video className="h-8 w-8 text-emerald-500/50" />}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{media.name}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{media.size}</span>
                <span>{media.date}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
