'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  MessageSquare,
  Plus,
  Users,
  Link,
  Edit,
  ToggleLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { MOCK_WHATSAPP_COMMUNITIES } from '@/lib/mock-data';

export default function WhatsAppCommunitiesPage() {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  const totalMembers = MOCK_WHATSAPP_COMMUNITIES.reduce((acc, c) => acc + c.memberCount, 0);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Communautés WhatsApp"
          description="Gérez les liens des communautés WhatsApp par classe"
          breadcrumbs={[
            { label: 'Engagement' },
            { label: 'Communautés WhatsApp' },
          ]}
          actions={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle communauté
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total communautés</p>
                  <p className="text-2xl font-bold">{MOCK_WHATSAPP_COMMUNITIES.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Membres estimés</p>
                  <p className="text-2xl font-bold">{totalMembers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actives</p>
                  <p className="text-2xl font-bold text-emerald-600">{MOCK_WHATSAPP_COMMUNITIES.filter(c => c.active).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liens par classe</CardTitle>
            <CardDescription>Gérez les liens d'invitation aux communautés WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead>Lien</TableHead>
                  <TableHead>Membres</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_WHATSAPP_COMMUNITIES.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell className="font-medium">{community.className}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Link className="h-3 w-3 text-muted-foreground" />
                        <span className="text-primary truncate max-w-[200px]">{community.link}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{community.memberCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={community.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'}>
                        {community.active ? 'Actif' : 'Désactivé'}
                      </Badge>
                    </TableCell>
                    <TableCell>{community.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ToggleLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une communauté</DialogTitle>
              <DialogDescription>
                Ajoutez un lien d'invitation WhatsApp pour une classe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="class">Classe</Label>
                <Input id="class" placeholder="Ex: Terminale C" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Lien d'invitation WhatsApp</Label>
                <Input id="link" placeholder="https://chat.whatsapp.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="members">Nombre de membres (estimation)</Label>
                <Input id="members" type="number" placeholder="Ex: 50" />
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
