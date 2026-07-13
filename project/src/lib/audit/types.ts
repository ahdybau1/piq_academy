export interface AuditLogRow {
  id: string;
  admin_user_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string;
  before_json: Record<string, unknown> | null;
  after_json: Record<string, unknown> | null;
  created_at: string | null;
}

/**
 * Entrée enrichie de l'identité de l'admin (email/rôle, via jointure sur admin_users) et
 * d'un libellé humain de l'entité concernée — dérivé de before_json/after_json (aucune
 * table cible n'a de vue centralisée par id, donc pas de résolution par jointure possible
 * pour chaque type d'entité ; on retombe sur le libellé du type si rien d'exploitable).
 */
export interface AuditLogItem extends AuditLogRow {
  adminEmail: string | null;
  adminRole: string | null;
  entityLabel: string;
}
