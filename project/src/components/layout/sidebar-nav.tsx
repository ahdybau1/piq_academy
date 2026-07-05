'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/app-context';
import { ROLE_CONFIGS } from '@/lib/roles-config';
import type { UserRole } from '@/lib/types';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  MessageSquare,
  Headphones,
  DollarSign,
  Brain,
  Settings,
  ChevronRight,
  BookOpen,
  FileText,
  Building2,
  Layers,
  UserCog,
  Shield,
  AlertCircle,
  Calendar,
  Megaphone,
  HelpCircle,
  CreditCard,
  RefreshCw,
  Package,
  Heart,
  Gift,
  Cpu,
  BarChart3,
  Globe,
  Bell,
  FileDown,
  History,
  Server,
  HardDrive,
  Accessibility,
  Presentation,
  ShieldCheck,
  ArrowRightLeft,
  MegaphoneOff,
  Tags,
  Trash2,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  roles: UserRole[];
  superAdminOnly?: boolean;
  badge?: string;
}

const navigation: NavItem[] = [
  {
    title: 'Académique',
    icon: <GraduationCap className="h-4 w-4" />,
    roles: ['super_admin', 'admin_pays', 'admin_contenu', 'enseignant'],
    children: [
      { title: 'Arbre académique', href: '/academic/tree', icon: <Layers className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
      { title: 'Matières & Contenu', href: '/academic/content', icon: <BookOpen className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'admin_contenu', 'enseignant'] },
      { title: 'Trimestres', href: '/academic/terms', icon: <Calendar className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
      { title: 'Catalogue pédagogique', href: '/academic/catalog', icon: <Tags className="h-4 w-4" />, roles: ['super_admin', 'admin_contenu'] },
      { title: 'Examens officiels', href: '/academic/exams', icon: <FileText className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
      { title: 'Établissements & Épreuves', href: '/academic/schools', icon: <Building2 className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
    ],
  },
  {
    title: 'Utilisateurs',
    icon: <Users className="h-4 w-4" />,
    roles: ['super_admin', 'admin_pays'],
    children: [
      { title: 'Comptes & Profils', href: '/users/accounts', icon: <Users className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
      { title: 'Enseignants', href: '/users/teachers', icon: <UserCog className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
      { title: 'Rôles & Permissions', href: '/users/roles', icon: <Shield className="h-4 w-4" />, roles: ['super_admin'] },
    ],
  },
  {
    title: 'Validation',
    icon: <CheckCircle2 className="h-4 w-4" />,
    roles: ['super_admin', 'admin_pays', 'admin_contenu', 'validateur'],
    children: [
      { title: 'File de validation', href: '/validation/queue', icon: <FileText className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'admin_contenu', 'validateur'], badge: '12' },
      { title: 'Contestations de note', href: '/validation/contestations', icon: <AlertCircle className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'admin_contenu'] },
    ],
  },
  {
    title: 'Engagement',
    icon: <MessageSquare className="h-4 w-4" />,
    roles: ['super_admin', 'admin_pays', 'moderateur', 'admin_contenu'],
    children: [
      { title: 'Forum', href: '/engagement/forum', icon: <MessageSquare className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'moderateur'], badge: '5' },
      { title: 'Communautés WhatsApp', href: '/engagement/whatsapp', icon: <MessageSquare className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
      { title: 'Événements', href: '/engagement/events', icon: <Calendar className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
      { title: 'Annonces', href: '/engagement/announcements', icon: <Megaphone className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
    ],
  },
  {
    title: 'Support',
    icon: <Headphones className="h-4 w-4" />,
    roles: ['super_admin', 'admin_pays', 'support'],
    children: [
      { title: 'Tickets', href: '/support/tickets', icon: <Headphones className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'support'], badge: '8' },
      { title: 'FAQ interne', href: '/support/faq', icon: <HelpCircle className="h-4 w-4" />, roles: ['super_admin', 'admin_pays', 'support'] },
    ],
  },
  {
    title: 'Commercial',
    icon: <DollarSign className="h-4 w-4" />,
    roles: ['super_admin'],
    superAdminOnly: true,
    children: [
      { title: 'Abonnements & Tarifs', href: '/commercial/subscriptions', icon: <CreditCard className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Transactions', href: '/commercial/transactions', icon: <DollarSign className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Réconciliation', href: '/commercial/reconciliation', icon: <RefreshCw className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Remboursements', href: '/commercial/refunds', icon: <Package className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Boutique', href: '/commercial/store', icon: <Package className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Dons', href: '/commercial/donations', icon: <Heart className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Parrainage', href: '/commercial/referrals', icon: <Gift className="h-4 w-4" />, roles: ['super_admin'] },
    ],
  },
  {
    title: 'Intelligence Artificielle',
    icon: <Brain className="h-4 w-4" />,
    roles: ['super_admin', 'admin_contenu'],
    children: [
      { title: 'Catalogue pédagogique', href: '/ai/catalog', icon: <BookOpen className="h-4 w-4" />, roles: ['super_admin', 'admin_contenu'] },
      { title: 'Suivi des agents IA', href: '/ai/agents', icon: <Cpu className="h-4 w-4" />, roles: ['super_admin', 'admin_contenu'] },
      { title: 'Coûts', href: '/ai/costs', icon: <BarChart3 className="h-4 w-4" />, roles: ['super_admin'], superAdminOnly: true },
    ],
  },
  {
    title: 'Système',
    icon: <Settings className="h-4 w-4" />,
    roles: ['super_admin', 'admin_pays', 'traducteur', 'validateur'],
    children: [
      { title: 'Paramètres', href: '/system/settings', icon: <Settings className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Notifications', href: '/system/notifications', icon: <Bell className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
      { title: 'Langues & Traductions', href: '/system/translations', icon: <Globe className="h-4 w-4" />, roles: ['super_admin', 'traducteur', 'validateur'] },
      { title: 'Import/Export', href: '/system/import-export', icon: <FileDown className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Statistiques', href: '/system/stats', icon: <BarChart3 className="h-4 w-4" />, roles: ['super_admin', 'admin_pays'] },
      { title: 'Journal d\'audit', href: '/system/audit', icon: <History className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Corbeille', href: '/system/trash', icon: <Trash2 className="h-4 w-4" />, roles: ['super_admin'] },
    ],
  },
  {
    title: 'Configuration',
    icon: <Settings className="h-4 w-4" />,
    roles: ['super_admin', 'admin_contenu'],
    children: [
      { title: 'Services externes', href: '/config/services', icon: <Server className="h-4 w-4" />, roles: ['super_admin'], badge: '2' },
      { title: 'Sauvegardes', href: '/config/backups', icon: <HardDrive className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Modes de réponse', href: '/config/response-modes', icon: <ArrowRightLeft className="h-4 w-4" />, roles: ['super_admin', 'admin_contenu'] },
      { title: 'Modalités composition', href: '/config/composition-modalities', icon: <Presentation className="h-4 w-4" />, roles: ['super_admin', 'admin_contenu'] },
      { title: 'Accessibilité', href: '/config/accessibility', icon: <Accessibility className="h-4 w-4" />, roles: ['super_admin', 'admin_contenu'] },
    ],
  },
  {
    title: 'Conformité',
    icon: <ShieldCheck className="h-4 w-4" />,
    roles: ['super_admin'],
    children: [
      { title: 'Protection des données', href: '/compliance/data-protection', icon: <Shield className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Passage de classe', href: '/compliance/school-year', icon: <Calendar className="h-4 w-4" />, roles: ['super_admin'] },
      { title: 'Publicités', href: '/compliance/advertising', icon: <MegaphoneOff className="h-4 w-4" />, roles: ['super_admin'] },
    ],
  },
];

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const containsActive = item.children?.some((child) => child.href === pathname) ?? false;
  // `null` = pas encore touché par l'utilisateur : on suit alors la page active.
  // Une fois que l'utilisateur ouvre/ferme le groupe à la main, son choix prime.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const isOpen = manualOpen ?? containsActive;

  const { currentUser } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  // Check if user can see this item
  if (!item.roles.includes(currentUser.role)) {
    return null;
  }

  // Check super admin only items
  if (item.superAdminOnly && !roleConfig.canViewFinancials) {
    return null;
  }

  const isActive = item.href === pathname;
  const hasChildren = item.children && item.children.length > 0;
  const filteredChildren = item.children?.filter(child =>
    child.roles.includes(currentUser.role) &&
    (!child.superAdminOnly || roleConfig.canViewFinancials)
  );

  if (hasChildren && (!filteredChildren || filteredChildren.length === 0)) {
    return null;
  }

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent',
          isActive && 'bg-sidebar-primary text-sidebar-primary-foreground',
          !isActive && 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {item.icon}
        <span className="flex-1">{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-cyan-500 text-white border-0">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setManualOpen} className="group/collapsible">
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent',
          'text-sidebar-foreground',
          depth > 0 && 'text-sidebar-foreground/70 font-normal'
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {item.icon}
        <span className="flex-1 text-left">{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-cyan-500 text-white border-0">
            {item.badge}
          </Badge>
        )}
        {hasChildren && (
          <ChevronRight className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-90'
          )} />
        )}
      </CollapsibleTrigger>
      {filteredChildren && filteredChildren.length > 0 && (
        <CollapsibleContent className="space-y-1 pt-1">
          {filteredChildren.map((child) => (
            <NavItemComponent key={child.title} item={child} depth={depth + 1} />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function SidebarNav() {
  return (
    <div className="space-y-1 p-3">
      {navigation.map((item) => (
        <NavItemComponent key={item.title} item={item} />
      ))}
    </div>
  );
}
