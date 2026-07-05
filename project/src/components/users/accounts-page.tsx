'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  CheckCircle,
  UserX,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  History,
  CreditCard,
  LogOut,
  KeyRound,
  ArrowRightLeft,
  Archive,
  ArchiveRestore,
  Monitor,
  UserPlus,
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
import {
  createAccount,
  updateAccount,
  setAccountStatus,
  deleteAccount,
  forceLogout,
  resetPassword,
  fetchAccountDetail,
  fetchAccountHistory,
  updateProfile,
  setProfileStatus,
  deleteProfile,
  transferProfile,
  fetchProfileHistory,
} from '@/lib/accounts/api-client';
import { fetchAcademicNodes } from '@/lib/academic/api-client';
import type { AccountListItem, AccountDetail, EnrichedProfile } from '@/lib/accounts/types';
import type { AcademicNodeRow, AuditLogEntry } from '@/lib/academic/types';
import { cn } from '@/lib/utils';

const ACCOUNT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  actif: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  suspendu: { label: 'Suspendu', color: 'bg-red-100 text-red-700' },
};

const PROFILE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  actif: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  archivé: { label: 'Archivé', color: 'bg-slate-100 text-slate-700' },
};

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function AccountsPageView({ initialAccounts }: { initialAccounts: AccountListItem[] }) {
  const router = useRouter();
  const { currentUser } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];
  const [, startTransition] = useTransition();

  const accounts = initialAccounts;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'suspendu'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addFirstName, setAddFirstName] = useState('');
  const [addLastName, setAddLastName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPassword, setAddPassword] = useState('');

  const [showEditAccount, setShowEditAccount] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [accountHistory, setAccountHistory] = useState<AuditLogEntry[] | null>(null);

  const [transferProfileId, setTransferProfileId] = useState<string | null>(null);
  const [transferSearch, setTransferSearch] = useState('');
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const [profileHistoryFor, setProfileHistoryFor] = useState<EnrichedProfile | null>(null);
  const [profileHistory, setProfileHistory] = useState<AuditLogEntry[] | null>(null);

  const [academicNodes, setAcademicNodes] = useState<AcademicNodeRow[] | null>(null);
  const [editProfileId, setEditProfileId] = useState<string | null>(null);
  const [editProfileClassId, setEditProfileClassId] = useState('');
  const [editProfileSchoolYear, setEditProfileSchoolYear] = useState('');
  const [editProfileClassSearch, setEditProfileClassSearch] = useState('');

  const stats = useMemo(() => {
    const total = accounts.length;
    const actifs = accounts.filter((a) => a.status === 'actif').length;
    const suspendus = accounts.filter((a) => a.status === 'suspendu').length;
    return { total, actifs, suspendus };
  }, [accounts]);

  const filteredAccounts = accounts.filter((account) => {
    if (statusFilter !== 'all' && account.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fullName = `${account.first_name} ${account.last_name}`.toLowerCase();
      const matchesClass = account.profiles.some((p) => p.className?.toLowerCase().includes(q));
      if (
        !fullName.includes(q) &&
        !account.email.toLowerCase().includes(q) &&
        !(account.phone ?? '').toLowerCase().includes(q) &&
        !matchesClass
      ) {
        return false;
      }
    }
    return true;
  });

  const loadDetail = (id: string) => {
    setDetailLoading(true);
    fetchAccountDetail(id)
      .then(setDetail)
      .catch((e) => setActionError(e instanceof Error ? e.message : 'Erreur inattendue.'))
      .finally(() => setDetailLoading(false));
  };

  const selectAccount = (account: AccountListItem) => {
    setSelectedId(account.id);
    setActionError(null);
    loadDetail(account.id);
  };

  const runAction = (fn: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    setActionError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setActionError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
      if (selectedId) loadDetail(selectedId);
    });
  };

  const openAddAccount = () => {
    setAddFirstName('');
    setAddLastName('');
    setAddEmail('');
    setAddPhone('');
    setAddPassword('');
    setActionError(null);
    setShowAddAccount(true);
  };

  const openEdit = () => {
    if (!detail) return;
    setEditFirstName(detail.first_name);
    setEditLastName(detail.last_name);
    setEditPhone(detail.phone ?? '');
    setEditEmail(detail.email);
    setActionError(null);
    setShowEditAccount(true);
  };

  const openHistory = async () => {
    if (!selectedId) return;
    setAccountHistory(null);
    setShowHistory(true);
    setAccountHistory(await fetchAccountHistory(selectedId));
  };

  const openProfileHistory = async (profile: EnrichedProfile) => {
    setProfileHistoryFor(profile);
    setProfileHistory(null);
    setProfileHistory(await fetchProfileHistory(profile.id));
  };

  const openEditProfile = (profile: EnrichedProfile) => {
    setEditProfileId(profile.id);
    setEditProfileClassId(profile.class_node_id ?? '');
    setEditProfileSchoolYear(profile.school_year ?? '');
    setEditProfileClassSearch('');
    setActionError(null);
    if (!academicNodes) {
      fetchAcademicNodes()
        .then(setAcademicNodes)
        .catch((e) => setActionError(e instanceof Error ? e.message : 'Erreur inattendue.'));
    }
  };

  // Une classe assignable à un profil est une feuille de l'arbre (aucun nœud enfant) :
  // le vocabulaire des types varie par pays, une feuille est le seul critère fiable.
  const leafNodes = useMemo(() => {
    if (!academicNodes) return [];
    const parentIds = new Set(academicNodes.map((n) => n.parent_id).filter(Boolean));
    const byId = new Map(academicNodes.map((n) => [n.id, n]));
    const pathOf = (id: string): string => {
      const parts: string[] = [];
      let current = byId.get(id);
      while (current) {
        parts.unshift(current.name);
        current = current.parent_id ? byId.get(current.parent_id) : undefined;
      }
      return parts.join(' / ');
    };
    return academicNodes
      .filter((n) => !parentIds.has(n.id))
      .map((n) => ({ id: n.id, path: pathOf(n.id) }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [academicNodes]);

  const filteredLeafNodes = editProfileClassSearch
    ? leafNodes.filter((n) => n.path.toLowerCase().includes(editProfileClassSearch.toLowerCase()))
    : leafNodes;

  const profileToDelete = detail?.profiles.find((p) => p.id === deleteProfileId) ?? null;

  const transferCandidates = accounts.filter((a) => {
    if (a.id === selectedId) return false;
    if (!transferSearch) return true;
    const q = transferSearch.toLowerCase();
    return `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Comptes & Profils"
          description="Comptes élève et profils rattachés"
          breadcrumbs={[{ label: 'Utilisateurs' }, { label: 'Comptes & Profils' }]}
          actions={
            <Button size="sm" onClick={openAddAccount}>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un compte
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total comptes</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-emerald-600">{stats.actifs}</p>
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
                  <p className="text-2xl font-bold text-red-600">{stats.suspendus}</p>
                </div>
                <UserX className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {actionError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Liste des comptes</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nom, email, téléphone, classe..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="actif">Actifs</SelectItem>
                      <SelectItem value="suspendu">Suspendus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Compte</TableHead>
                    <TableHead>Classe(s)</TableHead>
                    <TableHead>Pays</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow
                      key={account.id}
                      className={cn('cursor-pointer', selectedId === account.id && 'bg-primary/5')}
                      onClick={() => selectAccount(account)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-slate-700 text-white">
                              {initials(account.first_name, account.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {account.first_name} {account.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{account.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{account.profiles.map((p) => p.className ?? '—').join(', ') || '—'}</TableCell>
                      <TableCell>{account.profiles[0]?.countryName ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ACCOUNT_STATUS_CONFIG[account.status].color}>
                          {ACCOUNT_STATUS_CONFIG[account.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="p-2 rounded-md hover:bg-slate-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => selectAccount(account)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {account.status === 'actif' ? (
                              <DropdownMenuItem
                                className="text-amber-600"
                                onClick={() =>
                                  runAction(() => setAccountStatus({ id: account.id, status: 'suspendu' }))
                                }
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Suspendre
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => runAction(() => setAccountStatus({ id: account.id, status: 'actif' }))}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Réactiver
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        Aucun compte ne correspond à cette recherche.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{detail ? 'Détails du compte' : 'Sélectionnez un compte'}</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedId && (
                <div className="text-center text-muted-foreground py-12">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez un compte pour voir les détails</p>
                </div>
              )}
              {selectedId && detailLoading && !detail && (
                <p className="text-sm text-muted-foreground py-12 text-center">Chargement…</p>
              )}
              {detail && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg bg-slate-700 text-white">
                        {initials(detail.first_name, detail.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">
                        {detail.first_name} {detail.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{detail.email}</p>
                      <Badge variant="outline" className={cn('mt-1', ACCOUNT_STATUS_CONFIG[detail.status].color)}>
                        {ACCOUNT_STATUS_CONFIG[detail.status].label}
                      </Badge>
                    </div>
                  </div>

                  <Tabs defaultValue="infos">
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="infos">Infos</TabsTrigger>
                      <TabsTrigger value="profils">Profils</TabsTrigger>
                      <TabsTrigger value="connexions">Connexions</TabsTrigger>
                      {roleConfig.canViewFinancials && <TabsTrigger value="paiements">Paiements</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="infos" className="space-y-4 pt-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{detail.phone ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{detail.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Créé le {formatDate(detail.created_at)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" onClick={openEdit}>
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm" onClick={openHistory}>
                          <History className="h-3.5 w-3.5 mr-1" />
                          Historique
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runAction(() => resetPassword({ id: detail.id }))}
                        >
                          <KeyRound className="h-3.5 w-3.5 mr-1" />
                          Réinit. mot de passe
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runAction(() => forceLogout({ id: detail.id }))}
                        >
                          <LogOut className="h-3.5 w-3.5 mr-1" />
                          Forcer déconnexion
                        </Button>
                        {detail.status === 'actif' ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => runAction(() => setAccountStatus({ id: detail.id, status: 'suspendu' }))}
                          >
                            <UserX className="h-3.5 w-3.5 mr-1" />
                            Suspendre
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => runAction(() => setAccountStatus({ id: detail.id, status: 'actif' }))}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Réactiver
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => setShowDeleteAccount(true)}>
                          {detail.hasFinancialHistory ? (
                            <>
                              <UserX className="h-3.5 w-3.5 mr-1" />
                              Anonymiser
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Supprimer déf.
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="profils" className="space-y-3 pt-3">
                      {detail.profiles.length === 0 && (
                        <p className="text-sm text-muted-foreground">Aucun profil rattaché.</p>
                      )}
                      {detail.profiles.map((profile) => (
                        <div key={profile.id} className="rounded-md border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{profile.className ?? 'Classe non définie'}</p>
                              <p className="text-xs text-muted-foreground">
                                {profile.countryName ?? '—'} · {profile.subscription_tier ?? 'gratuit'} ·{' '}
                                {profile.school_year ?? '—'}
                              </p>
                            </div>
                            <Badge variant="outline" className={PROFILE_STATUS_CONFIG[profile.status].color}>
                              {PROFILE_STATUS_CONFIG[profile.status].label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground italic">
                            Historique de progression détaillé indisponible — aucune table de suivi
                            (leçons/exercices) n&apos;existe encore dans le schéma actuel.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditProfile(profile)}>
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Modifier
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openProfileHistory(profile)}>
                              <History className="h-3.5 w-3.5 mr-1" />
                              Historique
                            </Button>
                            {profile.status === 'actif' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  runAction(() => setProfileStatus({ id: profile.id, status: 'archivé' }))
                                }
                              >
                                <Archive className="h-3.5 w-3.5 mr-1" />
                                Archiver
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => runAction(() => setProfileStatus({ id: profile.id, status: 'actif' }))}
                              >
                                <ArchiveRestore className="h-3.5 w-3.5 mr-1" />
                                Réactiver
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTransferProfileId(profile.id);
                                setTransferSearch('');
                                setActionError(null);
                              }}
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                              Transférer
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeleteProfileId(profile.id);
                                setActionError(null);
                              }}
                            >
                              {profile.hasFinancialHistory ? (
                                <>
                                  <UserX className="h-3.5 w-3.5 mr-1" />
                                  Anonymiser
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  Supprimer
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="connexions" className="space-y-2 pt-3">
                      {detail.sessions.length === 0 && (
                        <p className="text-sm text-muted-foreground">Aucune session enregistrée.</p>
                      )}
                      {detail.sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between rounded-md border p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p>{session.platform ?? 'Plateforme inconnue'}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(session.created_at)}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={session.is_active ? ACCOUNT_STATUS_CONFIG.actif.color : ''}>
                            {session.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </TabsContent>

                    {roleConfig.canViewFinancials && (
                      <TabsContent value="paiements" className="space-y-2 pt-3">
                        {detail.transactions.length === 0 && (
                          <p className="text-sm text-muted-foreground">Aucune transaction.</p>
                        )}
                        {detail.transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {tx.operator ?? '—'} · {formatDate(tx.created_at)}
                              </span>
                            </div>
                            <span className="font-medium">{tx.amount.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        ))}
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ajouter un compte */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un compte élève</DialogTitle>
            <DialogDescription>
              Le mot de passe saisi doit être communiqué à l&apos;utilisateur — il pourra le changer après
              connexion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prénom</Label>
                <Input value={addFirstName} onChange={(e) => setAddFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input value={addLastName} onChange={(e) => setAddLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input
                type="text"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                placeholder="8 caractères minimum"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAccount(false)}>
              Annuler
            </Button>
            <Button
              onClick={() =>
                runAction(
                  () =>
                    createAccount({
                      firstName: addFirstName,
                      lastName: addLastName,
                      email: addEmail,
                      phone: addPhone || null,
                      password: addPassword,
                    }),
                  () => setShowAddAccount(false)
                )
              }
            >
              Créer le compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modifier le compte */}
      <Dialog open={showEditAccount} onOpenChange={setShowEditAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le compte</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prénom</Label>
                <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">
                Modifier l&apos;email met aussi à jour les identifiants de connexion.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAccount(false)}>
              Annuler
            </Button>
            <Button
              onClick={() =>
                runAction(
                  () =>
                    updateAccount({
                      id: detail!.id,
                      firstName: editFirstName,
                      lastName: editLastName,
                      phone: editPhone || null,
                      email: editEmail !== detail?.email ? editEmail : undefined,
                    }),
                  () => setShowEditAccount(false)
                )
              }
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supprimer / anonymiser le compte */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detail?.hasFinancialHistory ? 'Confirmer l’anonymisation' : 'Confirmer la suppression'}</DialogTitle>
            <DialogDescription>
              {detail?.hasFinancialHistory ? (
                <>
                  Ce compte a des abonnements ou transactions liés à au moins un profil : ils doivent être
                  conservés pour la traçabilité comptable. Le nom, l&apos;email et le téléphone du compte seront
                  remplacés par des valeurs génériques, l&apos;accès sera bloqué définitivement, et tous ses
                  profils passeront au statut « archivé ». Les abonnements et transactions ne seront pas
                  modifiés.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir supprimer définitivement ce compte, ses profils et ses sessions ? Cette
                  action est irréversible.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccount(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                runAction(
                  () => deleteAccount({ id: detail!.id }),
                  () => {
                    setShowDeleteAccount(false);
                    if (!detail?.hasFinancialHistory) {
                      setSelectedId(null);
                      setDetail(null);
                    }
                  }
                )
              }
            >
              {detail?.hasFinancialHistory ? 'Anonymiser' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Historique du compte */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historique du compte</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            {accountHistory === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
            {accountHistory?.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune entrée d&apos;historique.</p>
            )}
            <div className="space-y-2">
              {accountHistory?.map((entry) => (
                <div key={entry.id} className="text-sm border-b pb-2">
                  <p className="font-medium">{entry.action_type}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Historique du profil */}
      <Dialog open={!!profileHistoryFor} onOpenChange={(open) => !open && setProfileHistoryFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historique du profil</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            {profileHistory === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
            {profileHistory?.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune entrée d&apos;historique.</p>
            )}
            <div className="space-y-2">
              {profileHistory?.map((entry) => (
                <div key={entry.id} className="text-sm border-b pb-2">
                  <p className="font-medium">{entry.action_type}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Supprimer / anonymiser un profil */}
      <Dialog open={!!deleteProfileId} onOpenChange={(open) => !open && setDeleteProfileId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {profileToDelete?.hasFinancialHistory ? 'Confirmer l’anonymisation' : 'Confirmer la suppression du profil'}
            </DialogTitle>
            <DialogDescription>
              {profileToDelete?.hasFinancialHistory ? (
                <>
                  Ce profil a des abonnements ou transactions liés : ils doivent être conservés pour la
                  traçabilité comptable. Le compte associé sera anonymisé (nom, email, téléphone remplacés par
                  des valeurs génériques, accès bloqué définitivement) et ce profil passera au statut
                  « archivé » — rien ne sera supprimé côté paiements.
                </>
              ) : (
                <>Le profil (classe, abonnement, historique) sera supprimé définitivement.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProfileId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                runAction(
                  () => deleteProfile({ id: deleteProfileId! }),
                  () => setDeleteProfileId(null)
                )
              }
            >
              {profileToDelete?.hasFinancialHistory ? 'Anonymiser' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transférer un profil */}
      <Dialog open={!!transferProfileId} onOpenChange={(open) => !open && setTransferProfileId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transférer le profil vers un autre compte</DialogTitle>
            <DialogDescription>Choisissez le compte de destination.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Rechercher un compte (nom, email)..."
            value={transferSearch}
            onChange={(e) => setTransferSearch(e.target.value)}
          />
          <ScrollArea className="max-h-64">
            <div className="space-y-1">
              {transferCandidates.map((account) => (
                <button
                  key={account.id}
                  className="w-full text-left flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  onClick={() =>
                    runAction(
                      () => transferProfile({ id: transferProfileId!, newAccountId: account.id }),
                      () => setTransferProfileId(null)
                    )
                  }
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-slate-700 text-white">
                      {initials(account.first_name, account.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      {account.first_name} {account.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{account.email}</p>
                  </div>
                </button>
              ))}
              {transferCandidates.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">Aucun compte trouvé.</p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferProfileId(null)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modifier un profil */}
      <Dialog open={!!editProfileId} onOpenChange={(open) => !open && setEditProfileId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Classe</Label>
              <Input
                placeholder="Rechercher une classe..."
                value={editProfileClassSearch}
                onChange={(e) => setEditProfileClassSearch(e.target.value)}
              />
              <ScrollArea className="max-h-40 mt-2 border rounded-md">
                <div className="space-y-1 p-1">
                  {academicNodes === null && <p className="text-sm text-muted-foreground p-2">Chargement…</p>}
                  {filteredLeafNodes.map((node) => (
                    <button
                      key={node.id}
                      className={cn(
                        'w-full text-left text-sm p-2 rounded-md hover:bg-muted',
                        editProfileClassId === node.id && 'bg-primary/10'
                      )}
                      onClick={() => setEditProfileClassId(node.id)}
                    >
                      {node.path}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div>
              <Label>Année scolaire</Label>
              <Input
                value={editProfileSchoolYear}
                onChange={(e) => setEditProfileSchoolYear(e.target.value)}
                placeholder="2025-2026"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileId(null)}>
              Annuler
            </Button>
            <Button
              onClick={() =>
                runAction(
                  () =>
                    updateProfile({
                      id: editProfileId!,
                      classNodeId: editProfileClassId,
                      schoolYear: editProfileSchoolYear,
                    }),
                  () => setEditProfileId(null)
                )
              }
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
