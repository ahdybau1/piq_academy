'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/app-context';
import { ROLE_CONFIGS } from '@/lib/roles-config';
import type { UserRole } from '@/lib/types';
import {
  GraduationCap, Users, CheckCircle2, MessageSquare, Headphones,
  DollarSign, Brain, Settings, ChevronRight, BookOpen, FileText,
  Building2, Layers, UserCog, Shield, AlertCircle, Calendar,
  Megaphone, HelpCircle, CreditCard, RefreshCw, Package, Heart,
  Gift, Cpu, BarChart3, Globe, Bell, FileDown, History, Server,
  HardDrive, Accessibility, Presentation, ShieldCheck, ArrowRightLeft,
  MegaphoneOff, Tags, Trash2, ListChecks, Library, MonitorPlay,
} from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  roles: UserRole[];
  superAdminOnly?: boolean;
  badge?: string;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        title: 'Académique',
        icon: <GraduationCap className="h-4 w-4" />,
        roles: ['super_admin', 'admin_pays', 'admin_contenu', 'enseignant'],
        children: [
          { title: 'Arbre académique',         href: '/academic/tree',    icon: <Layers className="h-4 w-4" />,    roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
          { title: 'Matières & Contenu',        href: '/academic/content', icon: <BookOpen className="h-4 w-4" />,  roles: ['super_admin', 'admin_pays', 'admin_contenu', 'enseignant'] },
          { title: 'Trimestres',                href: '/academic/terms',   icon: <Calendar className="h-4 w-4" />,  roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
          { title: 'Catalogue pédagogique',     href: '/academic/catalog', icon: <Tags className="h-4 w-4" />,      roles: ['super_admin', 'admin_contenu'] },
          { title: 'Examens officiels',         href: '/academic/exams',   icon: <FileText className="h-4 w-4" />,  roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
          { title: 'Établissements & Épreuves', href: '/academic/schools', icon: <Building2 className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
          { title: 'Bibliothèque de médias',    href: '/academic/media',   icon: <Library className="h-4 w-4" />,   roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
        ],
      },
      {
        title: 'Utilisateurs',
        icon: <Users className="h-4 w-4" />,
        roles: ['super_admin', 'admin_pays'],
        children: [
          { title: 'Comptes & Profils',   href: '/users/accounts', icon: <Users className="h-4 w-4" />,   roles: ['super_admin', 'admin_pays'] },
          { title: 'Parents',             href: '/users/parents',  icon: <Users className="h-4 w-4" />,   roles: ['super_admin', 'admin_pays'] },
          { title: 'Enseignants',         href: '/users/teachers', icon: <UserCog className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
          { title: 'Rôles & Permissions', href: '/users/roles',    icon: <Shield className="h-4 w-4" />,  roles: ['super_admin'] },
          { title: 'Administrateurs',     href: '/users/admins',   icon: <Shield className="h-4 w-4" />,  roles: ['super_admin'], superAdminOnly: true },
        ],
      },
      {
        title: 'Validation',
        icon: <CheckCircle2 className="h-4 w-4" />,
        roles: ['super_admin', 'admin_pays', 'admin_contenu', 'validateur'],
        children: [
          { title: 'File de validation',    href: '/validation/queue',         icon: <ListChecks className="h-4 w-4" />,  roles: ['super_admin', 'admin_pays', 'admin_contenu', 'validateur'], badge: '12' },
          { title: 'Contestations de note', href: '/validation/contestations', icon: <AlertCircle className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
        ],
      },
    ],
  },
  {
    label: 'Communauté',
    items: [
      {
        title: 'Engagement',
        icon: <MessageSquare className="h-4 w-4" />,
        roles: ['super_admin', 'admin_pays', 'moderateur', 'admin_contenu'],
        children: [
          { title: 'Forum',                href: '/engagement/forum',         icon: <MessageSquare className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'moderateur'], badge: '5' },
          { title: 'Communautés WhatsApp', href: '/engagement/whatsapp',      icon: <MessageSquare className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
          { title: 'Événements',           href: '/engagement/events',        icon: <Calendar className="h-4 w-4" />,      roles: ['super_admin', 'admin_pays'] },
          { title: 'Annonces',             href: '/engagement/announcements', icon: <Megaphone className="h-4 w-4" />,     roles: ['super_admin', 'admin_pays'] },
        ],
      },
      {
        title: 'Support',
        icon: <Headphones className="h-4 w-4" />,
        roles: ['super_admin', 'admin_pays', 'support'],
        children: [
          { title: 'Tickets',     href: '/support/tickets', icon: <Headphones className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'support'], badge: '8' },
          { title: 'FAQ interne', href: '/support/faq',     icon: <HelpCircle className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'support'] },
        ],
      },
    ],
  },
  {
    label: 'Opérations',
    items: [
      {
        title: 'Commercial',
        icon: <DollarSign className="h-4 w-4" />,
        roles: ['super_admin'],
        superAdminOnly: true,
        children: [
          { title: 'Abonnements & Tarifs', href: '/commercial/subscriptions',  icon: <CreditCard className="h-4 w-4" />, roles: ['super_admin'] },
          { title: 'Transactions',         href: '/commercial/transactions',   icon: <DollarSign className="h-4 w-4" />, roles: ['super_admin'] },
          { title: 'Réconciliation',       href: '/commercial/reconciliation', icon: <RefreshCw className="h-4 w-4" />,  roles: ['super_admin'] },
          { title: 'Remboursements',       href: '/commercial/refunds',        icon: <Package className="h-4 w-4" />,    roles: ['super_admin'] },
          { title: 'Boutique',             href: '/commercial/store',          icon: <Package className="h-4 w-4" />,    roles: ['super_admin'] },
          { title: 'Dons',                 href: '/commercial/donations',      icon: <Heart className="h-4 w-4" />,      roles: ['super_admin'] },
          { title: 'Parrainage',           href: '/commercial/referrals',      icon: <Gift className="h-4 w-4" />,       roles: ['super_admin'] },
        ],
      },
      {
        title: 'Intelligence Artificielle',
        icon: <Brain className="h-4 w-4" />,
        roles: ['super_admin', 'admin_contenu'],
        children: [
          { title: 'Catalogue pédagogique', href: '/ai/catalog', icon: <BookOpen className="h-4 w-4" />,  roles: ['super_admin', 'admin_contenu'] },
          { title: 'Suivi des agents IA',   href: '/ai/agents',  icon: <Cpu className="h-4 w-4" />,       roles: ['super_admin', 'admin_contenu'] },
          { title: 'Coûts',                 href: '/ai/costs',   icon: <BarChart3 className="h-4 w-4" />, roles: ['super_admin'], superAdminOnly: true },
        ],
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        title: 'Système',
        icon: <Settings className="h-4 w-4" />,
        roles: ['super_admin', 'admin_pays', 'traducteur', 'validateur'],
        children: [
          { title: 'Paramètres',            href: '/system/settings',      icon: <Settings className="h-4 w-4" />,  roles: ['super_admin'] },
          { title: 'Notifications',         href: '/system/notifications', icon: <Bell className="h-4 w-4" />,      roles: ['super_admin', 'admin_pays'] },
          { title: 'Langues & Traductions', href: '/system/translations',  icon: <Globe className="h-4 w-4" />,     roles: ['super_admin', 'traducteur', 'validateur'] },
          { title: 'Import/Export',         href: '/system/import-export', icon: <FileDown className="h-4 w-4" />,  roles: ['super_admin'] },
          { title: 'Statistiques',          href: '/system/stats',         icon: <BarChart3 className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
          { title: "Journal d'audit",       href: '/system/audit',         icon: <History className="h-4 w-4" />,   roles: ['super_admin'] },
          { title: 'Corbeille',             href: '/system/trash',         icon: <Trash2 className="h-4 w-4" />,    roles: ['super_admin'] },
          { title: "Guide d'onboarding",    href: '/system/onboarding',    icon: <MonitorPlay className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
        ],
      },
      {
        title: 'Configuration',
        icon: <Settings className="h-4 w-4" />,
        roles: ['super_admin', 'admin_contenu'],
        children: [
          { title: 'Services externes',     href: '/config/services',               icon: <Server className="h-4 w-4" />,         roles: ['super_admin'], badge: '2' },
          { title: 'Sauvegardes',           href: '/config/backups',                icon: <HardDrive className="h-4 w-4" />,      roles: ['super_admin'] },
          { title: 'Modes de réponse',      href: '/config/response-modes',         icon: <ArrowRightLeft className="h-4 w-4" />, roles: ['super_admin', 'admin_contenu'] },
          { title: 'Modalités composition', href: '/config/composition-modalities', icon: <Presentation className="h-4 w-4" />,   roles: ['super_admin', 'admin_contenu'] },
          { title: 'Accessibilité',         href: '/config/accessibility',          icon: <Accessibility className="h-4 w-4" />,  roles: ['super_admin', 'admin_contenu'] },
        ],
      },
      {
        title: 'Conformité',
        icon: <ShieldCheck className="h-4 w-4" />,
        roles: ['super_admin'],
        children: [
          { title: 'Protection des données', href: '/compliance/data-protection', icon: <Shield className="h-4 w-4" />,       roles: ['super_admin'] },
          { title: 'Passage de classe',      href: '/compliance/school-year',     icon: <Calendar className="h-4 w-4" />,     roles: ['super_admin'] },
          { title: 'Publicités',             href: '/compliance/advertising',     icon: <MegaphoneOff className="h-4 w-4" />, roles: ['super_admin'] },
        ],
      },
    ],
  },
];

// ── Leaf link ─────────────────────────────────────────────────────────────────

function NavLeaf({ item, depth }: { item: NavItem; depth: number }) {
  const pathname = usePathname();
  const isActive = item.href === pathname;

  return (
    <Link
      href={item.href!}
      aria-current={isActive ? 'page' : undefined}
      data-state={isActive ? 'active' : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring',
        isActive
          ? 'font-medium text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/55 hover:bg-white/5 hover:text-sidebar-foreground/90',
      )}
      style={{ paddingLeft: `${14 + depth * 14}px` }}
    >
      {isActive && (
        <motion.div
          layoutId="active-leaf-pill"
          className="absolute inset-0 rounded-md bg-sidebar-accent"
          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
        />
      )}
      <span className="relative z-10 flex shrink-0 items-center opacity-60 group-hover:opacity-90">
        {item.icon}
      </span>
      <span className="relative z-10 flex-1 truncate">{item.title}</span>
      {item.badge && (
        <span className="relative z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500/90 px-1 text-[10px] font-bold text-white shadow-sm">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ── Collapsible section ───────────────────────────────────────────────────────

function NavSection({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  const filteredChildren = item.children?.filter(
    (child) =>
      child.roles.includes(currentUser.role) &&
      (!child.superAdminOnly || roleConfig.canViewFinancials),
  );

  const containsActive = filteredChildren?.some((child) => child.href === pathname) ?? false;
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const isOpen = manualOpen ?? containsActive;

  if (!item.roles.includes(currentUser.role)) return null;
  if (item.superAdminOnly && !roleConfig.canViewFinancials) return null;
  if (item.children && (!filteredChildren || filteredChildren.length === 0)) return null;

  if (item.href) {
    return <NavLeaf item={item} depth={depth} />;
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setManualOpen((v) => !(v ?? isOpen))}
        className={cn(
          'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
          containsActive
            ? 'bg-sidebar-primary/5 text-sidebar-primary'
            : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground',
        )}
        style={{ paddingLeft: `${14 + depth * 14}px` }}
      >
        <span className={cn('flex shrink-0 items-center transition-colors', containsActive ? 'text-sidebar-primary' : 'opacity-60 group-hover:opacity-100')}>
          {item.icon}
        </span>
        <span className="flex-1 text-left tracking-wide">{item.title}</span>
        {item.badge && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sidebar-primary/20 px-1.5 text-[10px] font-bold text-sidebar-primary shadow-sm">
            {item.badge}
          </span>
        )}
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="ml-auto shrink-0 opacity-40 group-hover:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && filteredChildren && filteredChildren.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -4 }}
              animate={{ y: 0 }}
              exit={{ y: -4 }}
              transition={{ duration: 0.18 }}
              className="relative mt-1 space-y-0.5 pb-1"
            >
              <div className="absolute bottom-1 left-[20px] top-0 w-px bg-sidebar-border/50" />
              {filteredChildren.map((child) => (
                <NavSection key={child.title} item={child} depth={depth + 1} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Group label ───────────────────────────────────────────────────────────────

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-3 pb-2 pt-5">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-sidebar-border/50 to-transparent" />
    </div>
  );
}

// ── Root nav ─────────────────────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const groupVariant: Variants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export function SidebarNav() {
  const { currentUser } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!item.roles.includes(currentUser.role)) return false;
      if (item.superAdminOnly && !roleConfig.canViewFinancials) return false;
      if (item.children) {
        const visible = item.children.filter(
          (c) => c.roles.includes(currentUser.role) && (!c.superAdminOnly || roleConfig.canViewFinancials),
        );
        return visible.length > 0;
      }
      return true;
    }),
  })).filter((g) => g.items.length > 0);

  return (
    <motion.div className="space-y-0.5 px-2 py-2" variants={container} initial="hidden" animate="show">
      {visibleGroups.map((group, gi) => (
        <motion.div key={gi} variants={groupVariant}>
          {group.label && <GroupLabel label={group.label} />}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavSection key={item.title} item={item} />
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
