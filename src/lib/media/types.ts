export type MediaType = 'image' | 'video' | 'audio' | 'pdf' | 'document';

export interface MediaRow {
  id: string;
  type: MediaType;
  url: string;
  uploaded_by: string | null;
  /** Un média dépend toujours d'une classe/série précise (section 2.7). */
  class_node_id: string | null;
  created_at: string | null;
}

/** Média enrichi du libellé de sa classe, pour affichage sans exposer l'id brut. */
export interface MediaItem extends MediaRow {
  className: string | null;
}
