'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Globe, CreditCard, Bell, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'appearance' | 'payments' | 'notifications';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border/40 px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}
function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>('appearance');
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'appearance',    label: 'Apparence',     icon: <Globe className="h-4 w-4" /> },
    { key: 'payments',      label: 'Paiements',     icon: <CreditCard className="h-4 w-4" /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  ];
  return (
    <div className="space-y-8">
      <PageHeader
        title="Paramètres"
        description="Configuration globale de la plateforme"
        breadcrumbs={[{ label: 'Système' }, { label: 'Paramètres' }]}
        actions={<Button size="sm" className="gap-2"><Save className="h-4 w-4" />Enregistrer</Button>}
      />
      <div className="flex items-center gap-1 rounded-2xl border border-border/40 bg-card p-1.5 shadow-sm w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all', tab === t.key ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      {tab === 'appearance' && (
        <div className="space-y-5">
          <Section title="Interface">
            <SettingRow label="Langue de l'interface" description="Langue par défaut de l'interface admin">
              <Select items={{ fr: 'Français', en: 'English' }} defaultValue="fr"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Mode sombre" description="Thème sombre pour réduire la fatigue visuelle">
              <Switch />
            </SettingRow>
            <SettingRow label="Fuseau horaire">
              <Select items={{ africa_douala: 'Africa/Douala (UTC+1)', utc: 'UTC' }} defaultValue="africa_douala"><SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="africa_douala">Africa/Douala (UTC+1)</SelectItem><SelectItem value="utc">UTC</SelectItem></SelectContent>
              </Select>
            </SettingRow>
          </Section>
          <Section title="Contenu">
            <SettingRow label="Nombre d'éléments par page" description="Pagination dans les listes">
              <Input className="w-20 text-center" defaultValue="25" type="number" />
            </SettingRow>
            <SettingRow label="Afficher les contenus archivés">
              <Switch />
            </SettingRow>
          </Section>
        </div>
      )}
      {tab === 'payments' && (
        <div className="space-y-5">
          <Section title="Mobile Money">
            <SettingRow label="Orange Money" description="Activer les paiements Orange Money">
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow label="MTN Mobile Money" description="Activer MTN MoMo">
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow label="Frais de transaction (%)" description="Pourcentage prélevé sur chaque paiement">
              <Input className="w-20 text-center" defaultValue="1.5" type="number" step="0.1" />
            </SettingRow>
          </Section>
          <Section title="Facturation">
            <SettingRow label="Devise par défaut">
              <Select items={{ fcfa: 'FCFA', eur: 'EUR' }} defaultValue="fcfa"><SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="fcfa">FCFA</SelectItem><SelectItem value="eur">EUR</SelectItem></SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Renouvellement automatique">
              <Switch defaultChecked />
            </SettingRow>
          </Section>
        </div>
      )}
      {tab === 'notifications' && (
        <div className="space-y-5">
          <Section title="Email">
            <SettingRow label="Expéditeur (adresse)" description="Adresse From des emails système">
              <Input className="w-64" defaultValue="no-reply@piqacademy.com" type="email" />
            </SettingRow>
            <SettingRow label="Nouveaux signalements forum">
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow label="Résumé quotidien d'activité">
              <Switch defaultChecked />
            </SettingRow>
          </Section>
          <Section title="Push">
            <SettingRow label="Notifications push activées">
              <Switch />
            </SettingRow>
          </Section>
        </div>
      )}
    </div>
  );
}
