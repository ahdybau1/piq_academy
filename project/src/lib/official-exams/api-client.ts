import type { OfficialExamRow, ExamPaperItem } from './types';

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

export function createOfficialExam(input: { countryId: string; classNodeId: string; name: string; examDate: string | null }) {
  return request('/api/official-exams', jsonInit('POST', input));
}

export function updateOfficialExam(input: { id: string; classNodeId: string; name: string; examDate: string | null }) {
  return request(`/api/official-exams/${input.id}`, jsonInit('PATCH', input));
}

export function deleteOfficialExam(input: { id: string; cascade?: boolean }) {
  const qs = input.cascade ? '?cascade=true' : '';
  return request(`/api/official-exams/${input.id}${qs}`, { method: 'DELETE' });
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
