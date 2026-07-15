'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TriangleAlert as AlertTriangle, TrendingDown } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { ROLE_CONFIGS } from '@/lib/roles-config';

const COST_DATA = [
  { provider: 'Claude', tokens: '12.5M', inputCost: 45, outputCost: 135, total: 180 },
  { provider: 'Gemini', tokens: '8.2M', inputCost: 25, outputCost: 40, total: 65 },
];

export default function AICostsPage() {
  const { currentUser } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  if (!roleConfig.canViewIACosts) {
    return (
      <>
        <div className="flex items-center justify-center h-[70vh]">
          <Card className="w-[400px]">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
              <h3 className="font-semibold text-lg mb-2">Accès restreint</h3>
              <p className="text-muted-foreground">Les coûts IA sont visibles uniquement par les Super Admins.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Coûts IA" description="Analyse des coûts par fournisseur et type d'agent" breadcrumbs={[{ label: 'Intelligence Artificielle' }, { label: 'Coûts' }]} />
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total mois</p><p className="text-2xl font-bold">245 EUR</p><DollarSign className="h-8 w-8 text-primary/50 absolute right-4" /></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">vs. Revenus</p><p className="text-2xl font-bold">0.58%</p><TrendingDown className="h-8 w-8 text-emerald-500/50 absolute right-4" /></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Budget mensuel</p><p className="text-2xl font-bold">300 EUR</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Tokens traités</p><p className="text-2xl font-bold">20.7M</p></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Budget du mois</CardTitle><CardDescription>Consommation : 245 EUR / 300 EUR</CardDescription></CardHeader>
          <CardContent>
            <Progress value={82} className="h-3" />
            <div className="flex justify-between text-sm mt-2"><span className="text-muted-foreground">82% utilisé</span><span className="text-muted-foreground">55 EUR restants</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Coûts par fournisseur</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Fournisseur</TableHead><TableHead>Tokens</TableHead><TableHead>Coût entrée</TableHead><TableHead>Coût sortie</TableHead><TableHead>Total</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {COST_DATA.map((item) => (
                  <TableRow key={item.provider}>
                    <TableCell className="font-medium">{item.provider}</TableCell>
                    <TableCell>{item.tokens}</TableCell>
                    <TableCell>{item.inputCost} EUR</TableCell>
                    <TableCell>{item.outputCost} EUR</TableCell>
                    <TableCell className="font-semibold">{item.total} EUR</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Alertes de seuil</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200"><span>Alerte 50%</span><Badge className="bg-emerald-600">Déclenchée</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200"><span>Alerte 80%</span><Badge className="bg-emerald-600">Déclenchée</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border"><span>Alerte 100%</span><Badge variant="outline">Non atteinte</Badge></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
