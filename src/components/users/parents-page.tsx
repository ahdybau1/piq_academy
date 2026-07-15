'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Search, ChevronRight, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const MOCK_PARENTS = [
  { id: '1', name: 'Jean Dupont', email: 'jean.dupont@email.com', phone: '+237 600000001', status: 'actif', children: ['Alice Dupont (3e)', 'Marc Dupont (6e)'] },
  { id: '2', name: 'Marie Kameni', email: 'marie.k@email.com', phone: '+237 600000002', status: 'actif', children: ['Paul Kameni (Tle C)'] },
  { id: '3', name: 'Albert Ndi', email: 'albert.ndi@email.com', phone: '+237 600000003', status: 'suspendu', children: ['Sophie Ndi (1ere D)'] },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ParentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'suspendu'>('all');

  const filtered = MOCK_PARENTS.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q) && !p.phone.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span>Utilisateurs</span>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80">Comptes Parents</span>
        </nav>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comptes Parents</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Gestion des parents et de leurs liaisons élèves</p>
          </div>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input className="pl-9" placeholder="Nom, email, téléphone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'actif', 'suspendu'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                statusFilter === f
                  ? 'border-primary/40 bg-primary/8 text-primary'
                  : 'border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {f === 'all' ? 'Tous' : f === 'actif' ? 'Actifs' : 'Suspendus'}
            </button>
          ))}
        </div>
      </div>

      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {filtered.map((parent) => (
          <motion.div key={parent.id} variants={rowItem} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary font-bold text-primary-foreground">{initials(parent.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{parent.name}</p>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', parent.status === 'actif' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')}>
                  {parent.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {parent.email} • {parent.phone}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {parent.children.map((c) => (
                <span key={c} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
