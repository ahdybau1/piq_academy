export interface OfficialExamRow {
  id: string;
  country_id: string;
  class_node_id: string;
  name: string;
  exam_date: string | null;
  created_at: string | null;
}

/** Épreuve d'un examen officiel pour une matière et une année données (section 3). */
export interface ExamPaperRow {
  id: string;
  exam_id: string;
  subject_id: string;
  year: number;
  document_url: string | null;
  correction_url: string | null;
  correction_visible: boolean;
  created_at: string | null;
}

/** Épreuve enrichie du nom de sa matière, pour affichage sans exposer l'id brut. */
export interface ExamPaperItem extends ExamPaperRow {
  subjectName: string | null;
}
