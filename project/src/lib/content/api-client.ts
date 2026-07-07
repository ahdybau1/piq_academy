import type {
  SubjectRow,
  ChapterRow,
  LessonWithStatus,
  ValidationQueueItem,
  SubjectClassLinkItem,
  TermRow,
  ChapterUnlockItem,
  CatalogEntryRow,
  EstablishmentRow,
} from './types';

/**
 * Seul point de contact entre le frontend (composants client) et les données.
 * Aucun appel Supabase ici — uniquement des requêtes vers l'API interne
 * (app/api/content/**). La logique et l'autorisation vivent côté serveur.
 */

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

export async function fetchSubjects(countryId?: string): Promise<SubjectRow[]> {
  const qs = countryId ? `?countryId=${encodeURIComponent(countryId)}` : '';
  const res = await fetch(`/api/content/subjects${qs}`);
  if (!res.ok) throw new Error('Impossible de charger les matières.');
  return res.json();
}

export function createSubject(input: { name: string; nodeId: string; additionalClassNodeIds: string[] }) {
  return request('/api/content/subjects', jsonInit('POST', input));
}

export async function fetchSubjectClassLinks(subjectId: string): Promise<SubjectClassLinkItem[]> {
  const res = await fetch(`/api/content/subject-class-links?subjectId=${encodeURIComponent(subjectId)}`);
  if (!res.ok) throw new Error('Impossible de charger les classes liées.');
  return res.json();
}

export function addSubjectClassLink(input: { subjectId: string; classNodeId: string }) {
  return request('/api/content/subject-class-links', jsonInit('POST', input));
}

export function removeSubjectClassLink(input: { subjectId: string; classNodeId: string }) {
  return request('/api/content/subject-class-links', jsonInit('DELETE', input));
}

export async function fetchChapters(subjectId: string): Promise<ChapterRow[]> {
  const res = await fetch(`/api/content/chapters?subjectId=${encodeURIComponent(subjectId)}`);
  if (!res.ok) throw new Error('Impossible de charger les chapitres.');
  return res.json();
}

export function createChapter(input: { subjectId: string; termId: string; title: string; introduction?: string }) {
  return request('/api/content/chapters', jsonInit('POST', input));
}

export function updateChapter(input: { id: string; title: string; introduction?: string; termId: string }) {
  return request(`/api/content/chapters/${input.id}`, jsonInit('PATCH', input));
}

export function moveChapter(input: { id: string; direction: 'up' | 'down'; subjectId: string }) {
  return request(`/api/content/chapters/${input.id}/move`, jsonInit('POST', input));
}

export async function fetchTerms(countryId?: string): Promise<TermRow[]> {
  const qs = countryId ? `?countryId=${encodeURIComponent(countryId)}` : '';
  const res = await fetch(`/api/content/terms${qs}`);
  if (!res.ok) throw new Error('Impossible de charger les trimestres.');
  return res.json();
}

export function createTerm(input: { countryId: string; name: string; schoolYear: string; startDate: string; endDate: string }) {
  return request('/api/content/terms', jsonInit('POST', input));
}

export function updateTerm(input: { id: string; name: string; schoolYear: string; startDate: string; endDate: string }) {
  return request(`/api/content/terms/${input.id}`, jsonInit('PATCH', input));
}

export async function fetchChapterUnlocks(chapterId: string): Promise<ChapterUnlockItem[]> {
  const res = await fetch(`/api/content/chapter-unlocks?chapterId=${encodeURIComponent(chapterId)}`);
  if (!res.ok) throw new Error('Impossible de charger les déblocages.');
  return res.json();
}

export function createChapterUnlock(input: { chapterId: string; establishmentId: string | null }) {
  return request('/api/content/chapter-unlocks', jsonInit('POST', input));
}

export function deleteChapterUnlock(input: { id: string }) {
  return request(`/api/content/chapter-unlocks/${input.id}`, { method: 'DELETE' });
}

export async function fetchEstablishments(countryId?: string): Promise<EstablishmentRow[]> {
  const qs = countryId ? `?countryId=${encodeURIComponent(countryId)}` : '';
  const res = await fetch(`/api/content/establishments${qs}`);
  if (!res.ok) throw new Error('Impossible de charger les établissements.');
  return res.json();
}

export async function fetchCatalog(subjectId: string): Promise<CatalogEntryRow[]> {
  const res = await fetch(`/api/content/catalog?subjectId=${encodeURIComponent(subjectId)}`);
  if (!res.ok) throw new Error('Impossible de charger le catalogue.');
  return res.json();
}

export function createCatalogEntry(input: { subjectId: string; elementType: string }) {
  return request('/api/content/catalog', jsonInit('POST', input));
}

export function setCatalogEntryActive(input: { id: string; isActive: boolean }) {
  return request(`/api/content/catalog/${input.id}`, jsonInit('PATCH', { isActive: input.isActive }));
}

export function deleteCatalogEntry(input: { id: string; cascade?: boolean }) {
  const qs = input.cascade ? '?cascade=true' : '';
  return request(`/api/content/catalog/${input.id}${qs}`, { method: 'DELETE' });
}

export function loadCatalogTemplate(input: { subjectId: string; templateKey: string }) {
  return request('/api/content/catalog/load-template', jsonInit('POST', input));
}

export function duplicateCatalogToSubject(input: { sourceSubjectId: string; targetSubjectId: string }) {
  return request('/api/content/catalog/duplicate', jsonInit('POST', input));
}

export async function fetchLessons(chapterId: string): Promise<LessonWithStatus[]> {
  const res = await fetch(`/api/content/lessons?chapterId=${encodeURIComponent(chapterId)}`);
  if (!res.ok) throw new Error('Impossible de charger les leçons.');
  return res.json();
}

export function createLesson(input: { chapterId: string; title: string; contentJson: Record<string, unknown>; catalogId: string | null }) {
  return request('/api/content/lessons', jsonInit('POST', input));
}

export function updateLesson(input: { id: string; title: string; contentJson: Record<string, unknown>; catalogId: string | null }) {
  return request(`/api/content/lessons/${input.id}`, jsonInit('PATCH', input));
}

export function submitForValidation(input: { lessonId: string }) {
  return request(`/api/content/lessons/${input.lessonId}/submit`, { method: 'POST' });
}

export async function fetchValidationQueue(status?: string, countryId?: string): Promise<ValidationQueueItem[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (countryId) params.set('countryId', countryId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`/api/content/validation-queue${qs}`);
  if (!res.ok) throw new Error('Impossible de charger la file de validation.');
  return res.json();
}

export function approveValidation(input: { queueId: string }) {
  return request(`/api/content/validation-queue/${input.queueId}/approve`, { method: 'POST' });
}

export function requestCorrection(input: { queueId: string; reason: string }) {
  return request(
    `/api/content/validation-queue/${input.queueId}/request-correction`,
    jsonInit('POST', { reason: input.reason })
  );
}

export function rejectDefinitively(input: { queueId: string; reason: string }) {
  return request(`/api/content/validation-queue/${input.queueId}/reject`, jsonInit('POST', { reason: input.reason }));
}
