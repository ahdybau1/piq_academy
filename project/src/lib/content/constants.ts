import type { UserRole } from '@/lib/types';

/** Rôles avec `canManageContent: true` dans roles-config.ts. */
export const CONTENT_ADMIN_ROLES: readonly UserRole[] = ['super_admin', 'admin_pays', 'admin_contenu'];

/**
 * Le catalogue pédagogique (section 16.0) exclut explicitement admin_pays : "Accès :
 * Super-admin et Admin contenu (selon délégation)".
 */
export const CATALOG_ADMIN_ROLES: readonly UserRole[] = ['super_admin', 'admin_contenu'];

/** Modèles de catalogue proposés en section 16.0, chargeables en un clic pour une matière. */
export const CATALOG_TEMPLATES: Record<string, string[]> = {
  Mathématiques: [
    'Définition',
    'Propriété',
    'Théorème',
    'Démonstration',
    'Exemple',
    'Méthode',
    "Exercice d'application",
    "Exercice d'approfondissement",
  ],
  Français: [
    'Texte support',
    "Biographie d'auteur",
    'Notion grammaticale',
    'Figure de style',
    'Méthodologie (dissertation/commentaire)',
    'Exercice de langue',
  ],
  'Physique-Chimie': ['Définition', 'Loi', 'Formule', 'Expérience/protocole', 'Schéma', 'Application numérique', 'Exercice'],
  SVT: ['Définition', 'Schéma annoté', 'Observation', 'Expérience', 'Synthèse', 'Exercice'],
  'Histoire-Géographie': ['Repère chronologique', 'Document source', 'Carte', 'Biographie', 'Synthèse', 'Exercice'],
  'Langues vivantes': [
    'Vocabulaire',
    'Règle de grammaire',
    'Dialogue type',
    'Exercice de compréhension',
    "Exercice d'expression",
  ],
};

export const CONTENT_STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  en_attente_de_validation: 'En attente de validation',
  a_corriger: 'À corriger',
  rejete: 'Rejeté',
  publie: 'Publié',
};
