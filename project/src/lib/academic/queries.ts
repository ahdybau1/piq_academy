import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { AcademicNodeRow, AcademicNodeDependencies, AuditLogEntry } from './types';

export async function listAcademicNodes(): Promise<AcademicNodeRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('academic_nodes')
    .select('id, parent_id, node_type, name, country_id, display_order, is_active, created_at')
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getNodeDependencies(nodeId: string): Promise<AcademicNodeDependencies> {
  const supabase = await createClient();

  const [childRes, subjectRes, profileRes, tierRes] = await Promise.all([
    supabase.from('academic_nodes').select('id', { count: 'exact', head: true }).eq('parent_id', nodeId),
    supabase
      .from('subject_class_links')
      .select('subject_id', { count: 'exact', head: true })
      .eq('class_node_id', nodeId),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('class_node_id', nodeId)
      .eq('status', 'actif'),
    supabase
      .from('subscription_tiers')
      .select('id', { count: 'exact', head: true })
      .eq('class_node_id', nodeId),
  ]);

  return {
    childCount: childRes.count ?? 0,
    linkedSubjectCount: subjectRes.count ?? 0,
    activeProfileCount: profileRes.count ?? 0,
    subscriptionTierCount: tierRes.count ?? 0,
  };
}

export async function getNodeHistory(nodeId: string): Promise<AuditLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_log')
    .select('id, admin_user_id, action_type, entity_type, entity_id, before_json, after_json, created_at')
    .eq('entity_type', 'academic_nodes')
    .eq('entity_id', nodeId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
