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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { History, Search, User, Clock, Download, Eye } from 'lucide-react';
import { MOCK_AUDIT_LOG } from '@/lib/mock-data';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/roles-config';
import { cn } from '@/lib/utils';

const ACTION_CONFIG = {
  CREATE: { label: 'Création', color: 'bg-emerald-100 text-emerald-700' },
  UPDATE: { label: 'Modification', color: 'bg-blue-100 text-blue-700' },
  DELETE: { label: 'Suppression', color: 'bg-red-100 text-red-700' },
};

export default function AuditLogPage() {
  const [selectedEntry, setSelectedEntry] = useState<typeof MOCK_AUDIT_LOG[0] | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>('all');
  const [actionFilter, setActionFilter] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = MOCK_AUDIT_LOG.filter(entry => {
    if (userFilter !== 'all' && entry.userRole !== userFilter) return false;
    if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
    if (searchQuery && !entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) && !entry.entityType.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Journal d'audit"
          description="Historique des actions administratives"
          breadcrumbs={[
            { label: 'Système' },
            { label: 'Journal d\'audit' },
          ]}
          actions={
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          }
        />

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Actions récentes</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Utilisateur, type..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous rôles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin_pays">Admin Pays</SelectItem>
                    <SelectItem value="admin_contenu">Admin Contenu</SelectItem>
                    <SelectItem value="moderateur">Modérateur</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes actions</SelectItem>
                    <SelectItem value="CREATE">Créations</SelectItem>
                    <SelectItem value="UPDATE">Modifications</SelectItem>
                    <SelectItem value="DELETE">Suppressions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>ID entité</TableHead>
                  <TableHead className="text-right">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {new Date(entry.createdAt).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell className="font-medium">{entry.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-[10px]', ROLE_COLORS[entry.userRole])}>
                        {ROLE_LABELS[entry.userRole]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ACTION_CONFIG[entry.action as keyof typeof ACTION_CONFIG].color}>
                        {ACTION_CONFIG[entry.action as keyof typeof ACTION_CONFIG].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.entityType}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.entityId}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedEntry(entry)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de l'action</DialogTitle>
              <DialogDescription>
                {selectedEntry && new Date(selectedEntry.createdAt).toLocaleString('fr-FR')}
              </DialogDescription>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Utilisateur</span>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{selectedEntry.userName}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rôle</span>
                    <Badge variant="outline" className={ROLE_COLORS[selectedEntry.userRole]}>
                      {ROLE_LABELS[selectedEntry.userRole]}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action</span>
                    <Badge variant="outline" className={ACTION_CONFIG[selectedEntry.action as keyof typeof ACTION_CONFIG].color}>
                      {ACTION_CONFIG[selectedEntry.action as keyof typeof ACTION_CONFIG].label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type d'entité</span>
                    <span>{selectedEntry.entityType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID entité</span>
                    <span className="font-mono text-xs">{selectedEntry.entityId}</span>
                  </div>
                </div>

                {selectedEntry.oldValue && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Ancienne valeur</Label>
                    <pre className="mt-1 p-2 bg-slate-100 rounded text-xs overflow-auto">
                      {JSON.stringify(JSON.parse(selectedEntry.oldValue), null, 2)}
                    </pre>
                  </div>
                )}

                {selectedEntry.newValue && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Nouvelle valeur</Label>
                    <pre className="mt-1 p-2 bg-slate-100 rounded text-xs overflow-auto">
                      {JSON.stringify(JSON.parse(selectedEntry.newValue), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
