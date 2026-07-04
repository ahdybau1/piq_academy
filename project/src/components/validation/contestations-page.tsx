'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  X,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Search,
} from 'lucide-react';
import { MOCK_CONTESTATIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  open: { label: 'Ouverte', color: 'bg-amber-100 text-amber-700' },
  reviewing: { label: 'En révision', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: 'Résolue', color: 'bg-emerald-100 text-emerald-700' },
};

export default function ContestationsPage() {
  const [selectedContestation, setSelectedContestation] = useState<typeof MOCK_CONTESTATIONS[0] | null>(null);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decision, setDecision] = useState<'maintained' | 'revised'>('maintained');
  const [decisionReason, setDecisionReason] = useState('');

  const openContestations = MOCK_CONTESTATIONS.filter(c => c.status !== 'resolved');
  const resolvedContestations = MOCK_CONTESTATIONS.filter(c => c.status === 'resolved');

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Contestations de note"
          description="Gérez les contestations de notes soumises par les élèves"
          breadcrumbs={[
            { label: 'Validation' },
            { label: 'Contestations de note' },
          ]}
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ouvertes</p>
                  <p className="text-2xl font-bold text-amber-600">{MOCK_CONTESTATIONS.filter(c => c.status === 'open').length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En révision</p>
                  <p className="text-2xl font-bold text-blue-600">{MOCK_CONTESTATIONS.filter(c => c.status === 'reviewing').length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Résolues</p>
                  <p className="text-2xl font-bold text-emerald-600">{MOCK_CONTESTATIONS.filter(c => c.status === 'resolved').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Délai moyen</p>
                  <p className="text-2xl font-bold">2.3j</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contestations List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Contestations actives</CardTitle>
              <CardDescription>Cliquez sur une contestation pour voir les détails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_CONTESTATIONS.map((contestation) => (
                  <div
                    key={contestation.id}
                    onClick={() => setSelectedContestation(contestation)}
                    className={cn(
                      'rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md',
                      selectedContestation?.id === contestation.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{contestation.studentName}</p>
                        <p className="text-sm text-muted-foreground">Note initiale: {contestation.initialGrade}/20</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={STATUS_CONFIG[contestation.status as keyof typeof STATUS_CONFIG].color}>
                          {STATUS_CONFIG[contestation.status as keyof typeof STATUS_CONFIG].label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Délai: {new Date(contestation.deadline).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contestation.reason}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedContestation ? 'Détails' : 'Sélectionnez une contestation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedContestation ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                      {selectedContestation.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{selectedContestation.studentName}</p>
                      <p className="text-xs text-muted-foreground">ID: {selectedContestation.studentId}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Note initiale</span>
                      <span className="font-medium">{selectedContestation.initialGrade}/20</span>
                    </div>
                    {selectedContestation.contestedGrade && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Note contestée</span>
                        <span className="font-medium">{selectedContestation.contestedGrade}/20</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <Badge variant="outline" className={STATUS_CONFIG[selectedContestation.status as keyof typeof STATUS_CONFIG].color}>
                        {STATUS_CONFIG[selectedContestation.status as keyof typeof STATUS_CONFIG].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Motif de la contestation
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedContestation.reason}</p>
                  </div>

                  {selectedContestation.assignedTo && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Assigné à: </span>
                      <span className="font-medium">Second correcteur</span>
                    </div>
                  )}

                  {/* Resolution */}
                  {selectedContestation.resolution && (
                    <div className="border-t pt-4 space-y-2">
                      <p className="text-sm font-medium">Résolution</p>
                      <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Décision</span>
                          <Badge variant="outline" className={
                            selectedContestation.resolution.decision === 'revised'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }>
                            {selectedContestation.resolution.decision === 'revised' ? 'Note révisée' : 'Note maintenue'}
                          </Badge>
                        </div>
                        {selectedContestation.resolution.newGrade && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nouvelle note</span>
                            <span className="font-medium">{selectedContestation.resolution.newGrade}/20</span>
                          </div>
                        )}
                        <p className="text-muted-foreground">{selectedContestation.resolution.reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {(selectedContestation.status === 'open' || selectedContestation.status === 'reviewing') && (
                    <div className="border-t pt-4 space-y-2">
                      <Button className="w-full" onClick={() => setShowDecisionDialog(true)}>
                        Prendre une décision
                      </Button>
                      <Button variant="outline" className="w-full">
                        Assigner à un second correcteur
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez une contestation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Decision Dialog */}
        <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Décision sur la contestation</DialogTitle>
              <DialogDescription>
                Prenez une décision concernant cette contestation de note
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Décision</Label>
                <Select value={decision} onValueChange={(v) => setDecision(v as 'maintained' | 'revised')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintained">Note maintenue</SelectItem>
                    <SelectItem value="revised">Note révisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {decision === 'revised' && (
                <div className="space-y-2">
                  <Label htmlFor="new-grade">Nouvelle note</Label>
                  <Input id="new-grade" type="number" min="0" max="20" placeholder="Ex: 15" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reason">Motif de la décision</Label>
                <Textarea
                  id="reason"
                  placeholder="Expliquez la raison de votre décision..."
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowDecisionDialog(false)}>
                Confirmer la décision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
