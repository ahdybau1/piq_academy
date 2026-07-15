'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Bell, Mail, Smartphone, MessageSquare, Edit, Send,
  Plus, BarChart2, Eye,
  AlertCircle
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  push: <Smartphone className="h-3.5 w-3.5" />,
  sms: <MessageSquare className="h-3.5 w-3.5" />,
};

const TEMPLATES = [
  { id: 't1', event: 'Expiration abonnement (J-7)', category: 'subscription', channels: ['email', 'push'], active: true, openRate: 72, sent: 1245 },
  { id: 't2', event: 'Expiration abonnement (J-1)', category: 'subscription', channels: ['email', 'push', 'sms'], active: true, openRate: 85, sent: 1180 },
  { id: 't3', event: 'Cumul mensuel disponible', category: 'subscription', channels: ['push'], active: true, openRate: 61, sent: 890 },
  { id: 't4', event: 'Remboursement approuvé', category: 'payment', channels: ['email', 'sms'], active: true, openRate: 90, sent: 43 },
  { id: 't5', event: 'Paiement échoué', category: 'payment', channels: ['email', 'push', 'sms'], active: true, openRate: 78, sent: 167 },
  { id: 't6', event: 'Nouveau contenu publié', category: 'content', channels: ['push'], active: false, openRate: 45, sent: 0 },
  { id: 't7', event: 'Résultats examen blanc disponibles', category: 'academic', channels: ['email', 'push'], active: true, openRate: 88, sent: 312 },
  { id: 't8', event: 'Rappel examen blanc (J-3)', category: 'academic', channels: ['email', 'push', 'sms'], active: true, openRate: 82, sent: 256 },
  { id: 't9', event: 'Contenu soumis approuvé', category: 'content', channels: ['email'], active: true, openRate: 95, sent: 89 },
  { id: 't10', event: 'Inscription enseignant validée', category: 'users', channels: ['email'], active: true, openRate: 98, sent: 34 },
];

const SEND_HISTORY = [
  { id: 'h1', template: 'Expiration abonnement (J-7)', target: 'Tous — Cameroun', sent: 1245, opened: 897, date: '2025-01-15 08:00', type: 'auto' },
  { id: 'h2', template: 'Maintenance planifiée', target: 'Tous les pays', sent: 15420, opened: 11215, date: '2025-01-14 18:00', type: 'manual' },
  { id: 'h3', template: 'Résultats examen blanc disponibles', target: 'Terminale — Cameroun', sent: 312, opened: 275, date: '2025-01-13 14:30', type: 'auto' },
  { id: 'h4', template: 'Cumul mensuel disponible', target: 'Abonnés Mensuel — Tous', sent: 890, opened: 543, date: '2025-01-12 09:00', type: 'auto' },
];

const CAT_LABELS: Record<string, string> = {
  subscription: 'Abonnement',
  payment: 'Paiement',
  content: 'Contenu',
  academic: 'Académique',
  users: 'Utilisateurs',
};

