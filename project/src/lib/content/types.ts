export type ContentStatus = 'brouillon' | 'en_attente_de_validation' | 'a_corriger' | 'rejete' | 'publie';

export interface SubjectRow {
  id: string;
  name: string;
  node_id: string;
  created_at: string | null;
}

export interface ChapterRow {
  id: string;
  subject_id: string;
  term_id: string;
  title: string;
  introduction: string | null;
  display_order: number | null;
  created_at: string | null;
}

/** subject_class_links n'a pas de clé propre — (subject_id, class_node_id) l'identifie. */
export interface SubjectClassLinkItem {
  subject_id: string;
  class_node_id: string;
  className: string | null;
}

export interface TermRow {
  id: string;
  country_id: string;
  name: string;
  school_year: string;
  start_date: string;
  end_date: string;
}

export interface ChapterUnlockRow {
  id: string;
  chapter_id: string;
  establishment_id: string | null;
  admin_id: string | null;
  created_at: string | null;
}

export interface ChapterUnlockItem extends ChapterUnlockRow {
  establishmentName: string | null;
}

/** Lecture seule minimale pour peupler le picker d'établissement du déblocage anticipé. */
export interface EstablishmentRow {
  id: string;
  name: string;
  country_id: string;
}

export interface CatalogEntryRow {
  id: string;
  subject_id: string;
  element_type: string;
  is_active: boolean;
  created_at: string | null;
}

/**
 * Document Tiptap (éditeur riche, section 2.3). Les leçons créées avant l'éditeur riche
 * ont un `content_json` legacy `{ text?: string }` — voir `toEditorDoc()` dans
 * `src/components/editor/rich-lesson-editor.tsx` pour la conversion à l'affichage.
 */
export type LessonContent = Record<string, unknown>;

export interface LessonRow {
  id: string;
  chapter_id: string;
  title: string;
  content_json: LessonContent | null;
  display_order: number | null;
  /** Type pédagogique applicable (section 16.0) — ex. Définition, Théorème, Méthode. Optionnel. */
  catalog_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ContentVersionRow {
  id: string;
  content_id: string;
  version_number: number;
  content_json: LessonContent;
  status: ContentStatus;
  created_at: string | null;
}

/** Leçon enrichie du statut de sa dernière version, pour affichage dans l'écran de contenu. */
export interface LessonWithStatus extends LessonRow {
  latestVersion: ContentVersionRow | null;
}

export interface ValidationQueueRow {
  id: string;
  content_type: string;
  content_id: string;
  status: ContentStatus;
  submitted_by: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  ai_report_json: unknown | null;
  created_at: string | null;
  reviewed_at: string | null;
}

/**
 * Entrée de file enrichie : pour content_type === 'lesson', titre/chapitre/matière sont
 * résolus. Pour les autres types (aucun producteur réel dans cette passe), ces champs
 * restent null et l'écran retombe sur un affichage générique content_type/content_id.
 */
export interface ValidationQueueItem extends ValidationQueueRow {
  lessonTitle: string | null;
  chapterTitle: string | null;
  subjectName: string | null;
}
