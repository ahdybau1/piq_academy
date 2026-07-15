import { requireRole } from '@/lib/auth/current-admin';
import { listAcademicNodes } from '@/lib/academic/queries';
import { buildTree } from '@/lib/academic/types';
import { ACADEMIC_ADMIN_ROLES } from '@/lib/academic/constants';
import { AcademicTreeView } from '@/components/academic/academic-tree-view';
import { getResolvedCountry } from '@/lib/country-scope';

export default async function AcademicTreePage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur academic_nodes.
  await requireRole([...ACADEMIC_ADMIN_ROLES]);

  const { selectedCountryId } = await getResolvedCountry();
  const nodes = await listAcademicNodes(selectedCountryId ?? undefined);
  const tree = buildTree(nodes);

  return <AcademicTreeView initialTree={tree} />;
}
