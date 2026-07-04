'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Megaphone, Plus, Edit, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { MOCK_ANNOUNCEMENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const URGENCY_CONFIG = {
  low: { label: 'Basse', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Moyenne', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Haute', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critique', color: 'bg-red-100 text-red-700' },
};

export default function AnnouncementsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Annonces générales"
          description="Gérez les bannières d'annonce affichées sur la plateforme"
          breadcrumbs={[
            { label: 'Engagement' },
            { label: 'Annonces' },
          ]}
          actions={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle annonce
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Annonces actives</p>
                  <p className="text-2xl font-bold">{MOCK_ANNOUNCEMENTS.filter(a => a.active).length}</p>
                </div>
                <Megaphone className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Programmées</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critiques</p>
                  <p className="text-2xl font-bold text-red-600">{MOCK_ANNOUNCEMENTS.filter(a => a.urgency === 'critical').length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Annonces</CardTitle>
            <CardDescription>Liste des annonces actives et passées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_ANNOUNCEMENTS.map((announcement) => (
                <div key={announcement.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <Badge variant="outline" className={URGENCY_CONFIG[announcement.urgency as keyof typeof URGENCY_CONFIG].color}>
                          {URGENCY_CONFIG[announcement.urgency as keyof typeof URGENCY_CONFIG].label}
                        </Badge>
                        {announcement.active && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{announcement.content}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Du {announcement.startDate} au {announcement.endDate}</span>
                    <span>Ciblage: {announcement.targetCountries.join(', ') || 'Tous pays'}</span>
                    {announcement.targetClasses.length > 0 && (
                      <span>Classes: {announcement.targetClasses.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle annonce</DialogTitle>
              <DialogDescription>
                Créez une bannière d'annonce
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input placeholder="Ex: Maintenance programmée" />
              </div>
              <div className="space-y-2">
                <Label>Contenu</Label>
                <Textarea placeholder="Message de l'annonce..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Période d'affichage</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Niveau d'urgence</Label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
