'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Globe, Plus, Edit, Download, Upload, Search,
  CheckCircle, AlertTriangle, Languages
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const LANGUAGES = [
  { code: 'fr', name: 'Français', native: 'Français', flag: '🇫🇷', active: true, progress: 100, translatedKeys: 1248, totalKeys: 1248, admin: true, student: true },
  { code: 'en', name: 'Anglais', native: 'English', flag: '🇬🇧', active: true, progress: 87, translatedKeys: 1086, totalKeys: 1248, admin: true, student: true },
  { code: 'ar', name: 'Arabe', native: 'العربية', flag: '🇸🇦', active: false, progress: 23, translatedKeys: 287, totalKeys: 1248, admin: false, student: true },
  { code: 'pt', name: 'Portugais', native: 'Português', flag: '🇧🇷', active: false, progress: 5, translatedKeys: 62, totalKeys: 1248, admin: false, student: false },
];

const KEYS_SAMPLE = [
  { key: 'nav.dashboard', fr: 'Tableau de bord', en: 'Dashboard', ar: 'لوحة القيادة', status: 'complete' },
  { key: 'nav.academic', fr: 'Académique', en: 'Academic', ar: 'أكاديمي', status: 'complete' },
  { key: 'nav.users', fr: 'Utilisateurs', en: 'Users', ar: '', status: 'missing_ar' },
  { key: 'validation.approve', fr: 'Approuver', en: 'Approve', ar: '', status: 'missing_ar' },
  { key: 'validation.reject', fr: 'Rejeter', en: 'Reject', ar: 'رفض', status: 'complete' },
  { key: 'subscription.monthly', fr: 'Mensuel', en: 'Monthly', ar: '', status: 'missing_ar' },
  { key: 'ui.save', fr: 'Enregistrer', en: 'Save', ar: 'حفظ', status: 'complete' },
  { key: 'ui.cancel', fr: 'Annuler', en: 'Cancel', ar: 'إلغاء', status: 'complete' },
];

export default function TranslationsPage() {
  const [search, setSearch] = useState('');
  const [addLangOpen, setAddLangOpen] = useState(false);
  const [editKeyOpen, setEditKeyOpen] = useState(false);
  const [editKey, setEditKey] = useState<(typeof KEYS_SAMPLE)[0] | null>(null);
  const [tab, setTab] = useState('languages');

  const filteredKeys = KEYS_SAMPLE.filter(k =>
    k.key.toLowerCase().includes(search.toLowerCase()) ||
    k.fr.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="Langues & Traductions"
        description="Administrez les langues disponibles et les traductions de l'interface"
        breadcrumbs={[{ label: 'Système' }, { label: 'Langues & Traductions' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exporter (.json)</Button>
            <Button className="gap-2" onClick={() => setAddLangOpen(true)}>
              <Plus className="h-4 w-4" />Ajouter une langue
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Langues actives', value: LANGUAGES.filter(l => l.active).length.toString(), icon: <Globe className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10' },
          { label: 'Clés de traduction', value: '1 248', icon: <Languages className="h-5 w-5 text-violet-500" />, bg: 'bg-violet-500/10' },
          { label: 'Langues incomplètes', value: LANGUAGES.filter(l => l.progress < 100 && l.active).length.toString(), icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-500/10' },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card className="border-border/40">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p><p className="mt-1.5 text-2xl font-bold">{kpi.value}</p></div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="languages">Langues</TabsTrigger>
          <TabsTrigger value="keys">Clés de traduction</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-3">
          {LANGUAGES.map((lang) => (
            <Card key={lang.code} className="border-border/40">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{lang.name}</h3>
                          <span className="text-muted-foreground text-sm">({lang.native})</span>
                          <Badge variant="outline" className={`text-xs ${lang.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                            {lang.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-1">
                          {lang.admin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                          {lang.student && <Badge variant="secondary" className="text-xs">Élève</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Switch checked={lang.active} />
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                          <Upload className="h-3.5 w-3.5" />Importer
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{lang.translatedKeys} / {lang.totalKeys} clés traduites</span>
                        <span className={`font-semibold ${lang.progress === 100 ? 'text-emerald-600' : lang.progress > 50 ? 'text-amber-600' : 'text-red-600'}`}>{lang.progress}%</span>
                      </div>
                      <Progress value={lang.progress} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par clé ou texte…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Card className="border-border/40">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead>Clé</TableHead>
                    <TableHead>🇫🇷 Français</TableHead>
                    <TableHead>🇬🇧 Anglais</TableHead>
                    <TableHead>🇸🇦 Arabe</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.map((k) => (
                    <TableRow key={k.key} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="font-mono text-xs text-muted-foreground">{k.key}</TableCell>
                      <TableCell className="text-sm">{k.fr}</TableCell>
                      <TableCell className="text-sm">{k.en || <span className="text-muted-foreground/50">—</span>}</TableCell>
                      <TableCell className="text-sm">{k.ar || <span className="text-red-400 text-xs">Manquant</span>}</TableCell>
                      <TableCell>
                        {k.status === 'complete'
                          ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                          : <AlertTriangle className="h-4 w-4 text-amber-500" />
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditKey(k); setEditKeyOpen(true); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add language dialog */}
      <Dialog open={addLangOpen} onOpenChange={setAddLangOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Ajouter une langue</DialogTitle><DialogDescription>La nouvelle langue sera visible dans les paramètres de l&apos;application.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Code langue (ISO 639-1)</Label><Input placeholder="Ex : es, pt, de…" /></div>
            <div className="space-y-1.5"><Label>Nom (en français)</Label><Input placeholder="Ex : Espagnol" /></div>
            <div className="space-y-1.5"><Label>Nom natif</Label><Input placeholder="Ex : Español" /></div>
            <div className="flex items-center justify-between"><Label>Disponible côté élève</Label><Switch /></div>
            <div className="flex items-center justify-between"><Label>Disponible côté admin</Label><Switch /></div>
            <div className="space-y-1.5">
              <Label>Fichier de traduction initial (optionnel)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                <Upload className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">JSON ou CSV, max 1 Mo</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLangOpen(false)}>Annuler</Button>
            <Button onClick={() => setAddLangOpen(false)}>Ajouter la langue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit key dialog */}
      <Dialog open={editKeyOpen} onOpenChange={setEditKeyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Modifier la traduction</DialogTitle><DialogDescription className="font-mono text-xs">{editKey?.key}</DialogDescription></DialogHeader>
          {editKey && (
            <div className="space-y-3 py-2">
              {[{ lang: '🇫🇷 Français', val: editKey.fr, key: 'fr' }, { lang: '🇬🇧 Anglais', val: editKey.en, key: 'en' }, { lang: '🇸🇦 Arabe', val: editKey.ar, key: 'ar' }].map(item => (
                <div key={item.key} className="space-y-1.5"><Label>{item.lang}</Label><Input defaultValue={item.val} placeholder="Traduction…" /></div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditKeyOpen(false)}>Annuler</Button>
            <Button onClick={() => setEditKeyOpen(false)}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
