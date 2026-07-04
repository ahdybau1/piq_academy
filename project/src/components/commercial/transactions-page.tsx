'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DollarSign, Search, Eye, Download, Calendar } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  completed: { label: 'Complete', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Echouee', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Remboursee', color: 'bg-slate-100 text-slate-700' },
};

export default function TransactionsPage() {
  const [selectedTx, setSelectedTx] = useState<typeof MOCK_TRANSACTIONS[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTx = MOCK_TRANSACTIONS.filter(tx => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (searchQuery && !tx.userName.toLowerCase().includes(searchQuery.toLowerCase()) && !tx.id.includes(searchQuery)) return false;
    return true;
  });

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Transactions"
          description="Liste de toutes les transactions financieres"
          breadcrumbs={[
            { label: 'Commercial' },
            { label: 'Transactions' },
          ]}
          actions={
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenus (mois)</p>
                  <p className="text-2xl font-bold">42.1M FCFA</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{MOCK_TRANSACTIONS.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-amber-600">{MOCK_TRANSACTIONS.filter(t => t.status === 'pending').length}</p>
                </div>
                <Calendar className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Echouees</p>
                  <p className="text-2xl font-bold text-red-600">{MOCK_TRANSACTIONS.filter(t => t.status === 'failed').length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Liste des transactions</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-[250px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Utilisateur, ID..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="completed">Completes</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="failed">Echouees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTx.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                    <TableCell>{tx.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        tx.type === 'subscription' ? 'bg-blue-50 text-blue-700' :
                        tx.type === 'purchase' ? 'bg-violet-50 text-violet-700' :
                        'bg-pink-50 text-pink-700'
                      }>
                        {tx.type === 'subscription' ? 'Abonnement' : tx.type === 'purchase' ? 'Achat' : 'Don'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{tx.amount.toLocaleString()} {tx.currency}</TableCell>
                    <TableCell>{tx.provider}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_CONFIG[tx.status as keyof typeof STATUS_CONFIG].color}>
                        {STATUS_CONFIG[tx.status as keyof typeof STATUS_CONFIG].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTx(tx)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Details de la transaction</DialogTitle>
              <DialogDescription>Reference: {selectedTx?.id}</DialogDescription>
            </DialogHeader>
            {selectedTx && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilisateur</span>
                  <span>{selectedTx.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{selectedTx.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-semibold">{selectedTx.amount.toLocaleString()} {selectedTx.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span>{selectedTx.provider}</span>
                </div>
                {selectedTx.providerRef && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ref. provider</span>
                    <span className="font-mono text-xs">{selectedTx.providerRef}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedTx.status as keyof typeof STATUS_CONFIG].color}>
                    {STATUS_CONFIG[selectedTx.status as keyof typeof STATUS_CONFIG].label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(selectedTx.createdAt).toLocaleString('fr-FR')}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
