'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Eye,
  Ear,
  Type,
  Captions,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  EyeOff,
  Volume2,
  Monitor,
  Loader2,
} from 'lucide-react';
import { MOCK_ACCESSIBILITY_CHECKS, MOCK_ACCESSIBILITY_STATS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { AccessibilityCheck } from '@/lib/types';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const CONTENT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  lesson: { label: 'Cours', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  exercise: { label: 'Exercice', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  exam: { label: 'Examen', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

const VISUAL_CRITERIA = [
  { icon: <Type className="h-4 w-4" />, label: 'Alternatives textuelles', ok: true },
  { icon: <Monitor className="h-4 w-4" />, label: 'Contraste suffisant', ok: true },
  { icon: <Type className="h-4 w-4" />, label: 'Taille de police ajustable', ok: true },
  { icon: <EyeOff className="h-4 w-4" />, label: 'Mode contraste élevé', ok: true },
];

const AUDIO_CRITERIA = [
  { icon: <Captions className="h-4 w-4" />, label: 'Sous-titres vidéos', ok: false },
  { icon: <Volume2 className="h-4 w-4" />, label: 'Transcriptions audio', ok: true },
  { icon: <Ear className="h-4 w-4" />, label: 'Descriptions audio', ok: false },
  { icon: <FileText className="h-4 w-4" />, label: 'Lecteur d\'écran compatible', ok: true },
];

const FEATURE_SETTINGS = [
  { label: 'Mode dyslexie', desc: 'Police adaptée et espacement renforcé' },
  { label: 'Navigation au clavier uniquement', desc: 'Toutes les actions accessibles via clavier' },
  { label: 'Réduction des animations', desc: 'Désactive les animations et transitions' },
  { label: 'Mode daltonisme', desc: 'Palettes de couleurs adaptées' },
];

export default function AccessibilityPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCheck, setSelectedCheck] = useState<AccessibilityCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const complianceRate = MOCK_ACCESSIBILITY_STATS.compliantContent / MOCK_ACCESSIBILITY_STATS.totalContent * 100;

  const handleRunCheck = () => {
    setIsChecking(true);
    setTimeout(() => setIsChecking(false), 3000);
  };

  return (
    <>
      <div className="min-h-full space-y-8 pb-12">
        <PageHeader
          title="Configuration accessibilité"
          description="Vérification de conformité du contenu et statistiques d&apos;usage des fonctionnalités d&apos;accessibilité"
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Accessibilité' },
          ]}
        />

        {/* KPI Strip */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Contenu total', value: MOCK_ACCESSIBILITY_STATS.totalContent.toLocaleString('fr-FR'), icon: <FileText className="h-5 w-5" />, bg: 'bg-slate-500/10', color: 'text-slate-600 dark:text-slate-400' },
            { label: 'Conforme', value: MOCK_ACCESSIBILITY_STATS.compliantContent.toLocaleString('fr-FR'), sub: `${complianceRate.toFixed(1)}% du total`, icon: <CheckCircle className="h-5 w-5" />, bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
            { label: 'En attente', value: MOCK_ACCESSIBILITY_STATS.pendingChecks.toString(), icon: <AlertTriangle className="h-5 w-5" />, bg: 'bg-amber-500/10', color: 'text-amber-500' },
            { label: 'Non conforme', value: (MOCK_ACCESSIBILITY_STATS.totalContent - MOCK_ACCESSIBILITY_STATS.compliantContent - MOCK_ACCESSIBILITY_STATS.pendingChecks).toString(), icon: <XCircle className="h-5 w-5" />, bg: 'bg-red-500/10', color: 'text-red-500' },
          ].map((kpi) => (
            <motion.div key={kpi.label} variants={fadeUp}
              className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
                  {kpi.sub && <p className="mt-0.5 text-xs text-muted-foreground">{kpi.sub}</p>}
                </div>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ml-3', kpi.bg, kpi.color)}>
                  {kpi.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/40">
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="checks">Vérifications</TabsTrigger>
            <TabsTrigger value="usage">Usage élève</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Global Progress */}
            <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <p className="font-semibold">Taux de conformité global</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Pourcentage de contenu respectant les standards d&apos;accessibilité WCAG 2.1 AA
              </p>
              <div className="mt-4 space-y-2">
                <Progress value={complianceRate} className="h-4" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {MOCK_ACCESSIBILITY_STATS.compliantContent.toLocaleString('fr-FR')} éléments conformes
                  </span>
                  <span className="font-medium">{complianceRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Criteria Checklist */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
                <p className="flex items-center gap-2 font-semibold mb-4">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Critères visuels
                </p>
                <div className="space-y-3">
                  {VISUAL_CRITERIA.map((c) => (
                    <div key={c.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {c.icon}
                        <span className="text-sm text-foreground">{c.label}</span>
                      </div>
                      {c.ok ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
                <p className="flex items-center gap-2 font-semibold mb-4">
                  <Ear className="h-5 w-5 text-amber-600" />
                  Critères audio
                </p>
                <div className="space-y-3">
                  {AUDIO_CRITERIA.map((c) => (
                    <div key={c.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {c.icon}
                        <span className="text-sm text-foreground">{c.label}</span>
                      </div>
                      {c.ok
                        ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                        : c.label.includes('Sous-titres')
                          ? <AlertTriangle className="h-4 w-4 text-amber-600" />
                          : <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Résultats des vérifications</h3>
              <Button onClick={handleRunCheck} disabled={isChecking}>
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Lancer une vérification
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 bg-muted/30">
                    <TableHead>Contenu</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sous-titres</TableHead>
                    <TableHead>Alt text</TableHead>
                    <TableHead>Transcription</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Problèmes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_ACCESSIBILITY_CHECKS.map((check) => (
                    <TableRow key={check.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell>
                        <button
                          className="text-left hover:text-primary"
                          onClick={() => setSelectedCheck(check)}
                        >
                          <p className="font-medium">{check.contentTitle}</p>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('border-0', CONTENT_TYPE_CONFIG[check.contentType].color)}>
                          {CONTENT_TYPE_CONFIG[check.contentType].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {check.hasSubtitles ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {check.hasAltText ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {check.hasTranscript ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-muted">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                check.complianceScore >= 80 ? 'bg-emerald-500' :
                                check.complianceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              )}
                              style={{ width: `${check.complianceScore}%` }}
                            />
                          </div>
                          <span className={cn(
                            'font-medium text-sm',
                            check.complianceScore >= 80 ? 'text-emerald-600' :
                            check.complianceScore >= 50 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {check.complianceScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {check.issues.length > 0 ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
                            {check.issues.length} problème(s)
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCheck(check)}>
                          Voir détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <p className="font-semibold">Utilisation des fonctionnalités d&apos;accessibilité</p>
              <p className="text-sm text-muted-foreground mt-0.5">Nombre d&apos;élèves utilisant chaque fonctionnalité</p>
              <div className="mt-6 space-y-6">
                {[
                  { label: 'Lecteur d\'écran', desc: 'Compatible NVDA, JAWS, VoiceOver', icon: <Eye className="h-6 w-6" />, bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', value: MOCK_ACCESSIBILITY_STATS.featuresUsage.screenReader },
                  { label: 'Contraste élevé', desc: 'Mode sombre / contraste renforcé', icon: <Monitor className="h-6 w-6" />, bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', value: MOCK_ACCESSIBILITY_STATS.featuresUsage.highContrast },
                  { label: 'Synthèse vocale', desc: 'Lecture à haute voix du contenu', icon: <Volume2 className="h-6 w-6" />, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', value: MOCK_ACCESSIBILITY_STATS.featuresUsage.textToSpeech },
                  { label: 'Sous-titres', desc: 'Affichage des sous-titres sur vidéos', icon: <Captions className="h-6 w-6" />, bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', value: MOCK_ACCESSIBILITY_STATS.featuresUsage.subtitles },
                ].map((f) => (
                  <div key={f.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', f.bg)}>
                        {f.icon}
                      </div>
                      <div>
                        <p className="font-medium">{f.label}</p>
                        <p className="text-sm text-muted-foreground">{f.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{f.value}</p>
                      <p className="text-sm text-muted-foreground">utilisateurs actifs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Settings */}
            <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <p className="font-semibold">Configuration des fonctionnalités</p>
              <p className="text-sm text-muted-foreground mt-0.5">Activation/désactivation des options d&apos;accessibilité côté élève</p>
              <div className="mt-4 space-y-3">
                {FEATURE_SETTINGS.map((f) => (
                  <div key={f.label} className="flex items-center justify-between rounded-xl border border-border/40 p-4">
                    <div>
                      <p className="font-medium">{f.label}</p>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Check Detail Dialog */}
      <Dialog open={!!selectedCheck} onOpenChange={() => setSelectedCheck(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de conformité</DialogTitle>
          </DialogHeader>
          {selectedCheck && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/40 border border-border/40 p-4">
                <p className="font-medium">{selectedCheck.contentTitle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={cn('border-0', CONTENT_TYPE_CONFIG[selectedCheck.contentType].color)}>
                    {CONTENT_TYPE_CONFIG[selectedCheck.contentType].label}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    selectedCheck.complianceScore >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                    selectedCheck.complianceScore >= 50 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                  )}>
                    Score: {selectedCheck.complianceScore}%
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sous-titres</span>
                  {selectedCheck.hasSubtitles ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Alt text</span>
                  {selectedCheck.hasAltText ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Description audio</span>
                  {selectedCheck.hasAudioDescription ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transcription</span>
                  {selectedCheck.hasTranscript ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {selectedCheck.issues.length > 0 && (
                <div className="border-t border-border/40 pt-4">
                  <p className="font-medium text-sm mb-2">Problèmes détectés</p>
                  <ul className="space-y-2">
                    {selectedCheck.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Dernière vérification: {new Date(selectedCheck.checkedAt).toLocaleString('fr-FR')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
