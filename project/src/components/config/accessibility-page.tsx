'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Accessibility,
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

const CONTENT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  lesson: { label: 'Cours', color: 'bg-blue-100 text-blue-700' },
  exercise: { label: 'Exercice', color: 'bg-emerald-100 text-emerald-700' },
  exam: { label: 'Examen', color: 'bg-purple-100 text-purple-700' },
};

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
      <div className="space-y-6">
        <PageHeader
          title="Configuration accessibilité"
          description="Vérification de conformité du contenu et statistiques d&apos;usage des fonctionnalités d&apos;accessibilité"
          breadcrumbs={[
            { label: 'Configuration' },
            { label: 'Accessibilité' },
          ]}
        />

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contenu total</p>
                  <p className="text-2xl font-bold">{MOCK_ACCESSIBILITY_STATS.totalContent.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conforme</p>
                  <p className="text-2xl font-bold text-emerald-600">{MOCK_ACCESSIBILITY_STATS.compliantContent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{complianceRate.toFixed(1)}% du total</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente de vérification</p>
                  <p className="text-2xl font-bold text-amber-600">{MOCK_ACCESSIBILITY_STATS.pendingChecks}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Non conforme</p>
                  <p className="text-2xl font-bold text-red-600">
                    {MOCK_ACCESSIBILITY_STATS.totalContent - MOCK_ACCESSIBILITY_STATS.compliantContent - MOCK_ACCESSIBILITY_STATS.pendingChecks}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="checks">Vérifications</TabsTrigger>
            <TabsTrigger value="usage">Usage élève</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Global Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Taux de conformité global</CardTitle>
                <CardDescription>
                  Pourcentage de contenu respectant les standards d&apos;accessibilité WCAG 2.1 AA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={complianceRate} className="h-4" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {MOCK_ACCESSIBILITY_STATS.compliantContent.toLocaleString()} éléments conformes
                    </span>
                    <span className="font-medium">{complianceRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Criteria Checklist */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Critères visuels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Alternatives textuelles</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Contraste suffisant</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Taille de police ajustable</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Mode contraste élevé</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ear className="h-5 w-5 text-amber-600" />
                    Critères audio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Captions className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Sous-titres vidéos</span>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Transcriptions audio</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ear className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Descriptions audio</span>
                      </div>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Lecteur d&apos;écran compatible</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="checks" className="space-y-4 mt-4">
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
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                      <TableRow key={check.id}>
                        <TableCell>
                          <button
                            className="text-left hover:text-primary"
                            onClick={() => setSelectedCheck(check)}
                          >
                            <p className="font-medium">{check.contentTitle}</p>
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={CONTENT_TYPE_CONFIG[check.contentType].color}>
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
                            <div className="w-16 h-2 rounded-full bg-slate-200">
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
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {check.issues.length} problème(s)
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Voir détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Utilisation des fonctionnalités d&apos;accessibilité</CardTitle>
                <CardDescription>
                  Nombre d&apos;élèves utilisant chaque fonctionnalité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <Eye className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Lecteur d&apos;écran</p>
                        <p className="text-sm text-muted-foreground">Compatible NVDA, JAWS, VoiceOver</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{MOCK_ACCESSIBILITY_STATS.featuresUsage.screenReader}</p>
                      <p className="text-sm text-muted-foreground">utilisateurs actifs</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-slate-100">
                        <Monitor className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium">Contraste élevé</p>
                        <p className="text-sm text-muted-foreground">Mode sombre / contraste renforcé</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{MOCK_ACCESSIBILITY_STATS.featuresUsage.highContrast}</p>
                      <p className="text-sm text-muted-foreground">utilisateurs actifs</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-emerald-100">
                        <Volume2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Synthèse vocale</p>
                        <p className="text-sm text-muted-foreground">Lecture à haute voix du contenu</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{MOCK_ACCESSIBILITY_STATS.featuresUsage.textToSpeech}</p>
                      <p className="text-sm text-muted-foreground">utilisateurs actifs</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-amber-100">
                        <Captions className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sous-titres</p>
                        <p className="text-sm text-muted-foreground">Affichage des sous-titres sur vidéos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{MOCK_ACCESSIBILITY_STATS.featuresUsage.subtitles}</p>
                      <p className="text-sm text-muted-foreground">utilisateurs actifs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration des fonctionnalités</CardTitle>
                <CardDescription>
                  Activation/désactivation des options d&apos;accessibilité côté élève
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Mode dyslexie</p>
                      <p className="text-sm text-muted-foreground">Police adaptée et espacement renforcé</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Navigation au clavier uniquement</p>
                      <p className="text-sm text-muted-foreground">Toutes les actions accessibles via clavier</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Réduction des animations</p>
                      <p className="text-sm text-muted-foreground">Désactive les animations et transitions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Mode daltonisme</p>
                      <p className="text-sm text-muted-foreground">Palettes de couleurs adaptées</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Check Detail Dialog */}
      <Dialog open={!!selectedCheck} onOpenChange={() => setSelectedCheck(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de conformité</DialogTitle>
          </DialogHeader>
          {selectedCheck && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-slate-50 border p-4">
                <p className="font-medium">{selectedCheck.contentTitle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={CONTENT_TYPE_CONFIG[selectedCheck.contentType].color}>
                    {CONTENT_TYPE_CONFIG[selectedCheck.contentType].label}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    selectedCheck.complianceScore >= 80 ? 'bg-emerald-50 text-emerald-700' :
                    selectedCheck.complianceScore >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
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
                <div className="border-t pt-4">
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
