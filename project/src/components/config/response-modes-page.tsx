'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const MODE_CONFIG: Record<ResponseModeType, { label: string; icon: React.ReactNode; color: string }> = {
  keyboard: { label: 'Clavier', icon: <Keyboard className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
  qcm: { label: 'QCM', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-700' },
  tablet_handwritten: { label: 'Tablette (manuscrit)', icon: <Tablet className="h-4 w-4" />, color: 'bg-violet-100 text-violet-700' },
  oral: { label: 'Oral', icon: <Mic className="h-4 w-4" />, color: 'bg-amber-100 text-amber-700' },
  mixed: { label: 'Mixte', icon: <ArrowRightLeft className="h-4 w-4" />, color: 'bg-slate-100 text-slate-700' },
};

const EXERCISE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  lesson_linked: { label: 'Lié à un cours', color: 'bg-blue-50 text-blue-700' },
  chapter_linked: { label: 'Lié à un chapitre', color: 'bg-purple-50 text-purple-700' },
  independent: { label: 'Indépendant', color: 'bg-slate-50 text-slate-700' },
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
      <div className="space-y-6">
        <PageHeader
          title="Modes de réponse aux exercices"
          description="Configurez les modes de réponse autorisés par matière et classe (clavier, QCM, tablette, oral)"
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Modes de réponse' },
          ]}
        />

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Configurations par matière/classe</CardTitle>
                <CardDescription>
                  Définissez les modes de réponse disponibles pour chaque combinaison matière-classe-exercice
                </CardDescription>
              </div>
              <Button onClick={() => setShowEditDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle configuration
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-4 border-b">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
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
                <TableRow>
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
                  <TableRow key={mode.id}>
                    <TableCell className="font-medium">{mode.subjectName}</TableCell>
                    <TableCell>{mode.className}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={EXERCISE_TYPE_CONFIG[mode.exerciseType].color}>
                        {EXERCISE_TYPE_CONFIG[mode.exerciseType].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mode.allowedModes.map(m => (
                          <Badge key={m} variant="outline" className={cn('gap-1', MODE_CONFIG[m].color)}>
                            {MODE_CONFIG[m].icon}
                            {MODE_CONFIG[m].label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('gap-1', MODE_CONFIG[mode.defaultMode].color)}>
                        {MODE_CONFIG[mode.defaultMode].icon}
                        {MODE_CONFIG[mode.defaultMode].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={mode.active ? 'default' : 'secondary'} className={mode.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                        {mode.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(mode)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setSelectedMode(mode); setShowDeleteDialog(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Mode Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Légende des modes de réponse</CardTitle>
            <CardDescription>
              Description de chaque mode disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(MODE_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-start gap-3 rounded-lg border p-4">
                  <div className={cn('p-2 rounded-lg', config.color)}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="font-medium">{config.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'keyboard' && 'Saisie textuelle au clavier'}
                      {key === 'qcm' && 'Question à choix multiples'}
                      {key === 'tablet_handwritten' && 'Écriture manuscrite sur tablette'}
                      {key === 'oral' && 'Enregistrement vocal'}
                      {key === 'mixed' && 'Combinaison de plusieurs modes'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                  <Select>
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
                    <Select>
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
                    <Select>
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
                {(Object.entries(MODE_CONFIG) as [ResponseModeType, typeof MODE_CONFIG[keyof typeof MODE_CONFIG]][]).map(([key, config]) => (
                  <div
                    key={key}
                    onClick={() => toggleMode(key)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                      editedModes.includes(key) ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'
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
              <Select defaultValue={editedModes[0] || 'qcm'}>
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
