/** Ligne brute telle que stockée dans accounts. */
export interface AccountRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  status: 'actif' | 'suspendu';
  created_at: string | null;
}

/** Ligne brute telle que stockée dans profiles. */
export interface ProfileRow {
  id: string;
  account_id: string;
  class_node_id: string | null;
  status: 'actif' | 'archivé';
  subscription_tier: string | null;
  school_year: string | null;
}

/** Profil enrichi du nom de classe/pays, résolus via academic_nodes. */
export interface EnrichedProfile extends ProfileRow {
  className: string | null;
  countryName: string | null;
}

/** Ligne brute telle que stockée dans sessions (session unique stricte côté app élève). */
export interface SessionRow {
  id: string;
  account_id: string;
  device_fingerprint: string | null;
  platform: string | null;
  created_at: string | null;
  is_active: boolean;
}

/** Ligne brute telle que stockée dans transactions (montants réservés à canViewFinancials). */
export interface TransactionRow {
  id: string;
  profile_id: string;
  amount: number;
  operator: string | null;
  status: string;
  aggregator_ref: string | null;
  created_at: string | null;
}

export interface AccountListItem extends AccountRow {
  profiles: EnrichedProfile[];
}

/**
 * true si le profil a des subscriptions ou transactions liées : dans ce cas,
 * "supprimer" anonymise plutôt que de supprimer réellement la ligne (traçabilité
 * comptable/litige). Voir anonymizeAccount / deleteOrAnonymizeProfile.
 */
export interface AccountDetailProfile extends EnrichedProfile {
  hasFinancialHistory: boolean;
}

export interface AccountDetail extends AccountRow {
  profiles: AccountDetailProfile[];
  sessions: SessionRow[];
  transactions: TransactionRow[];
  hasFinancialHistory: boolean;
}
