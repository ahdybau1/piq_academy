export type MediaType = 'image' | 'video' | 'audio' | 'pdf' | 'document';

export interface MediaRow {
  id: string;
  type: MediaType;
  url: string;
  uploaded_by: string | null;
  created_at: string | null;
}
