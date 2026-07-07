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
  FileScan,
  Mic,
  Touchpad,
  Settings2,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { MOCK_COMPOSITION_MODALITIES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { CompositionModalityConfig } from '@/lib/types';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };
const rowItem: Variants = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } };

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  paper_scan: {
    label: 'Scan papier',
    icon: <FileScan className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    description: 'Scan de copies papier soumises par les élèves'
  },
  oral_recording: {
    label: 'Enregistrement oral',
    icon: <Mic className="h-5 w-5" />,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    description: 'Enregistrement audio des réponses orales'
  },
  interactive: {
    label: 'Interactive tablette',
    icon: <Touchpad className="h-5 w-5" />,
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    description: 'Composition interactive sur tablette'
  },
};

export default function CompositionModalitiesPage() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<CompositionModalityConfig | null>(null);

  return (
    <>
      <div className="min-h-full space-y-8 pb-12">
        <PageHeader
          title="Modalités de composition étendues"
          description="Configuration des paramètres pour les modes de réponse alternatifs (scan papier, oral, tablette)"
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Modalités de composition' },
          ]}
          actions={
            <Button size="sm" className="gap-2" onClick={() => setShowEditDialog(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle configuration
            </Button>
          }
        />

        {/* Overview Cards */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-3">
          {Object.entries(TYPE_CONFIG).map(([key, config]) => {
            const active = MOCK_COMPOSITION_MODALITIES.find(m => m.type === key)?.active;
            return (
              <motion.div key={key} variants={fadeUp} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', config.color)}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{config.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                    <Badge className={cn('border-0 mt-2', active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')}>
                      {active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Detailed Configuration */}
        <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/40 p-5">
            <p className="font-semibold">Configurations détaillées</p>
            <p className="text-sm text-muted-foreground mt-0.5">Paramètres techniques pour chaque modalité de composition</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 bg-muted/30">
                <TableHead>Modalité</TableHead>
                <TableHead>Paramètres</TableHead>
                <TableHead>Seuil qualité</TableHead>
                <TableHead>Durée max</TableHead>
                <TableHead>Taille max</TableHead>
                <TableHead>Formats</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_COMPOSITION_MODALITIES.map((config) => (
                <TableRow key={config.id} className="border-border/40 hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TYPE_CONFIG[config.type].color)}>
                        {TYPE_CONFIG[config.type].icon}
                      </div>
                      <div>
                        <p className="font-medium">{config.name}</p>
                        <p className="text-xs text-muted-foreground">{TYPE_CONFIG[config.type].label}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {config.type === 'paper_scan' && (
                        <>
                          <p>Résolution: {config.qualityThreshold} DPI</p>
                          <p className="text-muted-foreground">Qualité minimale</p>
                        </>
                      )}
                      {config.type === 'oral_recording' && (
                        <>
                          <p>{config.maxDuration ? Math.floor(config.maxDuration / 60) : '-'} min max</p>
                          <p className="text-muted-foreground">Durée d&apos;enregistrement</p>
                        </>
                      )}
                      {config.type === 'interactive' && (
                        <>
                          <p>{config.maxDuration ? Math.floor(config.maxDuration / 60) : '-'} min</p>
                          <p className="text-muted-foreground">Temps de session</p>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {config.qualityThreshold ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${(config.qualityThreshold / 300) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{config.qualityThreshold} DPI</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {config.maxDuration ? (
                      <span className="font-medium">
                        {Math.floor(config.maxDuration / 60)} min {config.maxDuration % 60 > 0 ? `${config.maxDuration % 60}s` : ''}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {config.maxFileSize ? (
                      <span className="font-medium">{config.maxFileSize} MB</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {config.allowedFormats.map(format => (
                        <Badge key={format} variant="secondary" className="text-xs uppercase">
                          {format}
                        </Badge>
                      ))}
                      {config.allowedFormats.length === 0 && (
                        <span className="text-muted-foreground text-sm">Tous</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('border-0', config.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')}>
                      {config.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedConfig(config); setShowEditDialog(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { setSelectedConfig(config); setShowDeleteDialog(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Quality Guidelines */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2">
          <motion.div variants={rowItem} className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <p className="flex items-center gap-2 font-semibold">
              <FileScan className="h-5 w-5 text-blue-600" />
              Scan papier - Directives
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">Recommandations pour la qualité des scans</p>
            <ul className="space-y-2 text-sm mt-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                <span>Résolution minimale: 150 DPI pour une lecture correcte</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                <span>Résolution recommandée: 300 DPI pour une qualité optimale</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <span>Éviter les scans flous ou présentant des ombres</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <span>Format PDF préféré pour les copies multiples</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={rowItem} className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <p className="flex items-center gap-2 font-semibold">
              <Mic className="h-5 w-5 text-amber-600" />
              Enregistrement oral - Directives
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">Recommandations pour les soumissions audio</p>
            <ul className="space-y-2 text-sm mt-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                <span>Durée maximale configurable par type d&apos;exercice</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                <span>Formats acceptés: MP3, WAV, M4A</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <span>Enregistrer dans un environnement calme</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <span>Éviter les coupures réseau pendant l&apos;enregistrement</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Processing Settings */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
          <p className="flex items-center gap-2 font-semibold">
            <Settings2 className="h-5 w-5" />
            Paramètres de traitement
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">Configuration du système de réception et traitement</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
              <div>
                <p className="font-medium">Validation automatique des soumissions</p>
                <p className="text-sm text-muted-foreground">
                  Vérifier automatiquement la qualité et le format des fichiers soumis
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
              <div>
                <p className="font-medium">Notification en cas de rejet</p>
                <p className="text-sm text-muted-foreground">
                  Envoyer une notification à l&apos;élève si sa soumission est rejetée
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
              <div>
                <p className="font-medium">Tentatives autorisées</p>
                <p className="text-sm text-muted-foreground">
                  Nombre de tentatives de soumission en cas d&apos;erreur
                </p>
              </div>
              <Select defaultValue="3">
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedConfig ? 'Modifier la configuration' : 'Nouvelle configuration'}
            </DialogTitle>
            <DialogDescription>
              Configurer les paramètres de la modalité de composition
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de la configuration</Label>
              <Input defaultValue={selectedConfig?.name || ''} placeholder="Ex: Scan papier haute qualité" />
            </div>
            <div className="space-y-2">
              <Label>Type de modalité</Label>
              <Select
                items={Object.fromEntries(Object.entries(TYPE_CONFIG).map(([key, config]) => [key, config.label]))}
                defaultValue={selectedConfig?.type || 'paper_scan'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seuil de qualité (DPI)</Label>
                <Input type="number" defaultValue={selectedConfig?.qualityThreshold || 150} />
                <p className="text-xs text-muted-foreground">Pour scan papier uniquement</p>
              </div>
              <div className="space-y-2">
                <Label>Durée maximale (secondes)</Label>
                <Input type="number" defaultValue={selectedConfig?.maxDuration || 300} />
                <p className="text-xs text-muted-foreground">Pour oral et interactive</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Taille maximale fichier (MB)</Label>
              <Input type="number" defaultValue={selectedConfig?.maxFileSize || 10} />
            </div>
            <div className="space-y-2">
              <Label>Formats autorisés</Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg border">
                {['pdf', 'jpg', 'png', 'mp3', 'wav', 'm4a'].map(format => (
                  <label key={format} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded"
                      defaultChecked={selectedConfig?.allowedFormats.includes(format) || false}
                    />
                    <span className="uppercase">{format}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Configuration active</Label>
              <Switch defaultChecked={selectedConfig?.active ?? true} />
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
              Êtes-vous sûr de vouloir supprimer cette configuration ?
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
