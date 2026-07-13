import type { ContentStatus } from '@/lib/content/types';

export interface EstablishmentRow {
  id: string;
  country_id: string;
  name: string;
  city: string | null;
  is_active: boolean;
  created_at: string | null;
}

/** Épreuve d'établissement (section 4.2) — soumise au même workflow de validation que le contenu pédagogique. */
export interface EstablishmentPaperRow {
  id: string;
  establishment_id: string;
  class_node_id: string;
  subject_id: string;
  year: number;
  document_url: string | null;
  correction_url: string | null;
  status: ContentStatus;
  created_at: string | null;
}

/** Épreuve enrichie des libellés classe/matière, pour affichage sans exposer les ids bruts. */
export interface EstablishmentPaperItem extends EstablishmentPaperRow {
  subjectName: string | null;
  className: string | null;
}

/** Enseignant rattaché à un établissement (teacher_establishments), lecture seule ici. */
export interface EstablishmentTeacherItem {
  teacherId: string;
  email: string;
}
