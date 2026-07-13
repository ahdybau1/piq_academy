'use client';

import React, { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { nodeTypeLabel } from '@/lib/academic/types';
import type { AcademicNodeRow } from '@/lib/academic/types';

/**
 * Sélecteur en cascade respectant les échelons réels de l'arbre académique (section → type
 * d'enseignement → cycle → classe → série, etc.) — le nombre de niveaux et leur intitulé
 * varient par pays, donc on suit simplement les enfants réels à chaque étape plutôt que de
 * supposer une profondeur fixe. N'affiche jamais que le nom du nœud à choisir à chaque
 * niveau : le pays est déjà connu via le périmètre actif (navbar), inutile de le répéter.
 */
export function HierarchicalNodeSelect({
  nodes,
  countryId,
  value,
  onChange,
  disabled,
  leavesOnly = true,
  excludeLeafIds,
  compact = false,
}: {
  nodes: AcademicNodeRow[];
  countryId: string;
  /** Id du nœud final sélectionné (feuille — classe ou série selon la profondeur du pays). */
  value: string;
  onChange: (leafId: string) => void;
  disabled?: boolean;
  /** Si true (par défaut), seuls les nœuds sans enfant sont des choix valides finaux. */
  leavesOnly?: boolean;
  /** Feuilles à exclure des options du dernier niveau (ex. classes déjà liées à la matière). */
  excludeLeafIds?: string[];
  /** Style compact (étiquettes plus petites, sans <Label>) — pour un usage inline (ex. "ajouter une classe liée"). */
  compact?: boolean;
}) {
  const childrenOf = useMemo(() => {
    const map = new Map<string, AcademicNodeRow[]>();
    for (const n of nodes) {
      if (!n.parent_id) continue;
      map.set(n.parent_id, [...(map.get(n.parent_id) ?? []), n]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }
    return map;
  }, [nodes]);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Reconstitue la chaîne de sélections menant à `value` (utile pour pré-remplir un formulaire d'édition).
  const derivedPath = useMemo(() => {
    if (!value) return [];
    const chain: string[] = [];
    let cur = nodeById.get(value);
    while (cur && cur.parent_id) {
      chain.unshift(cur.id);
      cur = nodeById.get(cur.parent_id);
    }
    return chain;
  }, [value, nodeById]);

  const [manualPath, setManualPath] = useState<string[] | null>(null);
  const path = manualPath ?? derivedPath;

  const levels: AcademicNodeRow[][] = [];
  let parentId = countryId;
  for (const selectedId of path) {
    const options = childrenOf.get(parentId) ?? [];
    if (options.length === 0) break;
    levels.push(options);
    parentId = selectedId;
  }
  const excludeSet = useMemo(() => new Set(excludeLeafIds ?? []), [excludeLeafIds]);
  const nextOptions = (childrenOf.get(parentId) ?? []).filter((o) => {
    const isLeaf = (childrenOf.get(o.id) ?? []).length === 0;
    return !(isLeaf && excludeSet.has(o.id));
  });
  if (nextOptions.length > 0) levels.push(nextOptions);

  const handleSelect = (depth: number, id: string) => {
    const newPath = [...path.slice(0, depth), id];
    setManualPath(newPath);
    const hasChildren = (childrenOf.get(id) ?? []).length > 0;
    if (!leavesOnly || !hasChildren) onChange(id);
    else onChange('');
  };

  return (
    <div className={compact ? 'flex flex-wrap items-center gap-1.5' : 'space-y-3'}>
      {levels.map((options, depth) => {
        const levelLabel = nodeTypeLabel(options[0]?.node_type ?? '');
        return (
          <div key={depth} className={compact ? undefined : undefined}>
            {!compact && <Label>{levelLabel}</Label>}
            <Select
              items={Object.fromEntries(options.map((o) => [o.id, o.name]))}
              value={path[depth] ?? ''}
              onValueChange={(v) => v && handleSelect(depth, v)}
              disabled={disabled}
            >
              <SelectTrigger className={compact ? 'h-7 w-40 rounded-full border-dashed text-xs' : 'mt-1'}>
                <SelectValue placeholder={compact ? levelLabel : `Sélectionner — ${levelLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id} className={compact ? 'text-xs' : undefined}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
      {levels.length === 0 && <p className="text-xs text-muted-foreground">Aucune classe disponible pour ce pays.</p>}
    </div>
  );
}
