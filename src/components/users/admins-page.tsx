'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Search, ChevronRight, Hop as Home, Shield, MoveVertical as MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles-config';
import type { UserRole } from '@/lib/types';

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const MOCK_ADMINS: { id: string; name: string; email: string; role: UserRole; scope: string; status: string }[] = [
  { id: '1', name: 'Marie Nguema', email: 'marie@piq.academy', role: 'super_admin', scope: 'Tous', status: 'actif' },
  { id: '2', name: 'Paul Mbeki', email: 'paul@piq.academy', role: 'admin_pays', scope: 'Cameroun', status: 'actif' },
  { id: '3', name: 'Sophie Atangana', email: 'sophie@piq.academy', role: 'admin_contenu', scope: 'Tous', status: 'actif' },
  { id: '4', name: 'Claire Fouda', email: 'claire@piq.academy', role: 'moderateur', scope: 'Cameroun', status: 'actif' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AdminsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_ADMINS.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
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
          <span className="font-medium text-foreground/80">Comptes Administrateurs</span>
        </nav>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comptes Administrateurs</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Gestion des accès à la plateforme d&apos;administration</p>
          </div>
          <Button size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            Nouvel admin
          </Button>
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="brand-gradient-bg absolute left-0 top-0 h-px w-16 opacity-60" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input className="pl-9" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {filtered.map((admin) => (
          <motion.div key={admin.id} variants={rowItem} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-slate-700 font-bold text-white">{initials(admin.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{admin.name}</p>
              <p className="text-xs text-muted-foreground">
                {admin.email} • {admin.scope}
              </p>
            </div>
            <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', ROLE_COLORS[admin.role])}>
              {ROLE_LABELS[admin.role]}
            </span>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
