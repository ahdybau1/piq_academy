'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tags, Plus, Trash2 } from 'lucide-react';
import {
  fetchCatalog,
  createCatalogEntry,
  setCatalogEntryActive,
  deleteCatalogEntry,
  loadCatalogTemplate,
} from '@/lib/content/api-client';
import { CATALOG_TEMPLATES } from '@/lib/content/constants';
import type { SubjectRow, CatalogEntryRow } from '@/lib/content/types';
import { cn } from '@/lib/utils';

export function CatalogPageView({ initialSubjects }: { initialSubjects: SubjectRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [entries, setEntries] = useState<CatalogEntryRow[]>([]);
  const [newElementType, setNewElementType] = useState('');
  const [error, setError] = useState<string | null>(null);

  const refreshEntries = (subjectId: string) => fetchCatalog(subjectId).then(setEntries).catch((e) => setError(e.message));

  useEffect(() => {
    if (!selectedSubjectId) return;
    refreshEntries(selectedSubjectId);
  }, [selectedSubjectId]);

  const selectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setEntries([]);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalogue pédagogique"
        description="Types d'éléments par matière — préalable à tout éditeur de contenu structuré (section 16.0)"
        breadcrumbs={[{ label: 'Académique' }, { label: 'Catalogue pédagogique' }]}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Matières</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {initialSubjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => selectSubject(subject.id)}
                  className={cn(
                    'w-full text-left text-sm p-2 rounded-md hover:bg-muted',
                    selectedSubjectId === subject.id && 'bg-primary/10 font-medium'
                  )}
                >
                  {subject.name}
                </button>
              ))}
              {initialSubjects.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">Aucune matière pour l&apos;instant.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tags className="h-4 w-4" />
              Types d&apos;éléments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedSubjectId && (
              <p className="text-sm text-muted-foreground py-8 text-center">Sélectionnez une matière.</p>
            )}
            {selectedSubjectId && (
              <>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm', !entry.is_active && 'text-muted-foreground line-through')}>
                          {entry.element_type}
                        </span>
                        <Badge variant="outline" className={entry.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                          {entry.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={entry.is_active}
                          onCheckedChange={(checked) =>
                            runAction(
                              () => setCatalogEntryActive({ id: entry.id, isActive: checked }),
                              () => refreshEntries(selectedSubjectId)
                            )
                          }
                        />
                        <button
                          onClick={() =>
                            runAction(() => deleteCatalogEntry({ id: entry.id }), () => refreshEntries(selectedSubjectId))
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {entries.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">Aucun type pour l&apos;instant.</p>
                  )}
                </div>

                <div className="flex gap-2 border-t pt-3">
                  <Input
                    placeholder="Nom du type (ex: Théorème)"
                    value={newElementType}
                    onChange={(e) => setNewElementType(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      runAction(
                        () => createCatalogEntry({ subjectId: selectedSubjectId, elementType: newElementType }),
                        () => {
                          setNewElementType('');
                          refreshEntries(selectedSubjectId);
                        }
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Charger un modèle proposé (cahier des charges, section 16.0)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(CATALOG_TEMPLATES).map((templateKey) => (
                      <Button
                        key={templateKey}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          runAction(
                            () => loadCatalogTemplate({ subjectId: selectedSubjectId, templateKey }),
                            () => refreshEntries(selectedSubjectId)
                          )
                        }
                      >
                        {templateKey}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
