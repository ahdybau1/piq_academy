'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Copy,
  MoveRight,
  History,
  ToggleLeft,
  ToggleRight,
  Layers,
  Globe,
  GraduationCap,
  School,
  ListOrdered,
  Network,
  TreePine,
  Search,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import {
  createNode,
  updateNode,
  setNodeActive,
  deleteNode,
  moveNode,
  duplicateNode,
  fetchDependencies,
  fetchHistory,
} from '@/lib/academic/api-client';
import {
  ROOT_NODE_TYPE,
  SUGGESTED_NODE_TYPES,
  nodeTypeLabel,
  type AcademicTreeNode,
  type AcademicNodeType,
  type AcademicNodeDependencies,
  type AuditLogEntry,
} from '@/lib/academic/types';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/app-context';

interface NodeTypeStyle {
  icon: React.ReactNode;
  bg: string;
  ring: string;
}

const KNOWN_NODE_TYPE_STYLES: Record<string, NodeTypeStyle> = {
  pays: { icon: <Globe className="h-3.5 w-3.5" />, bg: 'bg-blue-500', ring: 'ring-blue-400/40' },
  section: { icon: <Layers className="h-3.5 w-3.5" />, bg: 'bg-emerald-500', ring: 'ring-emerald-400/40' },
  enseignement: { icon: <School className="h-3.5 w-3.5" />, bg: 'bg-violet-500', ring: 'ring-violet-400/40' },
  classe: { icon: <GraduationCap className="h-3.5 w-3.5" />, bg: 'bg-amber-500', ring: 'ring-amber-400/40' },
  serie: { icon: <ListOrdered className="h-3.5 w-3.5" />, bg: 'bg-rose-500', ring: 'ring-rose-400/40' },
  cycle: { icon: <Network className="h-3.5 w-3.5" />, bg: 'bg-indigo-500', ring: 'ring-indigo-400/40' },
  filiere: { icon: <TreePine className="h-3.5 w-3.5" />, bg: 'bg-teal-500', ring: 'ring-teal-400/40' },
};

const FALLBACK_NODE_TYPE_STYLE: NodeTypeStyle = {
  icon: <Layers className="h-3.5 w-3.5" />,
  bg: 'bg-slate-500',
  ring: 'ring-slate-400/40',
};

function getNodeTypeStyle(nodeType: AcademicNodeType): NodeTypeStyle {
  return KNOWN_NODE_TYPE_STYLES[nodeType.toLowerCase()] ?? FALLBACK_NODE_TYPE_STYLE;
}

function flattenTree(nodes: AcademicTreeNode[]): AcademicTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

function treeDepth(nodes: AcademicTreeNode[]): number {
  if (nodes.length === 0) return 0;
  return 1 + Math.max(...nodes.map((n) => treeDepth(n.children)));
}

