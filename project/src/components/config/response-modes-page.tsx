'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ArrowRightLeft,
  Keyboard,
  CheckCircle,
  Mic,
  Tablet,
  Plus,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import { MOCK_RESPONSE_MODES, MOCK_SUBJECTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { ExerciseResponseMode, ResponseModeType } from '@/lib/types';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const MODE_CONFIG: Record<ResponseModeType, { label: string; icon: React.ReactNode; color: string }> = {
  keyboard: { label: 'Clavier', icon: <Keyboard className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  qcm: { label: 'QCM', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  tablet_handwritten: { label: 'Tablette (manuscrit)', icon: <Tablet className="h-4 w-4" />, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  oral: { label: 'Oral', icon: <Mic className="h-4 w-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  mixed: { label: 'Mixte', icon: <ArrowRightLeft className="h-4 w-4" />, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

const EXERCISE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  lesson_linked: { label: 'Lié à un cours', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  chapter_linked: { label: 'Lié à un chapitre', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' },
  independent: { label: 'Indépendant', color: 'bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400' },
};

const MODE_DESCRIPTIONS: Record<ResponseModeType, string> = {
  keyboard: 'Saisie textuelle au clavier',
  qcm: 'Question à choix multiples',
  tablet_handwritten: 'Écriture manuscrite sur tablette',
  oral: 'Enregistrement vocal',
  mixed: 'Combinaison de plusieurs modes',
};

export default function ResponseModesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>('all');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ExerciseResponseMode | null>(null);
  const [editedModes, setEditedModes] = useState<ResponseModeType[]>([]);

  const filteredModes = MOCK_RESPONSE_MODES.filter(mode => {
    if (subjectFilter && subjectFilter !== 'all' && mode.subjectId !== subjectFilter) return false;
    if (searchQuery && !mode.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !mode.className.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleEdit = (mode: ExerciseResponseMode) => {
    setSelectedMode(mode);
    setEditedModes([...mode.allowedModes]);
    setShowEditDialog(true);
  };

  const toggleMode = (modeType: ResponseModeType) => {
    setEditedModes(prev =>
      prev.includes(modeType)
        ? prev.filter(m => m !== modeType)
        : [...prev, modeType]
    );
  };

  return (
    <>
      <div className="min-h-full space-y-8 pb-12">
        <PageHeader
          title="Modes de réponse aux exercices"
          description="Configurez les modes de réponse autorisés par matière et classe (clavier, QCM, tablette, oral)"
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Modes de réponse' },
          ]}
          actions={
            <Button size="sm" className="gap-2" onClick={() => setShowEditDialog(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle configuration
            </Button>
          }
        />

        <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 border-b border-border/40 p-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              items={{ all: 'Toutes les matières', ...Object.fromEntries(MOCK_SUBJECTS.map(subject => [subject.id, subject.name])) }}
              value={subjectFilter}
              onValueChange={setSubjectFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {MOCK_SUBJECTS.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 bg-muted/30">
                <TableHead>Matière</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Type d&apos;exercice</TableHead>
                <TableHead>Modes autorisés</TableHead>
                <TableHead>Mode par défaut</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModes.map((mode) => (
                <TableRow key={mode.id} className="border-border/40 hover:bg-muted/30">
                  <TableCell className="font-medium">{mode.subjectName}</TableCell>
                  <TableCell>{mode.className}</TableCell>
                  <TableCell>
                    <Badge className={cn('border-0', EXERCISE_TYPE_CONFIG[mode.exerciseType].color)}>
                      {EXERCISE_TYPE_CONFIG[mode.exerciseType].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {mode.allowedModes.map(m => (
                        <Badge key={m} className={cn('gap-1 border-0', MODE_CONFIG[m].color)}>
                          {MODE_CONFIG[m].icon}
                          {MODE_CONFIG[m].label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('gap-1 border-0', MODE_CONFIG[mode.defaultMode].color)}>
                      {MODE_CONFIG[mode.defaultMode].icon}
                      {MODE_CONFIG[mode.defaultMode].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('border-0', mode.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')}>
                      {mode.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(mode)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { setSelectedMode(mode); setShowDeleteDialog(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredModes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-16">
                    <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    Aucune configuration ne correspond à cette recherche.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mode Legend */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
          <p className="font-semibold">Légende des modes de réponse</p>
          <p className="text-sm text-muted-foreground mt-0.5">Description de chaque mode disponible</p>
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {(Object.entries(MODE_CONFIG) as [ResponseModeType, typeof MODE_CONFIG[ResponseModeType]][]).map(([key, config]) => (
              <motion.div key={key} variants={fadeUp} className="flex items-start gap-3 rounded-xl border border-border/40 p-4">
                <div className={cn('p-2 rounded-lg', config.color)}>
                  {config.icon}
                </div>
                <div>
                  <p className="font-medium">{config.label}</p>
                  <p className="text-sm text-muted-foreground">{MODE_DESCRIPTIONS[key]}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedMode ? 'Modifier la configuration' : 'Nouvelle configuration'}
            </DialogTitle>
            <DialogDescription>
              Sélectionnez les modes de réponse autorisés et le mode par défaut
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!selectedMode && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Matière</Label>
                  <Select items={Object.fromEntries(MOCK_SUBJECTS.map(subject => [subject.id, subject.name]))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_SUBJECTS.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Classe</Label>
                    <Select
                      items={{
                        c6e: '6ème',
                        c5e: '5ème',
                        c4e: '4ème',
                        c3e: '3ème',
                        c2nde: '2nde',
                        c1ere: '1ère',
                        cTle: 'Terminale',
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="c6e">6ème</SelectItem>
                        <SelectItem value="c5e">5ème</SelectItem>
                        <SelectItem value="c4e">4ème</SelectItem>
                        <SelectItem value="c3e">3ème</SelectItem>
                        <SelectItem value="c2nde">2nde</SelectItem>
                        <SelectItem value="c1ere">1ère</SelectItem>
                        <SelectItem value="cTle">Terminale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type d&apos;exercice</Label>
                    <Select
                      items={Object.fromEntries(Object.entries(EXERCISE_TYPE_CONFIG).map(([key, config]) => [key, config.label]))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesson_linked">Lié à un cours</SelectItem>
                        <SelectItem value="chapter_linked">Lié à un chapitre</SelectItem>
                        <SelectItem value="independent">Indépendant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Modes autorisés</Label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(MODE_CONFIG) as [ResponseModeType, typeof MODE_CONFIG[ResponseModeType]][]).map(([key, config]) => (
                  <div
                    key={key}
                    onClick={() => toggleMode(key)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                      editedModes.includes(key) ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                    )}
                  >
                    <div className={cn('p-1.5 rounded', config.color)}>
                      {config.icon}
                    </div>
                    <span className="text-sm font-medium">{config.label}</span>
                    {editedModes.includes(key) && (
                      <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mode par défaut</Label>
              <Select
                items={Object.fromEntries(editedModes.map(m => [m, MODE_CONFIG[m].label]))}
                defaultValue={editedModes[0] || 'qcm'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le mode par défaut" />
                </SelectTrigger>
                <SelectContent>
                  {editedModes.map(m => (
                    <SelectItem key={m} value={m}>
                      <div className="flex items-center gap-2">
                        {MODE_CONFIG[m].icon}
                        {MODE_CONFIG[m].label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Configuration active</Label>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowEditDialog(false)}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la configuration</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette configuration de modes de réponse ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
