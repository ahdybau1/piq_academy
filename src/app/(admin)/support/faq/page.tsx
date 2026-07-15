'use client';

import { useState } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, CreditCard as Edit, Trash2, ChevronDown, Circle as HelpCircle, BookOpen, Users, Settings, Shield, CreditCard, GripVertical, Eye } from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } };

const CATEGORIES = [
  { id: 'all', label: 'Toutes', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'content', label: 'Contenu', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'users', label: 'Utilisateurs', icon: <Users className="h-4 w-4" /> },
  { id: 'technical', label: 'Technique', icon: <Settings className="h-4 w-4" /> },
  { id: 'permissions', label: 'Permissions', icon: <Shield className="h-4 w-4" /> },
  { id: 'payments', label: 'Paiements', icon: <CreditCard className="h-4 w-4" /> },
];

const FAQ_ITEMS = [
  { id: 'f1', category: 'content', question: 'Comment valider un contenu soumis par un enseignant ?', answer: 'Allez dans Validation → File de validation. Sélectionnez le contenu dans la liste, lisez le rapport de pré-analyse IA, puis cliquez sur Approuver, Demander une correction ou Rejeter avec motif. L\'auteur reçoit une notification automatique.', tags: ['validation', 'contenu', 'workflow'], views: 234, published: true },
  { id: 'f2', category: 'users', question: 'Comment suspendre un compte élève ?', answer: 'Allez dans Utilisateurs → Comptes élèves. Recherchez le compte par nom ou email. Ouvrez le détail, puis cliquez sur Suspendre dans les actions. Vous pouvez ajouter un motif interne. Le compte est immédiatement bloqué et l\'élève voit un message d\'erreur à la connexion.', tags: ['suspension', 'élève', 'compte'], views: 189, published: true },
  { id: 'f3', category: 'content', question: 'Comment créer un nouvel arbre académique (nouveau pays) ?', answer: 'Allez dans Académique → Arbre académique. Cliquez sur Ajouter une entrée au niveau pays. Renseignez le nom, la langue officielle et les paramètres de calendrier scolaire. Vous pourrez ensuite y rattacher des sections, types d\'enseignement, classes et séries.', tags: ['arbre', 'pays', 'académique'], views: 156, published: true },
  { id: 'f4', category: 'permissions', question: 'Comment créer un nouveau compte administrateur ?', answer: 'Allez dans Utilisateurs → Administrateurs. Cliquez sur Créer un administrateur. Saisissez l\'email, le rôle (admin pays, admin contenu, modérateur...) et le périmètre géographique. Le compte reçoit un email d\'invitation avec lien de configuration du mot de passe et du 2FA.', tags: ['admin', 'rôle', 'création'], views: 142, published: true },
  { id: 'f5', category: 'technical', question: 'Comment réinitialiser le mot de passe d\'un utilisateur ?', answer: 'Via Utilisateurs → Comptes élèves ou Administrateurs, ouvrez le profil de l\'utilisateur. Dans les actions, cliquez sur Réinitialiser le mot de passe. Un email de réinitialisation est envoyé automatiquement. Pour les admins, vous pouvez aussi forcer la déconnexion de toutes les sessions actives.', tags: ['mot de passe', 'réinitialisation'], views: 128, published: true },
  { id: 'f6', category: 'payments', question: 'Comment traiter manuellement un paiement Mobile Money non confirmé ?', answer: 'Allez dans Commercial → Réconciliation. Filtrez par "En attente" ou "Écart détecté". Ouvrez le paiement concerné, vérifiez le relevé opérateur, saisissez le montant validé et une justification, puis cliquez sur Valider manuellement. L\'action est journalisée dans l\'audit log.', tags: ['paiement', 'mobile money', 'réconciliation'], views: 98, published: true },
  { id: 'f7', category: 'content', question: 'Comment forcer le déblocage anticipé d\'un trimestre ?', answer: 'Allez dans Académique → Contenu. Naviguez jusqu\'à la classe et la matière concernées. Ouvrez les paramètres du trimestre, puis cliquez sur Forcer le déblocage. Cette action est journalisée et visible dans l\'historique de l\'établissement concerné.', tags: ['trimestre', 'déblocage', 'contenu'], views: 87, published: false },
];

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<(typeof FAQ_ITEMS)[0] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggle = (id: string) => setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const filtered = FAQ_ITEMS.filter(item => {
    const matchSearch = item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.includes(search.toLowerCase()));
    const matchCat = category === 'all' || item.category === category;
    return matchSearch && matchCat;
  });

  const totalViews = FAQ_ITEMS.reduce((s, i) => s + i.views, 0);

  return (
    <div className="min-h-full space-y-8 pb-12">
      <PageHeader
        title="FAQ interne"
        description="Base de connaissances pour les administrateurs de la plateforme"
        breadcrumbs={[{ label: 'Support' }, { label: 'FAQ interne' }]}
        actions={
          <Button className="gap-2" onClick={() => { setEditItem(null); setEditOpen(true); }}>
            <Plus className="h-4 w-4" />Nouvelle entrée
          </Button>
        }
      />

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Entrées publiées', value: FAQ_ITEMS.filter(i => i.published).length.toString(), icon: <HelpCircle className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-500/10' },
          { label: 'Consultations totales', value: totalViews.toLocaleString('fr-FR'), icon: <Eye className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-500/10' },
          { label: 'Brouillons', value: FAQ_ITEMS.filter(i => !i.published).length.toString(), icon: <Edit className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-500/10' },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card className="border-border/40">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p>
                    <p className="mt-1.5 text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher dans la FAQ…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 h-9"
              onClick={() => setCategory(cat.id)}
            >
              {cat.icon}{cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* FAQ list */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border rounded-xl border-border/40">
            <HelpCircle className="h-10 w-10 mb-3 opacity-20" />
            <p className="font-medium">Aucun résultat trouvé</p>
            <Button variant="link" className="mt-2" onClick={() => { setSearch(''); setCategory('all'); }}>Effacer les filtres</Button>
          </div>
        )}
        {filtered.map((item) => {
          const isOpen = openItems.includes(item.id);
          const catLabel = CATEGORIES.find(c => c.id === item.category)?.label ?? item.category;
          return (
            <motion.div key={item.id} variants={fadeUp}>
              <Card className="border-border/40 overflow-hidden">
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggle(item.id)}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 flex-shrink-0 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-xs">{catLabel}</Badge>
                      {!item.published && <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Brouillon</Badge>}
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <p className="font-medium text-sm">{item.question}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.views} consultations</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={e => { e.stopPropagation(); setEditItem(item); setEditOpen(true); }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={e => { e.stopPropagation(); setDeleteConfirm(item.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="px-4 pb-4 pl-11 border-t border-border/40 pt-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Modifier l\'entrée' : 'Nouvelle entrée FAQ'}</DialogTitle>
            <DialogDescription>Cette entrée sera visible par tous les administrateurs dans leur tableau de bord.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select
                items={Object.fromEntries(CATEGORIES.filter(c => c.id !== 'all').map(c => [c.id, c.label]))}
                defaultValue={editItem?.category ?? 'content'}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Question</Label>
              <Input defaultValue={editItem?.question} placeholder="Comment faire… ?" />
            </div>
            <div className="space-y-1.5">
              <Label>Réponse</Label>
              <Textarea defaultValue={editItem?.answer} rows={6} placeholder="Réponse détaillée avec les étapes…" />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (séparés par des virgules)</Label>
              <Input defaultValue={editItem?.tags.join(', ')} placeholder="validation, contenu, workflow" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button onClick={() => setEditOpen(false)}>{editItem ? 'Enregistrer' : 'Créer et publier'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer cette entrée ?</DialogTitle><DialogDescription>Les administrateurs ne pourront plus y accéder.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => setDeleteConfirm(null)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
