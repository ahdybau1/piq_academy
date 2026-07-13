import type { OfficialExamRow, ExamPaperItem, ExamTypeClassItem, ExamPaperSharedExamItem } from './types';

interface ApiResult {
  error?: string;
}

async function request(url: string, init?: RequestInit): Promise<ApiResult> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: data?.error ?? `Erreur inattendue (${res.status}).` };
  }
  return {};
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export async function fetchOfficialExams(countryId?: string): Promise<OfficialExamRow[]> {
  const qs = countryId ? `?countryId=${encodeURIComponent(countryId)}` : '';
  const res = await fetch(`/api/official-exams${qs}`);
  if (!res.ok) throw new Error('Impossible de charger les examens officiels.');
  return res.json();
}

export function createOfficialExam(input: { countryId: string; name: string; examDate: string | null; initialClassNodeIds: string[] }) {
  return request('/api/official-exams', jsonInit('POST', input));
}

export function updateOfficialExam(input: { id: string; name: string; examDate: string | null }) {
  return request(`/api/official-exams/${input.id}`, jsonInit('PATCH', input));
}

export function deleteOfficialExam(input: { id: string; cascade?: boolean }) {
  const qs = input.cascade ? '?cascade=true' : '';
  return request(`/api/official-exams/${input.id}${qs}`, { method: 'DELETE' });
}

/** Classes/séries habilitées à composer un examen (section 3). */
export async function fetchExamTypeClasses(examTypeId: string): Promise<ExamTypeClassItem[]> {
  const res = await fetch(`/api/official-exams/type-classes?examTypeId=${encodeURIComponent(examTypeId)}`);
  if (!res.ok) throw new Error('Impossible de charger les classes habilitées.');
  return res.json();
}

export function addExamTypeClass(input: { examTypeId: string; classNodeId: string }) {
  return request('/api/official-exams/type-classes', jsonInit('POST', input));
}

export function removeExamTypeClass(input: { examTypeId: string; classNodeId: string }) {
  return request('/api/official-exams/type-classes', jsonInit('DELETE', input));
}

/** Matières applicables à un examen, union de toutes ses classes habilitées (tronc commun inclus). */
export async function fetchSubjectsForExamType(examTypeId: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`/api/official-exams/${examTypeId}/subjects`);
  if (!res.ok) throw new Error('Impossible de charger les matières de cet examen.');
  return res.json();
}

export async function fetchExamPapers(examId: string): Promise<ExamPaperItem[]> {
  const res = await fetch(`/api/official-exams/${examId}/papers`);
  if (!res.ok) throw new Error('Impossible de charger les épreuves.');
  return res.json();
}

export function createExamPaper(input: {
  examId: string;
  subjectId: string;
  year: number;
  documentUrl: string | null;
  correctionUrl: string | null;
  correctionVisible: boolean;
}) {
  return request(`/api/official-exams/${input.examId}/papers`, jsonInit('POST', input));
}

export function updateExamPaper(input: {
  id: string;
  subjectId: string;
  year: number;
  documentUrl: string | null;
  correctionUrl: string | null;
  correctionVisible: boolean;
}) {
  return request(`/api/official-exams/papers/${input.id}`, jsonInit('PATCH', input));
}

export function deleteExamPaper(input: { id: string }) {
  return request(`/api/official-exams/papers/${input.id}`, { method: 'DELETE' });
}

/** Autres examens avec lesquels une épreuve est partagée (ex. Philosophie commune à Probatoire C et D). */
export async function fetchExamPaperSharedExams(examPaperId: string): Promise<ExamPaperSharedExamItem[]> {
  const res = await fetch(`/api/official-exams/paper-shared-exams?examPaperId=${encodeURIComponent(examPaperId)}`);
  if (!res.ok) throw new Error('Impossible de charger les examens partagés.');
  return res.json();
}

export function addExamPaperSharedExam(input: { examPaperId: string; examTypeId: string }) {
  return request('/api/official-exams/paper-shared-exams', jsonInit('POST', input));
}

export function removeExamPaperSharedExam(input: { examPaperId: string; examTypeId: string }) {
  return request('/api/official-exams/paper-shared-exams', jsonInit('DELETE', input));
}

export async function uploadExamDocument(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/official-exams/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Échec de l'upload.");
  }
  return res.json();
}
