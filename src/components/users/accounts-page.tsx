'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Users, Search, Mail, Phone, Calendar, CircleCheck as CheckCircle, UserX, MoveHorizontal as MoreHorizontal, Eye, CreditCard as Edit, Trash2, History, CreditCard, LogOut, KeyRound, ArrowRightLeft, Archive, ArchiveRestore, Monitor, UserPlus, ShieldAlert, ArrowLeft, ChevronRight, Hop as Home, GraduationCap } from 'lucide-react';
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

// ── Animation ─────────────────────────────────────────────────────────────────

type Dir = 'forward' | 'back';

function slide(dir: Dir): Variants {
  return {
    initial: { x: dir === 'forward' ? 64 : -64, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { x: dir === 'forward' ? -64 : 64, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } },
  };
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const ACCOUNT_STATUS_CONFIG: Record<string, { label: string; bg: string; dot: string }> = {
  actif: { label: 'Actif', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
  suspendu: { label: 'Suspendu', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300', dot: 'bg-rose-500' },
};

const PROFILE_STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
  actif: { label: 'Actif', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  archivé: { label: 'Archivé', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600',
  'bg-rose-600', 'bg-indigo-600', 'bg-teal-600', 'bg-cyan-600',
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

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

  const [dir, setDir] = useState<Dir>('forward');
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
    setDir('forward');
    setSelectedId(account.id);
    setDetail(null);
    setActionError(null);
    loadDetail(account.id);
  };

  const closeDetail = () => {
    setDir('back');
    setSelectedId(null);
    setDetail(null);
    setActionError(null);
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

  const currentAccount = accounts.find((a) => a.id === selectedId) ?? null;

  // ── Niveau 0 — Liste ────────────────────────────────────────────────────────

  const ListLevel = (
    <div className="space-y-6">
      <PageHeader
        title="Comptes & Profils"
        description="Comptes élève et profils rattachés"
        breadcrumbs={[{ label: 'Utilisateurs' }, { label: 'Comptes & Profils' }]}
        actions={
          <Button size="sm" className="gap-2" onClick={openAddAccount}>
            <UserPlus className="h-4 w-4" />
            Ajouter un compte
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total comptes', value: stats.total, icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-500/10' },
          { label: 'Actifs', value: stats.actifs, icon: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-500/10' },
          { label: 'Suspendus', value: stats.suspendus, icon: <UserX className="h-5 w-5 text-rose-600 dark:text-rose-400" />, color: 'bg-rose-500/10' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.color)}>{s.icon}</div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{s.label}</p>
              <p className="text-xl font-bold tabular-nums">{s.value.toLocaleString('fr-FR')}</p>
            </div>
          </div>
        ))}
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            className="pl-9"
            placeholder="Nom, email, téléphone, classe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'actif', 'suspendu'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                statusFilter === f
                  ? 'border-primary/40 bg-primary/8 text-primary'
                  : 'border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {f !== 'all' && <span className={cn('h-1.5 w-1.5 rounded-full', f === 'actif' ? 'bg-emerald-500' : 'bg-rose-500')} />}
              {f === 'all' ? 'Tous' : f === 'actif' ? 'Actifs' : 'Suspendus'}
              <span className={cn('tabular-nums rounded-full px-1.5 py-0.5 text-[10px] font-bold', statusFilter === f ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>
                {f === 'all' ? stats.total : f === 'actif' ? stats.actifs : stats.suspendus}
              </span>
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{filteredAccounts.length} résultat(s)</span>
      </div>

      <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
        {filteredAccounts.map((account) => {
          const st = ACCOUNT_STATUS_CONFIG[account.status];
          const color = avatarColor(`${account.first_name}${account.last_name}`);
          const classes = account.profiles.map((p) => p.className ?? '—').join(', ');
          return (
            <motion.div
              key={account.id}
              variants={rowItem}
              onClick={() => selectAccount(account)}
              className="group w-full cursor-pointer rounded-2xl border border-border/40 bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarFallback className={cn('text-sm font-bold text-white', color)}>
                    {initials(account.first_name, account.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                      {account.first_name} {account.last_name}
                    </p>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', st.bg)}>
                      {st.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{account.email}</p>
                  {classes && classes !== '—' && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      <span className="truncate">{classes}</span>
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
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
                          onClick={() => runAction(() => setAccountStatus({ id: account.id, status: 'suspendu' }))}
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
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredAccounts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
            <Search className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Aucun compte ne correspond à cette recherche.</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  // ── Niveau 1 — Détail du compte ─────────────────────────────────────────────

  const DetailLevel = currentAccount && (
    <div className="space-y-6">
      <div className="space-y-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 opacity-30" />
          <button className="transition-colors hover:text-foreground" onClick={closeDetail}>
            Comptes
          </button>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="font-medium text-foreground/80 max-w-[200px] truncate">
            {currentAccount.first_name} {currentAccount.last_name}
          </span>
        </nav>
        <div className="flex items-start gap-3">
          <button
            onClick={closeDetail}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight">
              {currentAccount.first_name} {currentAccount.last_name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{currentAccount.email}</p>
          </div>
          {(() => {
            const st = ACCOUNT_STATUS_CONFIG[currentAccount.status];
            return (
              <span className={cn('shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', st.bg)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
                {st.label}
              </span>
            );
          })()}
        </div>
        <div className="relative h-px w-full bg-border/40">
          <div className="absolute left-0 top-0 h-px w-16 brand-gradient-bg opacity-60" />
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {detailLoading && !detail ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : detail ? (
        <Tabs defaultValue="infos">
          <TabsList className="h-10 rounded-2xl border border-border/40 bg-card shadow-sm">
            <TabsTrigger value="infos" className="rounded-xl text-xs">Informations</TabsTrigger>
            <TabsTrigger value="profils" className="rounded-xl text-xs">
              Profils
              {detail.profiles.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                  {detail.profiles.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="connexions" className="rounded-xl text-xs">Sessions</TabsTrigger>
            {roleConfig.canViewFinancials && <TabsTrigger value="paiements" className="rounded-xl text-xs">Paiements</TabsTrigger>}
          </TabsList>

          <TabsContent value="infos" className="mt-5 space-y-5">
            <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <dl className="space-y-4">
                {[
                  { icon: <Phone className="h-4 w-4 text-primary/70" />, label: 'Téléphone', value: detail.phone ?? '—' },
                  { icon: <Mail className="h-4 w-4 text-primary/70" />, label: 'Email', value: detail.email },
                  { icon: <Calendar className="h-4 w-4 text-primary/70" />, label: 'Créé le', value: formatDate(detail.created_at) },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                      {item.icon}
                      {item.label}
                    </dt>
                    <dd className="text-sm font-medium text-foreground">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Button variant="outline" size="sm" className="h-10 gap-2 rounded-xl text-xs" onClick={openEdit}>
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Button variant="outline" size="sm" className="h-10 gap-2 rounded-xl text-xs" onClick={openHistory}>
                <History className="h-4 w-4" />
                Historique
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 rounded-xl text-xs"
                onClick={() => runAction(() => resetPassword({ id: detail.id }))}
              >
                <KeyRound className="h-4 w-4" />
                Réinit. mdp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 rounded-xl text-xs"
                onClick={() => runAction(() => forceLogout({ id: detail.id }))}
              >
                <LogOut className="h-4 w-4" />
                Déconnecter
              </Button>
              {detail.status === 'actif' ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 gap-2 rounded-xl text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                  onClick={() => runAction(() => setAccountStatus({ id: detail.id, status: 'suspendu' }))}
                >
                  <UserX className="h-4 w-4" />
                  Suspendre
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 gap-2 rounded-xl text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => runAction(() => setAccountStatus({ id: detail.id, status: 'actif' }))}
                >
                  <CheckCircle className="h-4 w-4" />
                  Réactiver
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="h-10 gap-2 rounded-xl text-xs"
                onClick={() => setShowDeleteAccount(true)}
              >
                {detail.hasFinancialHistory ? (
                  <>
                    <UserX className="h-4 w-4" />
                    Anonymiser
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Supprimer déf.
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="profils" className="mt-5 space-y-4">
            {detail.profiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
                <GraduationCap className="mb-3 h-10 w-10" />
                <p className="text-sm font-medium">Aucun profil rattaché.</p>
              </div>
            )}
            {detail.profiles.map((profile) => {
              const pst = PROFILE_STATUS_CONFIG[profile.status];
              return (
                <div key={profile.id} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{profile.className ?? 'Classe non définie'}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {profile.countryName ?? '—'} · {profile.subscription_tier ?? 'gratuit'} · {profile.school_year ?? '—'}
                      </p>
                    </div>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', pst.bg)}>
                      {pst.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Historique de progression détaillé indisponible — aucune table de suivi (leçons/exercices)
                    n&apos;existe encore dans le schéma actuel.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full text-xs" onClick={() => openEditProfile(profile)}>
                      <Edit className="h-3 w-3" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full text-xs" onClick={() => openProfileHistory(profile)}>
                      <History className="h-3 w-3" />
                      Historique
                    </Button>
                    {profile.status === 'actif' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-full text-xs"
                        onClick={() => runAction(() => setProfileStatus({ id: profile.id, status: 'archivé' }))}
                      >
                        <Archive className="h-3 w-3" />
                        Archiver
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-full text-xs"
                        onClick={() => runAction(() => setProfileStatus({ id: profile.id, status: 'actif' }))}
                      >
                        <ArchiveRestore className="h-3 w-3" />
                        Réactiver
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full text-xs"
                      onClick={() => {
                        setTransferProfileId(profile.id);
                        setTransferSearch('');
                        setActionError(null);
                      }}
                    >
                      <ArrowRightLeft className="h-3 w-3" />
                      Transférer
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full text-xs"
                      onClick={() => {
                        setDeleteProfileId(profile.id);
                        setActionError(null);
                      }}
                    >
                      {profile.hasFinancialHistory ? (
                        <>
                          <UserX className="h-3 w-3" />
                          Anonymiser
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3 w-3" />
                          Supprimer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="connexions" className="mt-5 space-y-3">
            {detail.sessions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
                <Monitor className="mb-3 h-10 w-10" />
                <p className="text-sm font-medium">Aucune session enregistrée.</p>
              </div>
            )}
            {detail.sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{session.platform ?? 'Plateforme inconnue'}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(session.created_at)}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    session.is_active ? ACCOUNT_STATUS_CONFIG.actif.bg : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  )}
                >
                  {session.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </TabsContent>

          {roleConfig.canViewFinancials && (
            <TabsContent value="paiements" className="mt-5 space-y-3">
              {detail.transactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
                  <CreditCard className="mb-3 h-10 w-10" />
                  <p className="text-sm font-medium">Aucune transaction.</p>
                </div>
              )}
              {detail.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">{tx.operator ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                  </div>
                  <span className="font-bold tabular-nums text-sm">{tx.amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={selectedId ? 'detail' : 'list'} variants={slide(dir)} initial="initial" animate="animate" exit="exit">
            {selectedId ? DetailLevel : ListLevel}
          </motion.div>
        </AnimatePresence>
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
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prénom</Label>
                <Input className="mt-1" value={addFirstName} onChange={(e) => setAddFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input className="mt-1" value={addLastName} onChange={(e) => setAddLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input className="mt-1" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input
                className="mt-1"
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
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prénom</Label>
                <Input className="mt-1" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input className="mt-1" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input className="mt-1" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">
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
                    if (!detail?.hasFinancialHistory) closeDetail();
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
            {accountHistory === null && <p className="text-sm text-muted-foreground p-4">Chargement…</p>}
            {accountHistory?.length === 0 && (
              <p className="text-sm text-muted-foreground p-4">Aucune entrée d&apos;historique.</p>
            )}
            <div className="space-y-2 p-1">
              {accountHistory?.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-border/50 p-3 text-sm">
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
            {profileHistory === null && <p className="text-sm text-muted-foreground p-4">Chargement…</p>}
            {profileHistory?.length === 0 && (
              <p className="text-sm text-muted-foreground p-4">Aucune entrée d&apos;historique.</p>
            )}
            <div className="space-y-2 p-1">
              {profileHistory?.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-border/50 p-3 text-sm">
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
            className="mt-2"
            placeholder="Rechercher un compte (nom, email)..."
            value={transferSearch}
            onChange={(e) => setTransferSearch(e.target.value)}
          />
          <ScrollArea className="max-h-64 mt-2">
            <div className="space-y-1 p-1">
              {transferCandidates.map((account) => {
                const color = avatarColor(`${account.first_name}${account.last_name}`);
                return (
                  <button
                    key={account.id}
                    className="w-full text-left flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                    onClick={() =>
                      runAction(
                        () => transferProfile({ id: transferProfileId!, newAccountId: account.id }),
                        () => setTransferProfileId(null)
                      )
                    }
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={cn('text-xs font-bold text-white', color)}>
                        {initials(account.first_name, account.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {account.first_name} {account.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{account.email}</p>
                    </div>
                  </button>
                );
              })}
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
          <div className="space-y-3 py-2">
            <div>
              <Label>Classe</Label>
              <Input
                className="mt-1"
                placeholder="Rechercher une classe..."
                value={editProfileClassSearch}
                onChange={(e) => setEditProfileClassSearch(e.target.value)}
              />
              <ScrollArea className="max-h-40 mt-2 rounded-xl border border-border/50">
                <div className="space-y-0.5 p-1">
                  {academicNodes === null && <p className="text-sm text-muted-foreground p-2">Chargement…</p>}
                  {filteredLeafNodes.map((node) => (
                    <button
                      key={node.id}
                      className={cn(
                        'w-full text-left text-sm p-2 rounded-lg hover:bg-muted transition-colors',
                        editProfileClassId === node.id && 'bg-primary/10 text-primary'
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
                className="mt-1"
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
