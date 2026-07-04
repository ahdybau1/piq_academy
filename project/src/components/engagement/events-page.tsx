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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Plus,
  Users,
  Clock,
  Trophy,
  FileText,
  Edit,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const EVENT_TYPE_CONFIG = {
  mock_exam: { label: 'Examen blanc', color: 'bg-blue-100 text-blue-700', icon: <FileText className="h-4 w-4" /> },
  olympiad: { label: 'Olympiade', color: 'bg-violet-100 text-violet-700', icon: <Trophy className="h-4 w-4" /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700' },
  registration_open: { label: 'Inscriptions ouvertes', color: 'bg-emerald-100 text-emerald-700' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  grading: { label: 'Correction', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Terminé', color: 'bg-slate-100 text-slate-700' },
};

export default function EventsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Événements"
          description="Examens blancs et Olympiades"
          breadcrumbs={[
            { label: 'Engagement' },
            { label: 'Événements' },
          ]}
          actions={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Événements actifs</p>
                  <p className="text-2xl font-bold">{MOCK_EVENTS.filter(e => e.status === 'registration_open' || e.status === 'in_progress').length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inscriptions (mois)</p>
                  <p className="text-2xl font-bold">3,420</p>
                </div>
                <Users className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En correction</p>
                  <p className="text-2xl font-bold text-amber-600">1</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terminés</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <CheckCircle className="h-8 w-8 text-slate-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="mock_exam">Examens blancs</TabsTrigger>
            <TabsTrigger value="olympiad">Olympiades</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_EVENTS.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG].icon}
                        <Badge variant="outline" className={EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG].color}>
                          {EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG].label}
                        </Badge>
                      </div>
                      <Badge variant="outline" className={STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG].color}>
                        {STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG].label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{event.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {event.classes.slice(0, 3).map((cls, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {cls === 'cTle' ? 'Terminale' : cls === 'c1ere' ? '1ère' : cls === 'c3e' ? '3ème' : cls}
                        </Badge>
                      ))}
                      {event.classes.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{event.classes.length - 3}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Début</p>
                        <p className="font-medium">{new Date(event.startDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fin</p>
                        <p className="font-medium">{new Date(event.endDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tarif</p>
                        <p className="font-medium">{event.price.toLocaleString()} FCFA</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clôture inscr.</p>
                        <p className="font-medium">{new Date(event.registrationDeadline).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="mock_exam" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {MOCK_EVENTS.filter(e => e.type === 'mock_exam').map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="olympiad" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {MOCK_EVENTS.filter(e => e.type === 'olympiad').map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Créer un événement</DialogTitle>
              <DialogDescription>
                Configurez un nouvel événement (examen blanc ou olympiade)
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mock_exam">Examen blanc</SelectItem>
                      <SelectItem value="olympiad">Olympiade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">Cameroun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nom de l'événement</Label>
                <Input placeholder="Ex: Bac Blanc National 2025" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Date de fin</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clôture des inscriptions</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Tarif (FCFA)</Label>
                  <Input type="number" placeholder="5000" />
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
