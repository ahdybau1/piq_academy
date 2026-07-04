'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  MessageSquareWarning,
  BarChart3,
} from 'lucide-react';
import { MOCK_CONTENT_VALIDATION } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700', icon: <Clock className="h-4 w-4" /> },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-4 w-4" /> },
  correction: { label: 'À corriger', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-4 w-4" /> },
  published: { label: 'Publié', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> },
};

export default function ValidationQueuePage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof MOCK_CONTENT_VALIDATION[0] | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filteredItems = MOCK_CONTENT_VALIDATION.filter(item => {
    if (activeTab !== 'all' && item.status !== activeTab) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: MOCK_CONTENT_VALIDATION.length,
    pending: MOCK_CONTENT_VALIDATION.filter(i => i.status === 'pending').length,
    correction: MOCK_CONTENT_VALIDATION.filter(i => i.status === 'correction').length,
    published: MOCK_CONTENT_VALIDATION.filter(i => i.status === 'published').length,
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="File de validation de contenu"
          description="Validez ou rejetez le contenu soumis par les enseignants"
          breadcrumbs={[
            { label: 'Validation' },
            { label: 'File de validation' },
          ]}
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('pending')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('correction')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">À corriger</p>
                  <p className="text-2xl font-bold text-red-600">{stats.correction}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('published')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Publiés</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.published}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('all')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Content List */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="pending">En attente</TabsTrigger>
                    <TabsTrigger value="correction">À corriger</TabsTrigger>
                    <TabsTrigger value="published">Publiés</TabsTrigger>
                    <TabsTrigger value="all">Tous</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="relative w-[250px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      'flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md',
                      selectedItem?.id === item.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.author} - {item.subject} - {item.class}
                          </p>
                        </div>
                        <Badge variant="outline" className={STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].color}>
                          <span className="flex items-center gap-1">
                            {STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].icon}
                            {STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].label}
                          </span>
                        </Badge>
                      </div>
                      {item.aiReport && (
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Qualité:</span>
                            <span className={cn(
                              'font-medium',
                              item.aiReport.quality >= 80 ? 'text-emerald-600' : 'text-amber-600'
                            )}>
                              {item.aiReport.quality}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Complétude:</span>
                            <span className={cn(
                              'font-medium',
                              item.aiReport.completeness >= 80 ? 'text-emerald-600' : 'text-amber-600'
                            )}>
                              {item.aiReport.completeness}%
                            </span>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Soumis le {new Date(item.submittedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedItem ? 'Détails du contenu' : 'Sélectionnez un élément'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
                <div className="space-y-6">
                  {/* Content Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedItem.title}</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Type:</span> {selectedItem.type === 'lesson' ? 'Cours' : selectedItem.type === 'exercise' ? 'Exercice' : 'Examen'}</p>
                      <p><span className="text-muted-foreground">Auteur:</span> {selectedItem.author}</p>
                      <p><span className="text-muted-foreground">Matière:</span> {selectedItem.subject}</p>
                      <p><span className="text-muted-foreground">Classe:</span> {selectedItem.class}</p>
                    </div>
                  </div>

                  {/* AI Report */}
                  {selectedItem.aiReport && (
                    <div className="border-t pt-4 space-y-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Rapport de pré-analyse IA
                      </p>
                      <div className="grid gap-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Qualité</span>
                            <span className="font-medium">{selectedItem.aiReport.quality}%</span>
                          </div>
                          <Progress
                            value={selectedItem.aiReport.quality}
                            className={cn('h-2', selectedItem.aiReport.quality >= 80 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-amber-500')}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Complétude</span>
                            <span className="font-medium">{selectedItem.aiReport.completeness}%</span>
                          </div>
                          <Progress
                            value={selectedItem.aiReport.completeness}
                            className={cn('h-2', selectedItem.aiReport.completeness >= 80 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-amber-500')}
                          />
                        </div>
                      </div>
                      {selectedItem.aiReport.errors.length > 0 && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                          <p className="text-xs font-medium text-red-800 mb-1">Erreurs détectées:</p>
                          <ul className="text-xs text-red-700 list-disc list-inside space-y-0.5">
                            {selectedItem.aiReport.errors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Aperçu
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    </div>
                    {selectedItem.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                    {(selectedItem.status === 'correction' || selectedItem.status === 'draft') && (
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez un contenu pour voir les détails</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter le contenu</DialogTitle>
              <DialogDescription>
                Veuillez indiquer la raison du rejet. Ce message sera envoyé à l'auteur.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="reject-reason">Motif du rejet</Label>
              <Textarea
                id="reject-reason"
                placeholder="Ex: Le contenu contient des erreurs factuelles dans la section 2..."
                className="mt-2"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={() => setShowRejectDialog(false)}>
                Confirmer le rejet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
