'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HelpCircle, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const FAQ_ITEMS = [
  { q: 'Comment réinitialiser mon mot de passe ?', c: 'Rendez-vous sur la page de connexion et cliquez sur "Mot de passe oublié".' },
  { q: 'Comment ajouter un enseignant ?', c: 'Allez dans Utilisateurs > Enseignants > Ajouter un enseignant.' },
  { q: 'Comment valider un contenu ?', c: 'Allez dans Validation > File de validation, puis cliquez sur Approuver ou Rejeter.' },
  { q: 'Comment créer un événement ?', c: 'Allez dans Engagement > Événements > Nouvel événement.' },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (idx: string) => {
    setOpenItems(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader title="FAQ interne" description="Foire aux questions pour les administrateurs" breadcrumbs={[{ label: 'Support' }, { label: 'FAQ' }]} />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions fréquentes</CardTitle>
                <CardDescription>Réponses aux questions courantes</CardDescription>
              </div>
              <div className="relative w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, idx) => (
                <Collapsible key={idx} open={openItems.includes(idx.toString())} onOpenChange={() => toggleItem(idx.toString())}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-100 text-left font-medium text-sm">
                    {item.q}
                    <ChevronDown className={`h-4 w-4 transition-transform ${openItems.includes(idx.toString()) ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3 text-muted-foreground text-sm">
                    {item.c}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
