'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Download, Edit } from 'lucide-react';
import { ROLE_CONFIGS } from '@/lib/roles-config';
import { cn } from '@/lib/utils';

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const PERMISSIONS = [
  { key: 'canViewFinancials', label: 'Données financières' },
  { key: 'canViewIACosts', label: 'Coûts IA' },
  { key: 'canManageUsers', label: 'Gestion utilisateurs' },
  { key: 'canManageContent', label: 'Gestion contenu' },
  { key: 'canModerateForum', label: 'Modération forum' },
  { key: 'canManageSupport', label: 'Support' },
  { key: 'canManageSettings', label: 'Paramètres' },
  { key: 'canManageTranslations', label: 'Traductions' },
];

const ADMIN_USERS = [
  { name: 'Marie Nguema', role: 'super_admin', roleBadge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300', scope: 'Tous' },
  { name: 'Paul Mbeki', role: 'admin_pays', roleBadge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', scope: 'Cameroun' },
  { name: 'Sophie Atangana', role: 'admin_contenu', roleBadge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', scope: 'Tous' },
  { name: 'Claire Fouda', role: 'modérateur', roleBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', scope: 'Cameroun' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function RolesPermissionsPage() {
  const roles = Object.values(ROLE_CONFIGS);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rôles & Permissions"
        description="Matrice des droits par rôle administrateur"
        breadcrumbs={[{ label: 'Utilisateurs' }, { label: 'Rôles & Permissions' }]}
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Journal
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
        <div className="border-b border-border/40 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Matrice des permissions</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Vue d&apos;ensemble par rôle</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="w-[220px] px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permission</th>
                {roles.map((r) => (
                  <th key={r.id} className="px-4 py-3.5 text-center">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', r.badgeColor)}>{r.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, i) => (
                <tr key={perm.key} className={cn('border-b border-border/30 transition-colors hover:bg-muted/20', i % 2 === 0 && 'bg-muted/10')}>
                  <td className="px-6 py-3.5 text-sm font-medium text-foreground">{perm.label}</td>
                  {roles.map((r) => {
                    const has = r[perm.key as keyof typeof r] as boolean;
                    return (
                      <td key={r.id} className="px-4 py-3.5 text-center">
                        <div
                          className={cn(
                            'mx-auto flex h-6 w-6 items-center justify-center rounded-lg',
                            has ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-muted/40'
                          )}
                        >
                          <Checkbox checked={has} disabled className="data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500" />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Comptes administrateurs</h2>
        <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
          {ADMIN_USERS.map((user) => (
            <motion.div key={user.name} variants={rowItem} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-slate-700 text-xs font-bold text-white">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">Périmètre : {user.scope}</p>
              </div>
              <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', user.roleBadge)}>
                {user.role.replace('_', ' ')}
              </span>
              <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/50 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
                <Edit className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
