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

interface NodeTypeStyle {
  icon: React.ReactNode;
  color: string;
}

const KNOWN_NODE_TYPE_STYLES: Record<string, NodeTypeStyle> = {
  pays: { icon: <Globe className="h-4 w-4" />, color: 'bg-blue-500' },
  section: { icon: <Layers className="h-4 w-4" />, color: 'bg-emerald-500' },
  enseignement: { icon: <School className="h-4 w-4" />, color: 'bg-violet-500' },
  classe: { icon: <GraduationCap className="h-4 w-4" />, color: 'bg-amber-500' },
  serie: { icon: <ListOrdered className="h-4 w-4" />, color: 'bg-rose-500' },
  cycle: { icon: <Network className="h-4 w-4" />, color: 'bg-indigo-500' },
  filiere: { icon: <TreePine className="h-4 w-4" />, color: 'bg-teal-500' },
};

const FALLBACK_NODE_TYPE_STYLE: NodeTypeStyle = { icon: <Layers className="h-4 w-4" />, color: 'bg-slate-500' };

function nodeTypeStyle(nodeType: AcademicNodeType): NodeTypeStyle {
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
  const config = nodeTypeStyle(node.node_type);

  const toggleExpand = () => {
    const next = new Set(expandedNodes);
    if (isExpanded) next.delete(node.id);
    else next.add(node.id);
    setExpandedNodes(next);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex cursor-pointer items-center gap-2 rounded-lg border-l-2 px-2 py-1.5 transition-all duration-150',
          selectedId === node.id
            ? 'border-l-primary bg-primary/10 shadow-sm'
            : 'border-l-transparent hover:translate-x-0.5 hover:bg-muted',
          !node.is_active && 'opacity-50'
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
          className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-muted-foreground/10"
        >
          {hasChildren ? (
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
                isExpanded && 'rotate-90'
              )}
            />
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
        </button>

        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded text-white shadow-sm transition-transform duration-150 group-hover:rotate-6 group-hover:scale-110',
            config.color
          )}
        >
          {config.icon}
        </div>

        <span className={cn('flex-1 text-sm', !node.is_active && 'line-through')}>{node.name}</span>

        <Badge variant="outline" className="text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
          {nodeTypeLabel(node.node_type)}
        </Badge>

        {!node.is_active && (
          <Badge variant="outline" className="text-[10px]">
            Désactivé
          </Badge>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-2 animate-in border-l border-border fade-in slide-in-from-top-1 duration-200">
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
    ? allNodes.filter(
        (n) =>
          n.id !== selectedNode.id &&
          !flattenTree([selectedNode]).some((d) => d.id === n.id)
      )
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
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un pays
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pays configurés', value: countryCount, icon: Globe, color: 'text-blue-500' },
          { label: 'Nœuds au total', value: nodeCount, icon: Layers, color: 'text-emerald-500' },
          { label: 'Profondeur maximale', value: maxDepth, icon: TreePine, color: 'text-violet-500' },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            className="animate-in fade-in slide-in-from-bottom-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <CardContent className="flex items-center gap-3 py-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {actionError && (
        <div className="animate-in rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 fade-in slide-in-from-top-1 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {actionError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="transition-shadow duration-300 hover:shadow-md lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Structure hiérarchique</CardTitle>
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <CardDescription>Cliquez sur un nœud pour voir les détails et actions disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {tree.length === 0 && !searchQuery ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Aucun pays configuré. Commencez par « Ajouter un pays ».
                </div>
              ) : searchQuery && filteredNodes ? (
                <div className="space-y-1">
                  {filteredNodes.map((node) => (
                    <div
                      key={node.id}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors hover:bg-muted',
                        selectedId === node.id && 'bg-primary/10'
                      )}
                      onClick={() => setSelectedId(node.id)}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded flex items-center justify-center text-white',
                          nodeTypeStyle(node.node_type).color
                        )}
                      >
                        {nodeTypeStyle(node.node_type).icon}
                      </div>
                      <span className="text-sm">{node.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {nodeTypeLabel(node.node_type)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
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

        <Card className="transition-shadow duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle>{selectedNode ? 'Détails du nœud' : 'Sélectionnez un nœud'}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div key={selectedNode.id} className="animate-in space-y-4 fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform duration-300 hover:scale-105',
                        nodeTypeStyle(selectedNode.node_type).color
                      )}
                    >
                      {nodeTypeStyle(selectedNode.node_type).icon}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedNode.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {nodeTypeLabel(selectedNode.node_type)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono text-xs">{selectedNode.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut:</span>
                      <Badge variant={selectedNode.is_active ? 'default' : 'secondary'} className="text-xs">
                        {selectedNode.is_active ? 'Actif' : 'Désactivé'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enfants:</span>
                      <span>{selectedNode.children.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Créé le:</span>
                      <span>{selectedNode.created_at ? new Date(selectedNode.created_at).toLocaleDateString('fr-FR') : '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={openEdit} disabled={isPending}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openCreateChild}
                      disabled={isPending}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Enfant
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => runAction(() => duplicateNode({ id: selectedNode.id }))}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Dupliquer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openMove}
                      disabled={isPending || selectedNode.node_type === ROOT_NODE_TYPE}
                    >
                      <MoveRight className="h-3.5 w-3.5 mr-1.5" />
                      Déplacer
                    </Button>
                    <Button variant="outline" size="sm" className="col-span-2" onClick={openHistory}>
                      <History className="h-3.5 w-3.5 mr-1.5" />
                      Historique
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      className={selectedNode.is_active ? 'text-amber-600' : 'text-emerald-600'}
                      onClick={() =>
                        runAction(() => setNodeActive({ id: selectedNode.id, isActive: !selectedNode.is_active }))
                      }
                    >
                      {selectedNode.is_active ? (
                        <>
                          <ToggleLeft className="h-3.5 w-3.5 mr-1.5" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <ToggleRight className="h-3.5 w-3.5 mr-1.5" />
                          Réactiver
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={openDelete} disabled={isPending}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                {selectedNode.children.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
                    <p className="font-medium">Ce nœud contient {selectedNode.children.length} enfant(s)</p>
                    <p className="text-xs mt-1">La suppression ou désactivation affectera les nœuds enfants.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Sélectionnez un nœud dans l&apos;arbre pour voir ses détails</p>
              </div>
            )}
          </CardContent>
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
                      newType === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
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
              dependencies.subscriptionTierCount > 0) && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 space-y-2 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                <p className="font-medium">Attention - Dépendances</p>
                <ul className="ml-4 list-disc text-xs space-y-1">
                  {dependencies.childCount > 0 && <li>{dependencies.childCount} nœud(s) enfant(s)</li>}
                  {dependencies.linkedSubjectCount > 0 && <li>{dependencies.linkedSubjectCount} matière(s) rattachée(s)</li>}
                  {dependencies.activeProfileCount > 0 && <li>{dependencies.activeProfileCount} élève(s) actif(s) rattaché(s)</li>}
                  {dependencies.subscriptionTierCount > 0 && (
                    <li>{dependencies.subscriptionTierCount} palier(s) d&apos;abonnement rattaché(s)</li>
                  )}
                </ul>
                {(dependencies.childCount > 0 || dependencies.subscriptionTierCount > 0) && (
                  <label className="flex items-center gap-2 pt-1 text-red-900 dark:text-red-300">
                    <Checkbox checked={cascadeDelete} onCheckedChange={(v) => setCascadeDelete(v === true)} />
                    Supprimer aussi tout le contenu lié (cascade)
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
                (((dependencies?.childCount ?? 0) > 0 || (dependencies?.subscriptionTierCount ?? 0) > 0) && !cascadeDelete)
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
              <p className="text-sm text-muted-foreground py-4">Chargement...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Aucune modification enregistrée.</p>
            ) : (
              <div className="space-y-3 py-2">
                {history.map((entry) => (
                  <div key={entry.id} className="border-b border-border pb-2 text-sm">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {entry.action_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {entry.created_at ? new Date(entry.created_at).toLocaleString('fr-FR') : '-'}
                      </span>
                    </div>
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