const CAT_COLORS: Record<string, string> = {
  subscription: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  payment: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  content: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  academic: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  users: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function NotificationsPage() {
  const [editOpen, setEditOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<(typeof TEMPLATES)[0] | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [tab, setTab] = useState('templates');

  const activeCount = TEMPLATES.filter(t => t.active).length;
  const totalSent = TEMPLATES.reduce((s, t) => s + t.sent, 0);
  const avgOpenRate = Math.round(TEMPLATES.filter(t => t.sent > 0).reduce((s, t) => s + t.openRate, 0) / TEMPLATES.filter(t => t.sent > 0).length);

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Notifications"
        description="Gérez les templates de notification et envoyez des messages ciblés"
        breadcrumbs={[{ label: 'Système' }, { label: 'Notifications' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setSendOpen(true)}>
              <Send className="h-4 w-4" />Envoi manuel ciblé
            </Button>
            <Button className="gap-2" onClick={() => { setEditTemplate(null); setEditOpen(true); }}>
              <Plus className="h-4 w-4" />Nouveau template
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Templates actifs', value: activeCount.toString(), icon: <Bell className="h-5 w-5 text-violet-500" />, bg: 'bg-violet-500/10' },
          { label: 'Envoyées (30 jours)', value: totalSent.toLocaleString('fr-FR'), icon: <Send className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10', trend: '+12% vs mois dernier' },
          { label: 'Taux d\'ouverture moyen', value: `${avgOpenRate}%`, icon: <BarChart2 className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-500/10' },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card className="border-border/40">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p>
                    <p className="mt-1.5 text-2xl font-bold">{kpi.value}</p>
                    {kpi.trend && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{kpi.trend}</p>}
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="templates">Bibliothèque de templates</TabsTrigger>
          <TabsTrigger value="history">Historique d&apos;envois</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-3">
          {TEMPLATES.map((template) => (
            <Card key={template.id} className="border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <Badge variant="outline" className={`text-xs ${CAT_COLORS[template.category]}`}>
                        {CAT_LABELS[template.category]}
                      </Badge>
                      {template.channels.map(ch => (
                        <span key={ch} className="flex items-center gap-1 text-xs text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
                          {CHANNEL_ICONS[ch]}{ch}
                        </span>
                      ))}
                    </div>
                    <p className="font-medium text-sm">{template.event}</p>
                    {template.sent > 0 && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Send className="h-3 w-3" />{template.sent.toLocaleString('fr-FR')} envois</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" />{template.openRate}% ouverture</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Switch checked={template.active} />
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => { setEditTemplate(template); setEditOpen(true); }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historique des envois</CardTitle>
              <CardDescription>Suivi de tous les envois automatiques et manuels</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead>Template / Message</TableHead>
                    <TableHead>Cible</TableHead>
                    <TableHead>Envoyés</TableHead>
                    <TableHead>Ouverts</TableHead>
                    <TableHead>Taux</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SEND_HISTORY.map((h) => (
                    <TableRow key={h.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">{h.template}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{h.target}</TableCell>
                      <TableCell className="text-sm">{h.sent.toLocaleString('fr-FR')}</TableCell>
                      <TableCell className="text-sm">{h.opened.toLocaleString('fr-FR')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted w-16 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((h.opened / h.sent) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round((h.opened / h.sent) * 100)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${h.type === 'auto' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'}`}>
                          {h.type === 'auto' ? 'Automatique' : 'Manuel'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{h.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit template dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTemplate ? 'Modifier le template' : 'Nouveau template'}</DialogTitle>
            <DialogDescription>Configurez le déclencheur, les canaux et le contenu du message.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Événement déclencheur</Label><Input defaultValue={editTemplate?.event} placeholder="Ex : Expiration abonnement (J-7)" /></div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select items={CAT_LABELS} defaultValue={editTemplate?.category ?? 'subscription'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CAT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Canaux d&apos;envoi</Label>
              {(['email', 'push', 'sms'] as const).map(ch => (
                <div key={ch} className="flex items-center justify-between rounded-lg border border-border/40 p-2.5">
                  <span className="flex items-center gap-2 text-sm capitalize">{CHANNEL_ICONS[ch]}{ch}</span>
                  <Switch defaultChecked={editTemplate?.channels.includes(ch)} />
                </div>
              ))}
            </div>
            <div className="space-y-1.5"><Label>Objet email</Label><Input placeholder="[PIQ Academy] {événement}" /></div>
            <div className="space-y-1.5"><Label>Corps du message</Label><Textarea rows={4} placeholder="Bonjour {prénom}, votre abonnement expire dans…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button onClick={() => setEditOpen(false)}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual send dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5" />Envoi manuel ciblé</DialogTitle>
            <DialogDescription>Envoyez une annonce directement à un segment d&apos;utilisateurs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pays</Label>
                <Select items={{ all: 'Tous les pays', cm: 'Cameroun', sn: 'Sénégal' }}><SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les pays</SelectItem><SelectItem value="cm">Cameroun</SelectItem><SelectItem value="sn">Sénégal</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1.5">
                <Label>Classe</Label>
                <Select items={{ all: 'Toutes les classes', terminale: 'Terminale', '3eme': '3ème' }}><SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger><SelectContent><SelectItem value="all">Toutes les classes</SelectItem><SelectItem value="terminale">Terminale</SelectItem><SelectItem value="3eme">3ème</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Canaux</Label>
              {(['email', 'push', 'sms'] as const).map(ch => (
                <div key={ch} className="flex items-center justify-between rounded-lg border border-border/40 p-2.5">
                  <span className="flex items-center gap-2 text-sm capitalize">{CHANNEL_ICONS[ch]}{ch}</span>
                  <Switch />
                </div>
              ))}
            </div>
            <div className="space-y-1.5"><Label>Objet</Label><Input placeholder="Titre de l'annonce" /></div>
            <div className="space-y-1.5"><Label>Message</Label><Textarea rows={4} placeholder="Contenu de l'annonce…" /></div>
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>Cette action enverra une notification à <strong>tous les utilisateurs</strong> correspondant aux filtres sélectionnés. Vérifiez bien avant d&apos;envoyer.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>Annuler</Button>
            <Button className="gap-2" onClick={() => setSendOpen(false)}><Send className="h-4 w-4" />Envoyer maintenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
