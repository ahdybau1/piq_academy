import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { EstablishmentRow, EstablishmentPaperItem, EstablishmentTeacherItem } from './types';

export async function listEstablishments(countryId?: string): Promise<EstablishmentRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from('establishments')
    .select('id, country_id, name, city, is_active, created_at')
    .order('name');
  if (countryId) query = query.eq('country_id', countryId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listEstablishmentPapers(establishmentId: string): Promise<EstablishmentPaperItem[]> {
  const supabase = await createClient();
  const { data: papers, error } = await supabase
    .from('establishment_papers')
    .select('id, establishment_id, class_node_id, subject_id, year, document_url, correction_url, status, created_at')
    .eq('establishment_id', establishmentId)
    .order('year', { ascending: false });
  if (error) throw new Error(error.message);
  if (!papers || papers.length === 0) return [];

  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', papers.map((p) => p.subject_id));
  if (subjectsError) throw new Error(subjectsError.message);
  const subjectNameById = new Map((subjects ?? []).map((s) => [s.id, s.name]));

  const { data: nodes, error: nodesError } = await supabase
    .from('academic_nodes')
    .select('id, name')
    .in('id', papers.map((p) => p.class_node_id));
  if (nodesError) throw new Error(nodesError.message);
  const nodeNameById = new Map((nodes ?? []).map((n) => [n.id, n.name]));

  return papers.map((p) => ({
    ...p,
    subjectName: subjectNameById.get(p.subject_id) ?? null,
    className: nodeNameById.get(p.class_node_id) ?? null,
  }));
}

/**
 * Lecture via le client admin (service_role) : `admin_users` est réservé par RLS et cet
 * écran n'est qu'une consultation en lecture seule des rattachements existants (section
 * 4.1) — la gestion des comptes enseignant elle-même vit dans l'écran Comptes enseignant.
 */
export async function listEstablishmentTeachers(establishmentId: string): Promise<EstablishmentTeacherItem[]> {
  const admin = createAdminClient();
  const { data: links, error } = await admin
    .from('teacher_establishments')
    .select('teacher_id')
    .eq('establishment_id', establishmentId);
  if (error) throw new Error(error.message);
  if (!links || links.length === 0) return [];

  const { data: teachers, error: teachersError } = await admin
    .from('admin_users')
    .select('id, email')
    .in('id', links.map((l) => l.teacher_id));
  if (teachersError) throw new Error(teachersError.message);

  return (teachers ?? []).map((t) => ({ teacherId: t.id, email: t.email }));
}
