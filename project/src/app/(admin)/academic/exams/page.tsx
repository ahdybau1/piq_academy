import { requireRole } from '@/lib/auth/current-admin';
import { listOfficialExams } from '@/lib/official-exams/queries';
import { OFFICIAL_EXAM_ADMIN_ROLES } from '@/lib/official-exams/constants';
import { ExamsPageView } from '@/components/academic/exams-page';
import { getResolvedCountry } from '@/lib/country-scope';

export default async function OfficialExamsPage() {
  // Garde de rôle côté serveur : redirige vers /unauthorized si le rôle n'est pas autorisé.
  // Ceci est une protection de confort — la vraie barrière est la policy RLS sur official_exams/exam_papers.
  await requireRole([...OFFICIAL_EXAM_ADMIN_ROLES]);

  const { selectedCountryId } = await getResolvedCountry();
  const exams = await listOfficialExams(selectedCountryId ?? undefined);

  return <ExamsPageView initialExams={exams} countryId={selectedCountryId} />;
}
