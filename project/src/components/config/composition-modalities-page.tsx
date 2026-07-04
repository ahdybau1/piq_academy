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
  Presentation,
  FileScan,
  Mic,
  Touchpad,
  Settings2,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { MOCK_COMPOSITION_MODALITIES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { CompositionModalityConfig } from '@/lib/types';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  paper_scan: {
    label: 'Scan papier',
    icon: <FileScan className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-700',
    description: 'Scan de copies papier soumises par les élèves'
  },
  oral_recording: {
    label: 'Enregistrement oral',
    icon: <Mic className="h-5 w-5" />,
    color: 'bg-amber-100 text-amber-700',
    description: 'Enregistrement audio des réponses orales'
  },
  interactive: {
    label: 'Interactive tablette',
    icon: <Touchpad className="h-5 w-5" />,
    color: 'bg-violet-100 text-violet-700',
    description: 'Composition interactive sur tablette'
  },
};

export default function CompositionModalitiesPage() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<CompositionModalityConfig | null>(null);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Modalités de composition étendues"
          description="Configuration des paramètres pour les modes de réponse alternatifs (scan papier, oral, tablette)"
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Modalités de composition' },
          ]}
        />

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
            <Card key={key}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-lg', config.color)}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{config.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className={MOCK_COMPOSITION_MODALITIES.find(m => m.type === key)?.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600'}>
                        {MOCK_COMPOSITION_MODALITIES.find(m => m.type === key)?.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Configurations détaillées</CardTitle>
                <CardDescription>
                  Paramètres techniques pour chaque modalité de composition
                </CardDescription>
              </div>
              <Button onClick={() => setShowEditDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle configuration
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', TYPE_CONFIG[config.type].color)}>
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
                          <div className="w-16 h-2 rounded-full bg-slate-200">
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
                      <Badge variant="outline" className={config.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600'}>
                        {config.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedConfig(config); setShowEditDialog(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setSelectedConfig(config); setShowDeleteDialog(true); }}>
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

        {/* Quality Guidelines */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileScan className="h-5 w-5 text-blue-600" />
                Scan papier - Directives
              </CardTitle>
              <CardDescription>
                Recommandations pour la qualité des scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-amber-600" />
                Enregistrement oral - Directives
              </CardTitle>
              <CardDescription>
                Recommandations pour les soumissions audio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
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
            </CardContent>
          </Card>
        </div>

        {/* Processing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Paramètres de traitement
            </CardTitle>
            <CardDescription>
              Configuration du système de réception et traitement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Validation automatique des soumissions</p>
                  <p className="text-sm text-muted-foreground">
                    Vérifier automatiquement la qualité et le format des fichiers soumis
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Notification en cas de rejet</p>
                  <p className="text-sm text-muted-foreground">
                    Envoyer une notification à l&apos;élève si sa soumission est rejetée
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
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
          </CardContent>
        </Card>
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
              <Select defaultValue={selectedConfig?.type || 'paper_scan'}>
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