function TreeNode({
  node,
  depth = 0,
  selectedId,
  onSelect,
  expandedNodes,
  setExpandedNodes,
}: {
  node: AcademicTreeNode;
  depth?: number;
  selectedId: string | null;
  onSelect: (node: AcademicTreeNode) => void;
  expandedNodes: Set<string>;
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedId === node.id;
  const config = getNodeTypeStyle(node.node_type);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedNodes);
    if (isExpanded) next.delete(node.id);
    else next.add(node.id);
    setExpandedNodes(next);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'group relative flex cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-2 transition-all duration-150',
          isSelected ? 'bg-primary/8 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          !node.is_active && 'opacity-40'
        )}
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {isSelected && <div className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-primary" />}

        <button
          onClick={toggleExpand}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted-foreground/10"
        >
          {hasChildren ? (
            <ChevronRight className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-90')} />
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
        </button>

        <div
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm ring-2 ring-transparent transition-all duration-150 group-hover:ring-2',
            config.bg,
            isSelected && config.ring
          )}
        >
          {config.icon}
        </div>

        <span className={cn('flex-1 truncate text-sm font-medium leading-tight', !node.is_active && 'line-through')}>{node.name}</span>

        <span
          className={cn(
            'shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100',
            isSelected && 'opacity-100'
          )}
        >
          {nodeTypeLabel(node.node_type)}
        </span>

        {!node.is_active && (
          <span className="shrink-0 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            Désactivé
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-5 animate-in border-l border-border/40 fade-in slide-in-from-top-1 duration-150">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedNodes={expandedNodes}
              setExpandedNodes={setExpandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AcademicTreeView({ initialTree }: { initialTree: AcademicTreeNode[] }) {
  const router = useRouter();
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser.role === 'super_admin';
  const [isPending, startTransition] = useTransition();

  // `initialTree` vient du Server Component (page.tsx) ; router.refresh() après
  // chaque action recharge les données serveur et fournit un nouvel `initialTree`.
  const tree = initialTree;

  const allNodes = useMemo(() => flattenTree(tree), [tree]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => (selectedId ? allNodes.find((n) => n.id === selectedId) ?? null : null),
    [allNodes, selectedId]
  );

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const [showCreateRoot, setShowCreateRoot] = useState(false);
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AcademicNodeType>('');
  const [editName, setEditName] = useState('');
  const countryCount = tree.length;
  const nodeCount = allNodes.length;
  const maxDepth = useMemo(() => treeDepth(tree), [tree]);
  const [moveTargetId, setMoveTargetId] = useState<string>('');
  const [cascadeDelete, setCascadeDelete] = useState(false);
  const [dependencies, setDependencies] = useState<AcademicNodeDependencies | null>(null);
  const [history, setHistory] = useState<AuditLogEntry[] | null>(null);

  const filteredNodes = searchQuery
    ? allNodes.filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const refresh = () => {
    router.refresh();
  };

  const runAction = (fn: () => Promise<{ error?: string }>, onSuccess?: () => void) => {
    setActionError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setActionError(result.error);
        return;
      }
      onSuccess?.();
      refresh();
    });
  };

  // La profondeur de l'arbre est libre (variable selon le pays) : le seul type
  // réservé est `pays` (toujours une racine). Tout autre nœud peut être créé
  // à n'importe quelle profondeur, avec un type de nœud personnalisé.
  const moveTargetOptions = selectedNode
    ? allNodes.filter((n) => n.id !== selectedNode.id && !flattenTree([selectedNode]).some((d) => d.id === n.id))
    : [];

  const openCreateChild = () => {
    if (!selectedNode) return;
    // Ni le type ni le nom ne sont pré-remplis : c'est à l'admin de les choisir,
    // les suggestions ci-dessous ne sont que des raccourcis facultatifs.
    setNewType('');
    setNewName('');
    setActionError(null);
    setShowCreateChild(true);
  };

  const openEdit = () => {
    if (!selectedNode) return;
    setEditName(selectedNode.name);
    setActionError(null);
    setShowEdit(true);
  };

  const openMove = () => {
    if (!selectedNode) return;
    setMoveTargetId('');
    setActionError(null);
    setShowMove(true);
  };

  const openDelete = async () => {
    if (!selectedNode) return;
    setCascadeDelete(false);
    setActionError(null);
    setDependencies(null);
    setShowDelete(true);
    const deps = await fetchDependencies(selectedNode.id);
    setDependencies(deps);
  };

  const openHistory = async () => {
    if (!selectedNode) return;
    setHistory(null);
    setShowHistory(true);
    const entries = await fetchHistory(selectedNode.id);
    setHistory(entries);
  };

  const config = selectedNode ? getNodeTypeStyle(selectedNode.node_type) : null;

  return (
    <div className="animate-in space-y-6 fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Arbre académique"
        description="Structure hiérarchique du système éducatif par pays"
        breadcrumbs={[
          { label: 'Académique', href: '/academic/tree' },
          { label: 'Arbre académique' },
        ]}
        actions={
          <Button
            className="transition-transform active:scale-95"
            onClick={() => {
              setNewName('');
              setActionError(null);
              setShowCreateRoot(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un pays
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pays configurés', value: countryCount, icon: Globe, bg: 'bg-blue-500/12 text-blue-600', border: 'from-blue-500' },
          { label: 'Nœuds au total', value: nodeCount, icon: Layers, bg: 'bg-emerald-500/12 text-emerald-600', border: 'from-emerald-500' },
          { label: 'Profondeur maximale', value: maxDepth, icon: TreePine, bg: 'bg-violet-500/12 text-violet-600', border: 'from-violet-500' },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden border border-border/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={cn('absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r to-transparent opacity-50', stat.border)} />
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', stat.bg)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
          <XCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Structure hiérarchique</CardTitle>
                <CardDescription className="mt-0.5">Cliquez sur un nœud pour voir les détails et actions disponibles</CardDescription>
              </div>
              <div className="relative w-[200px] shrink-0">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <ScrollArea className="h-[540px] pr-2">
              {tree.length === 0 && !searchQuery ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <Globe className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="font-semibold text-foreground">Aucun pays configuré</p>
                  <p className="mt-1 text-sm text-muted-foreground">Commencez par « Ajouter un pays » pour construire l&apos;arbre.</p>
                </div>
              ) : searchQuery && filteredNodes ? (
                <div className="space-y-0.5">
                  {filteredNodes.map((node) => {
                    const c = getNodeTypeStyle(node.node_type);
                    return (
                      <div
                        key={node.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors',
                          selectedId === node.id
                            ? 'bg-primary/8 text-foreground'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        )}
                        onClick={() => setSelectedId(node.id)}
                      >
                        <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm', c.bg)}>
                          {c.icon}
                        </div>
                        <span className="flex-1 text-sm font-medium">{node.name}</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {nodeTypeLabel(node.node_type)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {tree.map((node) => (
                    <TreeNode
                      key={node.id}
                      node={node}
                      selectedId={selectedId}
                      onSelect={(n) => setSelectedId(n.id)}
                      expandedNodes={expandedNodes}
                      setExpandedNodes={setExpandedNodes}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/60 shadow-sm">
          {!selectedNode ? (
            <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Layers className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="font-semibold text-foreground">Aucun nœud sélectionné</p>
              <p className="mt-1 text-sm text-muted-foreground">Cliquez sur un nœud dans l&apos;arbre pour voir ses détails.</p>
            </div>
          ) : (
            <div key={selectedNode.id} className="animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="brand-gradient-bg p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ring-2 ring-white/20', config?.bg)}>
                    {config?.icon &&
                      React.cloneElement(config.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: 'h-6 w-6' })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold leading-tight">{selectedNode.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                        {nodeTypeLabel(selectedNode.node_type)}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                          selectedNode.is_active ? 'bg-emerald-500/30 text-emerald-100' : 'bg-rose-500/30 text-rose-100'
                        )}
                      >
                        {selectedNode.is_active ? 'Actif' : 'Désactivé'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Enfants directs</dt>
                    <dd className="font-semibold">{selectedNode.children.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Créé le</dt>
                    <dd className="font-medium">
                      {selectedNode.created_at ? new Date(selectedNode.created_at).toLocaleDateString('fr-FR') : '—'}
                    </dd>
                  </div>
                </dl>

                {selectedNode.children.length > 0 && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Ce nœud contient {selectedNode.children.length} enfant(s)</p>
                      <p className="mt-0.5 opacity-80">La suppression ou désactivation affectera les nœuds enfants.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 border-t border-border/50 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={openEdit} disabled={isPending}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={openCreateChild} disabled={isPending}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Enfant
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={isPending}
                      onClick={() => runAction(() => duplicateNode({ id: selectedNode.id }))}
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Dupliquer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={openMove}
                      disabled={isPending || selectedNode.node_type === ROOT_NODE_TYPE}
                    >
                      <MoveRight className="mr-1.5 h-3.5 w-3.5" />
                      Déplacer
                    </Button>
                    <Button variant="outline" size="sm" className="col-span-2 h-8 text-xs" onClick={openHistory}>
                      <History className="mr-1.5 h-3.5 w-3.5" />
                      Historique
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      className={cn(
                        'h-8 text-xs',
                        selectedNode.is_active
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      )}
                      onClick={() => runAction(() => setNodeActive({ id: selectedNode.id, isActive: !selectedNode.is_active }))}
                    >
                      {selectedNode.is_active ? (
                        <>
                          <ToggleLeft className="mr-1.5 h-3.5 w-3.5" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <ToggleRight className="mr-1.5 h-3.5 w-3.5" />
                          Réactiver
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-rose-200 text-xs text-rose-700 hover:bg-rose-50"
                      onClick={openDelete}
                      disabled={isPending}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Créer un pays (racine) */}
      <Dialog open={showCreateRoot} onOpenChange={setShowCreateRoot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un pays</DialogTitle>
            <DialogDescription>Un pays est toujours une racine de l&apos;arbre académique.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="root-name">Nom</Label>
              <Input id="root-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Cameroun" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRoot(false)}>
              Annuler
            </Button>
            <Button
              disabled={isPending || !newName.trim()}
              onClick={() =>
                runAction(
                  () => createNode({ nodeType: ROOT_NODE_TYPE, name: newName, parentId: null }),
                  () => setShowCreateRoot(false)
                )
              }
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Créer un enfant */}
      <Dialog open={showCreateChild} onOpenChange={setShowCreateChild}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nœud enfant</DialogTitle>
            <DialogDescription>
              Sous « {selectedNode?.name} » ({selectedNode ? nodeTypeLabel(selectedNode.node_type) : ''})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="child-type">Type de nœud</Label>
              <Input
                id="child-type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Ex: section, classe, cycle, filière..."
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTED_NODE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewType(t)}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                      newType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {nodeTypeLabel(t)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                La profondeur de l&apos;arbre est libre : ce type peut être personnalisé et un enfant peut lui-même avoir des enfants, sans limite.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-name">Nom</Label>
              <Input id="child-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Troisième" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateChild(false)}>
              Annuler
            </Button>
            <Button
              disabled={isPending || !newName.trim() || !newType.trim() || !selectedNode}
              onClick={() =>
                selectedNode &&
                runAction(
                  () => createNode({ nodeType: newType, name: newName, parentId: selectedNode.id }),
                  () => setShowCreateChild(false)
                )
              }
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modifier */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le nœud</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              Annuler
            </Button>
            <Button
              disabled={isPending || !editName.trim() || !selectedNode}
              onClick={() =>
                selectedNode &&
                runAction(
                  () => updateNode({ id: selectedNode.id, name: editName }),
                  () => setShowEdit(false)
                )
              }
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Déplacer */}
      <Dialog open={showMove} onOpenChange={setShowMove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déplacer « {selectedNode?.name} »</DialogTitle>
            <DialogDescription>Choisissez le nouveau parent. Seules les destinations valides sont proposées.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="move-target">Nouveau parent</Label>
              <select
                id="move-target"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={moveTargetId}
                onChange={(e) => setMoveTargetId(e.target.value)}
              >
                <option value="">Sélectionner...</option>
                {moveTargetOptions.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({nodeTypeLabel(n.node_type)})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMove(false)}>
              Annuler
            </Button>
            <Button
              disabled={isPending || !moveTargetId || !selectedNode}
              onClick={() =>
                selectedNode &&
                runAction(
                  () => moveNode({ id: selectedNode.id, newParentId: moveTargetId }),
                  () => setShowMove(false)
                )
              }
            >
              Déplacer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supprimer */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer « {selectedNode?.name} » ?</DialogDescription>
          </DialogHeader>

          {dependencies === null ? (
            <p className="text-sm text-muted-foreground">Vérification des dépendances...</p>
          ) : (
            (dependencies.childCount > 0 ||
              dependencies.linkedSubjectCount > 0 ||
              dependencies.activeProfileCount > 0 ||
              dependencies.subscriptionTierCount > 0 ||
              dependencies.officialExamCount > 0 ||
              dependencies.establishmentPaperCount > 0 ||
              dependencies.forumThreadCount > 0 ||
              dependencies.whatsappCommunityCount > 0 ||
              dependencies.contentTranslationClassCount > 0) && (
              <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                <p className="font-medium">Attention - Dépendances</p>
                <ul className="ml-4 list-disc space-y-1 text-xs">
                  {dependencies.childCount > 0 && <li>{dependencies.childCount} nœud(s) enfant(s)</li>}
                  {dependencies.linkedSubjectCount > 0 && <li>{dependencies.linkedSubjectCount} matière(s) rattachée(s)</li>}
                  {dependencies.activeProfileCount > 0 && (
                    <li className="font-medium">
                      {dependencies.activeProfileCount} profil(s) élève rattaché(s)
                      {isSuperAdmin
                        ? ' — seront envoyés dans la corbeille avec la cascade (restaurables)'
                        : ' — réassignez-les à une autre classe (Comptes & Profils) avant de pouvoir supprimer, ou demandez à un Super-admin'}
                    </li>
                  )}
                  {dependencies.subscriptionTierCount > 0 && (
                    <li>{dependencies.subscriptionTierCount} palier(s) d&apos;abonnement rattaché(s)</li>
                  )}
                  {dependencies.officialExamCount > 0 && <li>{dependencies.officialExamCount} examen(s) officiel(s)</li>}
                  {dependencies.establishmentPaperCount > 0 && (
                    <li>{dependencies.establishmentPaperCount} épreuve(s) d&apos;établissement</li>
                  )}
                  {dependencies.forumThreadCount > 0 && <li>{dependencies.forumThreadCount} sujet(s) de forum</li>}
                  {dependencies.whatsappCommunityCount > 0 && (
                    <li>{dependencies.whatsappCommunityCount} communauté(s) WhatsApp</li>
                  )}
                  {dependencies.contentTranslationClassCount > 0 && (
                    <li>{dependencies.contentTranslationClassCount} traduction(s) associée(s)</li>
                  )}
                </ul>
                {(dependencies.childCount > 0 ||
                  dependencies.linkedSubjectCount > 0 ||
                  dependencies.subscriptionTierCount > 0 ||
                  (dependencies.activeProfileCount > 0 && isSuperAdmin) ||
                  dependencies.officialExamCount > 0 ||
                  dependencies.establishmentPaperCount > 0 ||
                  dependencies.forumThreadCount > 0 ||
                  dependencies.whatsappCommunityCount > 0 ||
                  dependencies.contentTranslationClassCount > 0) && (
                  <label className="flex items-center gap-2 pt-1 text-red-900 dark:text-red-300">
                    <Checkbox checked={cascadeDelete} onCheckedChange={(v) => setCascadeDelete(v === true)} />
                    Supprimer aussi tout le contenu lié (cascade) — envoyé dans la corbeille (restaurable) ; les
                    paliers d&apos;abonnement déjà vendus seront désactivés et détachés plutôt que supprimés
                  </label>
                )}
              </div>
            )
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={
                isPending ||
                !selectedNode ||
                ((dependencies?.activeProfileCount ?? 0) > 0 && !isSuperAdmin) ||
                (((dependencies?.childCount ?? 0) > 0 ||
                  (dependencies?.linkedSubjectCount ?? 0) > 0 ||
                  (dependencies?.subscriptionTierCount ?? 0) > 0 ||
                  (dependencies?.activeProfileCount ?? 0) > 0 ||
                  (dependencies?.officialExamCount ?? 0) > 0 ||
                  (dependencies?.establishmentPaperCount ?? 0) > 0 ||
                  (dependencies?.forumThreadCount ?? 0) > 0 ||
                  (dependencies?.whatsappCommunityCount ?? 0) > 0 ||
                  (dependencies?.contentTranslationClassCount ?? 0) > 0) &&
                  !cascadeDelete)
              }
              onClick={() =>
                selectedNode &&
                runAction(
                  () => deleteNode({ id: selectedNode.id, cascade: cascadeDelete }),
                  () => {
                    setShowDelete(false);
                    setSelectedId(null);
                  }
                )
              }
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Historique */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Historique — {selectedNode?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {history === null ? (
              <p className="py-4 text-sm text-muted-foreground">Chargement...</p>
            ) : history.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Aucune modification enregistrée.</p>
            ) : (
              <div className="space-y-2 py-2">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {entry.action_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {entry.created_at ? new Date(entry.created_at).toLocaleString('fr-FR') : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
