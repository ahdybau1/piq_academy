/**
 * `node_type` est un texte libre en base (colonne character varying, pas un enum) :
 * la profondeur et le vocabulaire de l'arbre varient réellement selon le pays
 * (certains pays ont 5-6 niveaux, d'autres 2-3, avec des intitulés différents).
 * Seul `pays` est réservé et structurel (toujours une racine, jamais un enfant).
 * Les autres types ci-dessous ne sont que des suggestions pour guider la saisie.
 */
export type AcademicNodeType = string;

export const ROOT_NODE_TYPE = 'pays' as const;

export const SUGGESTED_NODE_TYPES: readonly string[] = [
  'section',
  'enseignement',
  'classe',
  'serie',
  'cycle',
  'filiere',
  'option',
  'niveau',
];

const KNOWN_NODE_TYPE_LABELS: Record<string, string> = {
  pays: 'Pays',
  section: 'Section',
  enseignement: "Type d'enseignement",
  classe: 'Classe',
  serie: 'Série',
  cycle: 'Cycle',
  filiere: 'Filière',
  option: 'Option',
  niveau: 'Niveau',
};

/** Libellé lisible d'un type de nœud, y compris un type personnalisé non listé. */
export function nodeTypeLabel(nodeType: string): string {
  const known = KNOWN_NODE_TYPE_LABELS[nodeType.toLowerCase()];
  if (known) return known;
  return nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
}

/** Ligne brute telle que stockée dans academic_nodes. */
export interface AcademicNodeRow {
  id: string;
  parent_id: string | null;
  node_type: AcademicNodeType;
  name: string;
  country_id: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

/** Nœud enrichi avec ses enfants, pour l'affichage en arbre côté client. */
export interface AcademicTreeNode extends AcademicNodeRow {
  children: AcademicTreeNode[];
}

export interface AcademicNodeDependencies {
  childCount: number;
  linkedSubjectCount: number;
  activeProfileCount: number;
  subscriptionTierCount: number;
  officialExamCount: number;
  establishmentPaperCount: number;
  forumThreadCount: number;
  whatsappCommunityCount: number;
  contentTranslationClassCount: number;
}

export interface AuditLogEntry {
  id: string;
  admin_user_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string;
  before_json: Record<string, unknown> | null;
  after_json: Record<string, unknown> | null;
  created_at: string | null;
}

export function buildTree(rows: AcademicNodeRow[]): AcademicTreeNode[] {
  const byId = new Map<string, AcademicTreeNode>();
  rows.forEach((row) => byId.set(row.id, { ...row, children: [] }));

  const roots: AcademicTreeNode[] = [];
  byId.forEach((node) => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRec = (nodes: AcademicTreeNode[]) => {
    nodes.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);

  return roots;
}

/** Vrai si `maybeAncestorId` est un ancêtre (ou lui-même) de `nodeId` dans `rows`. */
export function isAncestor(rows: AcademicNodeRow[], maybeAncestorId: string, nodeId: string): boolean {
  const byId = new Map(rows.map((r) => [r.id, r]));
  let current: AcademicNodeRow | undefined = byId.get(nodeId);
  while (current) {
    if (current.id === maybeAncestorId) return true;
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return false;
}

export function collectDescendantIds(rows: AcademicNodeRow[], nodeId: string): string[] {
  const childrenOf = new Map<string, string[]>();
  rows.forEach((r) => {
    if (!r.parent_id) return;
    childrenOf.set(r.parent_id, [...(childrenOf.get(r.parent_id) ?? []), r.id]);
  });

  const result: string[] = [];
  const stack = [...(childrenOf.get(nodeId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    result.push(id);
    stack.push(...(childrenOf.get(id) ?? []));
  }
  return result;
}
