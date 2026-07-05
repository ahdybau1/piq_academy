'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Calendar, Plus, Edit } from 'lucide-react';
import { fetchTerms, createTerm, updateTerm } from '@/lib/content/api-client';
import { fetchAcademicNodes } from '@/lib/academic/api-client';
import type { TermRow } from '@/lib/content/types';
import type { AcademicNodeRow } from '@/lib/academic/types';

function emptyForm() {
  return { name: '', schoolYear: '', startDate: '', endDate: '' };
}

export function TermsPageView() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [countries, setCountries] = useState<AcademicNodeRow[]>([]);
  const [countryId, setCountryId] = useState('');
  const [terms, setTerms] = useState<TermRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    fetchAcademicNodes()
      .then((nodes) => setCountries(nodes.filter((n) => n.node_type === 'pays')))
      .catch((e) => setError(e.message));
  }, []);

  const refreshTerms = (id: string) => fetchTerms(id).then(setTerms).catch((e) => setError(e.message));

  useEffect(() => {
    if (!countryId) return;
    refreshTerms(countryId);
  }, [countryId]);

  const selectCountry = (id: string) => {
    setCountryId(id);
    setTerms([]);
    setEditingId(null);
    setForm(emptyForm());
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const openEdit = (term: TermRow) => {
    setEditingId(term.id);
    setForm({ name: term.name, schoolYear: term.school_year, startDate: term.start_date, endDate: term.end_date });
  };

  const runAction = (fn: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  };

  const submit = () => {
    if (editingId) {
      runAction(() => updateTerm({ id: editingId, ...form }), () => {
        setEditingId(null);
        setForm(emptyForm());
        refreshTerms(countryId);
      });
    } else {
      runAction(() => createTerm({ countryId, ...form }), () => {
        setForm(emptyForm());
        refreshTerms(countryId);
      });
    }
  };

  const countryOptions = useMemo(() => countries.sort((a, b) => a.name.localeCompare(b.name)), [countries]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trimestres"
        description="Découpage temporel par pays (mécanisme invisible côté élève, section 1.8)"
        breadcrumbs={[{ label: 'Académique' }, { label: 'Trimestres' }]}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Sélection du pays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={countryId} onValueChange={(v) => selectCountry(v ?? '')}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Choisir un pays..." />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {countryId && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Trimestres de ce pays</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Année scolaire</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {terms.map((term) => (
                    <TableRow key={term.id}>
                      <TableCell>{term.name}</TableCell>
                      <TableCell>{term.school_year}</TableCell>
                      <TableCell>{term.start_date}</TableCell>
                      <TableCell>{term.end_date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(term)}>
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Modifier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {terms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        Aucun trimestre pour ce pays.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Modifier le trimestre' : 'Nouveau trimestre'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Nom</Label>
                <Input
                  placeholder="Trimestre 1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Année scolaire</Label>
                <Input
                  placeholder="2025-2026"
                  value={form.schoolYear}
                  onChange={(e) => setForm({ ...form, schoolYear: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Début</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <Label>Fin</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <Button variant="outline" className="flex-1" onClick={openCreate}>
                    Annuler
                  </Button>
                )}
                <Button className="flex-1" onClick={submit}>
                  <Plus className="h-4 w-4 mr-1" />
                  {editingId ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
