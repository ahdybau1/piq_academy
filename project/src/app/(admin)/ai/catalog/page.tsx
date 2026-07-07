'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Plus, BookOpen, Calculator, FileText, CheckSquare, 
  Sigma, AlignLeft, Image as ImageIcon, CheckCircle2, 
  Brain, Zap, Activity, Clock
} from 'lucide-react';

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const CATALOG_CATEGORIES = [
  { id: 'cat-1', name: 'Définition', description: 'Explication conceptuelle précise', count: 2450, usage: 85, icon: <BookOpen className="h-5 w-5 text-blue-500" />, color: 'bg-blue-500/10' },
  { id: 'cat-2', name: 'Théorème', description: 'Proposition démontrée et logique', count: 320, usage: 40, icon: <Calculator className="h-5 w-5 text-violet-500" />, color: 'bg-violet-500/10' },
  { id: 'cat-3', name: 'Exemple', description: 'Illustration pratique détaillée', count: 1890, usage: 70, icon: <FileText className="h-5 w-5 text-emerald-500" />, color: 'bg-emerald-500/10' },
  { id: 'cat-4', name: 'Exercice type', description: 'Cas pratique avec corrigé', count: 750, usage: 90, icon: <CheckSquare className="h-5 w-5 text-amber-500" />, color: 'bg-amber-500/10' },
  { id: 'cat-5', name: 'Formule', description: 'Expression mathématique ou physique', count: 420, usage: 35, icon: <Sigma className="h-5 w-5 text-rose-500" />, color: 'bg-rose-500/10' },
  { id: 'cat-6', name: 'Résumé', description: 'Synthèse de fin de chapitre', count: 150, usage: 60, icon: <AlignLeft className="h-5 w-5 text-cyan-500" />, color: 'bg-cyan-500/10' },
  { id: 'cat-7', name: 'Schéma', description: 'Représentation visuelle générée', count: 85, usage: 25, icon: <ImageIcon className="h-5 w-5 text-pink-500" />, color: 'bg-pink-500/10' },
  { id: 'cat-8', name: 'QCM', description: 'Questions à choix multiples', count: 3100, usage: 95, icon: <CheckCircle2 className="h-5 w-5 text-indigo-500" />, color: 'bg-indigo-500/10' },
];

const RECENT_CONTENT = [
  { id: 'rc-1', title: 'Théorème de Pythagore', type: 'Théorème', subject: 'Mathématiques', status: 'Généré', date: 'Il y a 10 min' },
  { id: 'rc-2', title: 'Cycle de l\'eau', type: 'Schéma', subject: 'SVT', status: 'En cours', date: 'Il y a 15 min' },
  { id: 'rc-3', title: 'Guerre Froide - Résumé', type: 'Résumé', subject: 'Histoire', status: 'Généré', date: 'Il y a 1 heure' },
  { id: 'rc-4', title: 'Lois de Newton', type: 'Formule', subject: 'Physique-Chimie', status: 'Généré', date: 'Il y a 2 heures' },
  { id: 'rc-5', title: 'Figures de style', type: 'Définition', subject: 'Français', status: 'Généré', date: 'Il y a 3 heures' },
];

export default function AICatalogPage() {
  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader 
        title="Catalogue pédagogique IA" 
        description="Gérez les types d'éléments de contenu générés et analysés par vos agents IA."
        breadcrumbs={[{ label: 'Intelligence Artificielle' }, { label: 'Catalogue pédagogique' }]}
        actions={<Button className="gap-2"><Plus className="h-4 w-4" />Nouvelle catégorie</Button>}
      />

      {/* KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
        <motion.div variants={fadeUp} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Contenus générés</p>
              <p className="mt-2 text-3xl font-bold">9 165</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Brain className="h-5 w-5" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Catégories actives</p>
              <p className="mt-2 text-3xl font-bold">8</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Score de qualité moyen</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">94%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Grid */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Catégories du catalogue</h2>
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATALOG_CATEGORIES.map((cat) => (
            <motion.div key={cat.id} variants={fadeUp} className="group flex flex-col justify-between rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", cat.color)}>
                    {cat.icon}
                  </div>
                  <Badge variant="secondary" className="font-mono">{cat.count.toLocaleString('fr-FR')}</Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold">{cat.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Demande</span>
                  <span className="font-medium">{cat.usage}%</span>
                </div>
                <Progress value={cat.usage} className="h-1.5" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent Content */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Contenu récent</h2>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
          <div className="divide-y divide-border/40">
            {RECENT_CONTENT.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{item.subject}</span>
                      <span>•</span>
                      <span>{item.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={item.status === 'Généré' ? 'default' : 'secondary'} className={item.status === 'Généré' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}>
                    {item.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground min-w-[80px] text-right">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
