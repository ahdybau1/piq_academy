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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserX,
  Archive,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Shield,
  History,
  CreditCard,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/lib/app-context';
import { ROLE_CONFIGS } from '@/lib/roles-config';
import { MOCK_STUDENTS_USER_MANAGEMENT } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  suspended: { label: 'Suspendu', color: 'bg-red-100 text-red-700' },
  archived: { label: 'Archivé', color: 'bg-slate-100 text-slate-700' },
};

export default function AccountsPage() {
  const { currentUser } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_STUDENTS_USER_MANAGEMENT[0] | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredUsers = MOCK_STUDENTS_USER_MANAGEMENT.filter(user => {
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Comptes & Profils"
          description="Liste des comptes utilisateurs et gestion des profils"
          breadcrumbs={[
            { label: 'Utilisateurs' },
            { label: 'Comptes & Profils' },
          ]}
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total utilisateurs</p>
                  <p className="text-2xl font-bold">15,200</p>
                </div>
                <Users className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                  <p className="text-2xl font-bold text-emerald-600">14,850</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suspendus</p>
                  <p className="text-2xl font-bold text-red-600">230</p>
                </div>
                <UserX className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Archivés</p>
                  <p className="text-2xl font-bold text-slate-600">120</p>
                </div>
                <Archive className="h-8 w-8 text-slate-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Users List */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Liste des utilisateurs</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nom, email..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="suspended">Suspendus</SelectItem>
                      <SelectItem value="archived">Archivés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Pays</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className={cn('cursor-pointer', selectedUser?.id === user.id && 'bg-primary/5')}
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-slate-700 text-white">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.classe}</TableCell>
                      <TableCell>{user.country}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG].color}>
                          {STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 rounded-md hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-amber-600">
                              <UserX className="h-4 w-4 mr-2" />
                              Suspendre
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteDialog(true)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* User Detail Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedUser ? 'Détails du compte' : 'Sélectionnez un utilisateur'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg bg-slate-700 text-white">
                        {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{selectedUser.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      <Badge variant="outline" className={cn('mt-1', STATUS_CONFIG[selectedUser.status as keyof typeof STATUS_CONFIG].color)}>
                        {STATUS_CONFIG[selectedUser.status as keyof typeof STATUS_CONFIG].label}
                      </Badge>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Inscrit le {selectedUser.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Dernière connexion: {selectedUser.lastLogin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Classe: {selectedUser.classe}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Progression
                    </Button>
                    <Button variant="outline" size="sm">
                      <History className="h-3.5 w-3.5 mr-1" />
                      Historique
                    </Button>
                  </div>

                  {/* Payment History - Super Admin Only */}
                  {roleConfig.canViewFinancials && (
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CreditCard className="h-4 w-4" />
                        Historique de paiements
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-slate-50 rounded">
                          <span>Abonnement - Déc 2024</span>
                          <span className="font-medium">5,000 FCFA</span>
                        </div>
                        <div className="flex justify-between p-2 bg-slate-50 rounded">
                          <span>Abonnement - Nov 2024</span>
                          <span className="font-medium">5,000 FCFA</span>
                        </div>
                        <div className="flex justify-between p-2 bg-slate-50 rounded">
                          <span>Abonnement - Oct 2024</span>
                          <span className="font-medium">5,000 FCFA</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profile Actions */}
                  <div className="border-t pt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Actions sur le profil</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedUser.status === 'active' ? 'destructive' : 'default'}
                        size="sm"
                      >
                        {selectedUser.status === 'active' ? (
                          <>
                            <UserX className="h-3.5 w-3.5 mr-1" />
                            Suspendre
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Réactiver
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Archive className="h-3.5 w-3.5 mr-1" />
                        Archiver
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez un utilisateur pour voir les détails</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement ce compte ?
                Cette action est irréversible et supprimera toutes les données associées.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
