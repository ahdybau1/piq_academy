import type {
  User,
  UserRole,
  Country,
  AcademicTreeNode,
  Subject,
  Chapter,
  Lesson,
  Exercise,
  OfficialExam,
  School,
  SchoolExam,
  ContentValidationItem,
  GradeContestation,
  ForumReport,
  WhatsAppCommunity,
  Event,
  Announcement,
  SupportTicket,
  Transaction,
  ReconciliationItem,
  RefundRequest,
  Donation,
  Referral,
  AIAgent,
  AIProcessingRecord,
  AuditLogEntry,
  DashboardStats,
  SubscriptionTier,
  ExternalService,
  BackupRecord,
  DataDeletionRequest,
  ExerciseResponseMode,
  SchoolYearPromotion,
  Advertiser,
  AdCampaign,
  CompositionModalityConfig,
  AccessibilityCheck,
  AccessibilityStats,
} from './types';

// Countries
export const MOCK_COUNTRIES: Country[] = [
  { id: 'cm', name: 'Cameroun', code: 'CM', flag: '🇨🇲', active: true },
  { id: 'sn', name: 'Sénégal', code: 'SN', flag: '🇸🇳', active: false },
  { id: 'ci', name: 'Côte d\'Ivoire', code: 'CI', flag: '🇨🇮', active: false },
  { id: 'mg', name: 'Madagascar', code: 'MG', flag: '🇲🇬', active: false },
];

// Users with different roles
export const MOCK_USERS: Record<UserRole, User> = {
  super_admin: {
    id: 'u1',
    email: 'admin.supreme@piqacademy.com',
    name: 'Marie Nguema',
    role: 'super_admin',
    avatar: undefined,
    country: undefined,
    createdAt: '2024-01-15',
    lastLogin: '2024-12-10T08:30:00',
    status: 'active',
  },
  admin_pays: {
    id: 'u2',
    email: 'admin.cam@piqacademy.com',
    name: 'Paul Mbeki',
    role: 'admin_pays',
    country: 'cm',
    createdAt: '2024-02-20',
    lastLogin: '2024-12-09T14:15:00',
    status: 'active',
  },
  admin_contenu: {
    id: 'u3',
    email: 'contenu@piqacademy.com',
    name: 'Sophie Atangana',
    role: 'admin_contenu',
    country: 'cm',
    createdAt: '2024-03-10',
    lastLogin: '2024-12-08T09:45:00',
    status: 'active',
  },
  enseignant: {
    id: 'u4',
    email: 'prof.mba@piqacademy.com',
    name: 'Jean-Baptiste Mba',
    role: 'enseignant',
    country: 'cm',
    createdAt: '2024-04-05',
    lastLogin: '2024-12-07T16:20:00',
    status: 'active',
  },
  moderateur: {
    id: 'u5',
    email: 'modo@piqacademy.com',
    name: 'Claire Fouda',
    role: 'moderateur',
    country: 'cm',
    createdAt: '2024-05-12',
    lastLogin: '2024-12-06T11:00:00',
    status: 'active',
  },
  support: {
    id: 'u6',
    email: 'support@piqacademy.com',
    name: 'Emmanuel Nkodo',
    role: 'support',
    country: 'cm',
    createdAt: '2024-06-01',
    lastLogin: '2024-12-10T07:00:00',
    status: 'active',
  },
  traducteur: {
    id: 'u7',
    email: 'trad@piqacademy.com',
    name: 'Aminata Diallo',
    role: 'traducteur',
    country: 'cm',
    createdAt: '2024-07-15',
    lastLogin: '2024-12-05T13:30:00',
    status: 'active',
  },
  validateur: {
    id: 'u8',
    email: 'valid@piqacademy.com',
    name: 'Ousmane Ba',
    role: 'validateur',
    country: 'cm',
    createdAt: '2024-08-20',
    lastLogin: '2024-12-04T10:00:00',
    status: 'active',
  },
};

// Academic tree for Cameroon
export const MOCK_ACADEMIC_TREE: AcademicTreeNode[] = [
  {
    id: 'cm',
    type: 'pays',
    name: 'Cameroun',
    code: 'CM',
    active: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    children: [
      {
        id: 's1',
        type: 'section',
        name: 'Premier Cycle',
        parentId: 'cm',
        active: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        children: [
          {
            id: 't1',
            type: 'type_enseignement',
            name: 'Général',
            parentId: 's1',
            active: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            children: [
              {
                id: 'c6e',
                type: 'classe',
                name: '6ème',
                parentId: 't1',
                active: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                children: [],
              },
              {
                id: 'c5e',
                type: 'classe',
                name: '5ème',
                parentId: 't1',
                active: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                children: [],
              },
              {
                id: 'c4e',
                type: 'classe',
                name: '4ème',
                parentId: 't1',
                active: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                children: [],
              },
              {
                id: 'c3e',
                type: 'classe',
                name: '3ème',
                parentId: 't1',
                active: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                children: [],
              },
            ],
          },
          {
            id: 't2',
            type: 'type_enseignement',
            name: 'Technique',
            parentId: 's1',
            active: false,
            createdAt: '2024-01-01',
            updatedAt: '2024-06-01',
            children: [],
          },
        ],
      },
      {
        id: 's2',
        type: 'section',
        name: 'Second Cycle',
        parentId: 'cm',
        active: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        children: [
          {
            id: 't3',
            type: 'type_enseignement',
            name: 'Général',
            parentId: 's2',
            active: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            children: [
              {
                id: 'c2nde',
                type: 'classe',
                name: '2nde',
                parentId: 't3',
                active: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                children: [
                  {
                    id: 'serA',
                    type: 'serie',
                    name: 'Série A',
                    parentId: 'c2nde',
                    active: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    children: [],
                  },
                  {
                    id: 'serC',
                    type: 'serie',
                    name: 'Série C',
                    parentId: 'c2nde',
                    active: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    children: [],
                  },
                  {
                    id: 'serD',
                    type: 'serie',
                    name: 'Série D',
                    parentId: 'c2nde',
                    active: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    children: [],
                  },
                ],
              },
              {
                id: 'c1ere',
                type: 'classe',
                name: '1ère',
                parentId: 't3',
                active: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                children: [
                  {
                    id: 'serA1',
                    type: 'serie',
                    name: 'Série A',
                    parentId: 'c1ere',
                    active: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    children: [],
                  },
                  {
                    id: 'serC1',
                    type: 'serie',
                    name: 'Série C',
                    parentId: 'c1ere',
                    active: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    children: [],
                  },
                  {
                    id: 'serD1',
                    type: 'serie',
                    name: 'Série D',
                    parentId: 'c1ere',
                    active: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    children: [],
                  },
                ],
              },
              {
                id: 'cTle',
                type: 'classe',
                name: 'Terminale',
                parentId: 't3',
                active: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                children: [
                  {
                    id: 'serAT',
                    type: 'serie',
                    name: 'Série A',
                    parentId: 'cTle',
                    active: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    children: [],
                  },
                  {
                    id: 'serCT',
                    type: 'serie',
                    name: 'Série C',
                    parentId: 'cTle',
                    active: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    children: [],
                  },
                  {
                    id: 'serDT',
                    type: 'serie',
                    name: 'Série D',
                    parentId: 'cTle',
                    active: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

// Subjects
export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Mathématiques', code: 'MATH', classes: ['c6e', 'c5e', 'c4e', 'c3e', 'c2nde', 'c1ere', 'cTle'], active: true },
  { id: 'sub2', name: 'Physique-Chimie', code: 'PHYC', classes: ['c4e', 'c3e', 'c2nde', 'c1ere', 'cTle'], active: true },
  { id: 'sub3', name: 'Français', code: 'FR', classes: ['c6e', 'c5e', 'c4e', 'c3e', 'c2nde', 'c1ere', 'cTle'], active: true },
  { id: 'sub4', name: 'Anglais', code: 'ANG', classes: ['c6e', 'c5e', 'c4e', 'c3e', 'c2nde', 'c1ere', 'cTle'], active: true },
  { id: 'sub5', name: 'Histoire-Géographie', code: 'HG', classes: ['c6e', 'c5e', 'c4e', 'c3e'], active: true },
  { id: 'sub6', name: 'Sciences de la Vie et de la Terre', code: 'SVT', classes: ['c5e', 'c4e', 'c3e', 'c2nde', 'c1ere', 'cTle'], active: true },
  { id: 'sub7', name: 'Philosophie', code: 'PHILO', classes: ['cTle'], active: true },
];

// Content validation items
export const MOCK_CONTENT_VALIDATION: ContentValidationItem[] = [
  {
    id: 'cv1',
    title: 'Les équations du second degré',
    type: 'lesson',
    author: 'Jean-Baptiste Mba',
    subject: 'Mathématiques',
    class: '1ère',
    status: 'pending',
    submittedAt: '2024-12-08T10:30:00',
    aiReport: { quality: 85, completeness: 92, errors: [] },
  },
  {
    id: 'cv2',
    title: 'Exercice - Lois de Newton',
    type: 'exercise',
    author: 'Marie-Claire Atangana',
    subject: 'Physique-Chimie',
    class: 'Terminale',
    status: 'pending',
    submittedAt: '2024-12-09T14:00:00',
    aiReport: { quality: 78, completeness: 65, errors: ['Figure manquante', 'Formules incomplètes'] },
  },
  {
    id: 'cv3',
    title: 'Le Romantisme - Mouvement littéraire',
    type: 'lesson',
    author: 'Paul Mbeki',
    subject: 'Français',
    class: '2nde',
    status: 'correction',
    submittedAt: '2024-12-07T09:15:00',
    aiReport: { quality: 60, completeness: 70, errors: ['Références bibliographiques manquantes'] },
  },
  {
    id: 'cv4',
    title: 'Sujet BEPC 2024 - Mathématiques',
    type: 'exam',
    author: 'Sophie Atangana',
    subject: 'Mathématiques',
    class: '3ème',
    status: 'draft',
    submittedAt: '2024-12-10T08:00:00',
  },
  {
    id: 'cv5',
    title: 'Cellule et division cellulaire',
    type: 'lesson',
    author: 'Emmanuel Nkodo',
    subject: 'SVT',
    class: '2nde',
    status: 'published',
    submittedAt: '2024-12-05T11:00:00',
    aiReport: { quality: 95, completeness: 98, errors: [] },
  },
];

// Grade contestations
export const MOCK_CONTESTATIONS: GradeContestation[] = [
  {
    id: 'ct1',
    studentName: 'Kouam Arnaud',
    studentId: 'stud001',
    examId: 'exam001',
    initialGrade: 11,
    reason: 'Je pense qu\'il y a une erreur dans la correction de la question 3. J\'ai obtenu 2 points alors que ma réponse est identique au corrigé.',
    status: 'open',
    deadline: '2024-12-20',
    assignedTo: 'u4',
  },
  {
    id: 'ct2',
    studentName: 'Ngono Béatrice',
    studentId: 'stud002',
    examId: 'exam002',
    initialGrade: 8,
    contestedGrade: 12,
    reason: 'La copie envoyée n\'est pas la mienne. Je demande une vérification.',
    status: 'reviewing',
    deadline: '2024-12-18',
    assignedTo: 'u3',
  },
  {
    id: 'ct3',
    studentName: 'Mvondo Christian',
    studentId: 'stud003',
    examId: 'exam003',
    initialGrade: 14,
    reason: 'Erreur de total des points sur ma copie.',
    status: 'resolved',
    deadline: '2024-12-15',
    resolution: {
      decision: 'revised',
      newGrade: 16,
      reason: 'Erreur de calcul confirmée',
      resolvedBy: 'u3',
      resolvedAt: '2024-12-12T10:00:00',
    },
  },
];

// Forum reports
export const MOCK_FORUM_REPORTS: ForumReport[] = [
  {
    id: 'fr1',
    messageId: 'msg001',
    reportedBy: 'Marie Tchoua',
    reason: 'Le message contient des propos discriminatoires envers les élèves du nord.',
    context: {
      beforeMessages: ['Pouvez-vous m\'expliquer cet exercice ?', 'Bien sûr, montre-moi l\'énoncé.', 'C\'est celui de la page 45.'],
      reportedMessage: 'Les éleves du nord ils sont nuls en math normal que tu comprends rien',
      afterMessages: ['Ce n\'est pas très respectueux...', 'Oui, merci de ton aide quand même.'],
    },
    status: 'pending',
    createdAt: '2024-12-09T15:30:00',
  },
  {
    id: 'fr2',
    messageId: 'msg002',
    reportedBy: 'Paul Ngaba',
    reason: 'Publicité non autorisée d\'un concurrent.',
    context: {
      beforeMessages: ['Quelqu\'un a essayé ce site ?', 'Non, ça a l\'air bien ?'],
      reportedMessage: 'Utilisez plutôt ***********.com, c\'est gratuit et mieux !',
      afterMessages: ['Merci mais on reste sur PIQ Academy'],
    },
    status: 'pending',
    createdAt: '2024-12-08T20:00:00',
  },
];

// WhatsApp communities
export const MOCK_WHATSAPP_COMMUNITIES: WhatsAppCommunity[] = [
  { id: 'wa1', classId: 'c6e', className: '6ème', link: 'https://chat.whatsapp.com/invite1', memberCount: 45, active: true, createdAt: '2024-09-01' },
  { id: 'wa2', classId: 'c5e', className: '5ème', link: 'https://chat.whatsapp.com/invite2', memberCount: 38, active: true, createdAt: '2024-09-01' },
  { id: 'wa3', classId: 'c4e', className: '4ème', link: 'https://chat.whatsapp.com/invite3', memberCount: 52, active: true, createdAt: '2024-09-01' },
  { id: 'wa4', classId: 'c3e', className: '3ème', link: 'https://chat.whatsapp.com/invite4', memberCount: 67, active: true, createdAt: '2024-09-01' },
  { id: 'wa5', classId: 'c2nde', className: '2nde', link: 'https://chat.whatsapp.com/invite5', memberCount: 89, active: true, createdAt: '2024-09-01' },
  { id: 'wa6', classId: 'c1ere', className: '1ère', link: 'https://chat.whatsapp.com/invite6', memberCount: 72, active: true, createdAt: '2024-09-01' },
  { id: 'wa7', classId: 'cTle', className: 'Terminale', link: 'https://chat.whatsapp.com/invite7', memberCount: 95, active: true, createdAt: '2024-09-01' },
];

// Events
export const MOCK_EVENTS: Event[] = [
  {
    id: 'ev1',
    type: 'mock_exam',
    name: 'Examen Blanc National - Bac 2025',
    country: 'cm',
    classes: ['cTle'],
    subjects: ['sub1', 'sub2', 'sub3'],
    startDate: '2025-02-15',
    endDate: '2025-02-22',
    registrationDeadline: '2025-02-10',
    price: 5000,
    status: 'registration_open',
  },
  {
    id: 'ev2',
    type: 'olympiad',
    name: 'Olympiades de Mathématiques - Session 2025',
    country: 'cm',
    classes: ['c3e', 'c2nde', 'c1ere', 'cTle'],
    subjects: ['sub1'],
    startDate: '2025-03-01',
    endDate: '2025-03-02',
    registrationDeadline: '2025-02-20',
    price: 2000,
    status: 'draft',
  },
  {
    id: 'ev3',
    type: 'mock_exam',
    name: 'Probatoire Blanc - Littéraire',
    country: 'cm',
    classes: ['c1ere'],
    subjects: ['sub3', 'sub4', 'sub5'],
    startDate: '2025-01-20',
    endDate: '2025-01-24',
    registrationDeadline: '2025-01-15',
    price: 3000,
    status: 'completed',
  },
];

// Announcements
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1',
    title: 'Maintenance programmée',
    content: 'Le site sera indisponible le dimanche 15 décembre de 2h à 6h pour une mise à jour importante.',
    urgency: 'medium',
    targetCountries: ['cm'],
    targetClasses: [],
    startDate: '2024-12-10',
    endDate: '2024-12-15',
    active: true,
    createdBy: 'u1',
    createdAt: '2024-12-10T09:00:00',
  },
  {
    id: 'ann2',
    title: 'Inscriptions Bac Blanc ouvertes !',
    content: 'Les inscriptions pour le Bac Blanc National 2025 sont ouvertes jusqu\'au 10 février. Inscrivez-vous dès maintenant !',
    urgency: 'high',
    targetCountries: ['cm'],
    targetClasses: ['cTle'],
    startDate: '2024-12-05',
    endDate: '2025-02-10',
    active: true,
    createdBy: 'u2',
    createdAt: '2024-12-05T10:00:00',
  },
];

// Support tickets
export const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'tk1',
    title: 'Impossible de télécharger le cours de mathématiques',
    category: 'technical',
    status: 'open',
    priority: 'medium',
    userType: 'eleve',
    userName: 'Kouam Arnaud',
    createdAt: '2024-12-10T08:00:00',
    lastUpdate: '2024-12-10T08:00:00',
    messages: [
      { id: 'm1', ticketId: 'tk1', sender: 'user', content: 'Bonjour, je n\'arrive pas à télécharger le cours sur les équations. J\'ai un message d\'erreur.', createdAt: '2024-12-10T08:00:00' },
    ],
  },
  {
    id: 'tk2',
    title: 'Problème de paiement via Orange Money',
    category: 'billing',
    status: 'waiting',
    priority: 'high',
    userType: 'parent',
    userName: 'Ngono Martin',
    createdAt: '2024-12-09T14:30:00',
    lastUpdate: '2024-12-10T09:15:00',
    messages: [
      { id: 'm2', ticketId: 'tk2', sender: 'user', content: 'J\'ai effectué un paiement de 5000 FCFA mais mon abonnement n\'est toujours pas actif.', createdAt: '2024-12-09T14:30:00' },
      { id: 'm3', ticketId: 'tk2', sender: 'support', content: 'Bonjour, nous vérifions votre transaction. Pouvez-vous nous envoyer le numéro de transaction ?', createdAt: '2024-12-09T15:00:00' },
      { id: 'm4', ticketId: 'tk2', sender: 'user', content: 'Le numéro est OM123456789', createdAt: '2024-12-10T09:15:00' },
    ],
  },
  {
    id: 'tk3',
    title: 'Erreur dans le corrigé du Bac 2024',
    category: 'content',
    status: 'resolved',
    priority: 'low',
    userType: 'eleve',
    userName: 'Mvondo Christian',
    createdAt: '2024-12-08T10:00:00',
    lastUpdate: '2024-12-09T11:30:00',
    messages: [
      { id: 'm5', ticketId: 'tk3', sender: 'user', content: 'Je pense qu\'il y a une erreur dans la question 4 du corrigé de mathématiques.', createdAt: '2024-12-08T10:00:00' },
      { id: 'm6', ticketId: 'tk3', sender: 'support', content: 'Merci pour votre signalement. Nous avons vérifié et corrigé l\'erreur.', createdAt: '2024-12-09T11:30:00' },
    ],
  },
];

// Transactions (for super_admin)
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tr1', userId: 'stud001', userName: 'Kouam Arnaud', type: 'subscription', amount: 5000, currency: 'XAF', status: 'completed', provider: 'Orange Money', providerRef: 'OM20241210001', createdAt: '2024-12-10T10:00:00' },
  { id: 'tr2', userId: 'stud002', userName: 'Ngono Béatrice', type: 'purchase', amount: 2000, currency: 'XAF', status: 'completed', provider: 'MTN Mobile Money', providerRef: 'MTN20241210002', createdAt: '2024-12-10T09:30:00' },
  { id: 'tr3', userId: 'stud003', userName: 'Mvondo Christian', type: 'donation', amount: 1000, currency: 'XAF', status: 'pending', provider: 'Orange Money', createdAt: '2024-12-09T18:00:00' },
  { id: 'tr4', userId: 'stud004', userName: 'Tchoua Marie', type: 'subscription', amount: 5000, currency: 'XAF', status: 'failed', provider: 'Express Union', providerRef: 'EU20241208003', createdAt: '2024-12-08T14:00:00' },
];

// Reconciliation items (for super_admin)
export const MOCK_RECONCILIATION: ReconciliationItem[] = [
  { id: 'rec1', providerRef: 'OM20241209001', dbAmount: 5000, providerAmount: 5000, userId: 'stud005', userName: 'Ateba Solange', operator: 'Orange Money', status: 'pending', createdAt: '2024-12-09T16:00:00' },
  { id: 'rec2', providerRef: 'MTN20241209002', dbAmount: 10000, providerAmount: 10000, userId: 'stud006', userName: 'Biya Roland', operator: 'MTN Mobile Money', status: 'matched', createdAt: '2024-12-09T12:00:00' },
  { id: 'rec3', providerRef: 'OM20241208003', dbAmount: 3000, providerAmount: 3500, userId: 'stud007', userName: 'Essomba Ruth', operator: 'Orange Money', status: 'discrepancy', createdAt: '2024-12-08T10:00:00' },
  { id: 'rec4', providerRef: 'MTN20241207004', dbAmount: 7500, providerAmount: 0, userId: 'stud008', userName: 'Owona Cédric', operator: 'MTN Mobile Money', status: 'discrepancy', createdAt: '2024-12-07T09:15:00' },
  { id: 'rec5', providerRef: 'OM20241206005', dbAmount: 2000, providerAmount: 2000, userId: 'stud009', userName: 'Zang Aurélie', operator: 'Orange Money', status: 'resolved', createdAt: '2024-12-06T08:30:00' },
];

// Refund requests (for super_admin)
export const MOCK_REFUNDS: RefundRequest[] = [
  { id: 'ref1', transactionId: 'tr1', userId: 'stud001', userName: 'Kouam Arnaud', email: 'arnaud.kouam@email.com', amount: 5000, reason: 'J\'ai été facturé deux fois pour le même abonnement.', subscriptionType: 'Mensuel', priority: 'high', status: 'pending', deadline: '2024-12-25', createdAt: '2024-12-10T11:00:00' },
  { id: 'ref2', transactionId: 'tr2', userId: 'stud002', userName: 'Ngono Béatrice', email: 'beatrice.ngono@email.com', amount: 2000, reason: 'Le document acheté ne correspond pas à la description.', subscriptionType: 'Boutique', priority: 'low', status: 'approved', deadline: '2024-12-20', createdAt: '2024-12-08T09:00:00' },
  { id: 'ref3', transactionId: 'tr3', userId: 'stud003', userName: 'Mvondo Christian', email: 'christian.mvondo@email.com', amount: 1000, reason: 'Don initié par erreur, montant non souhaité.', subscriptionType: 'Don', priority: 'medium', status: 'pending', deadline: '2024-12-22', createdAt: '2024-12-09T18:30:00' },
  { id: 'ref4', transactionId: 'tr4', userId: 'stud004', userName: 'Tchoua Marie', email: 'marie.tchoua@email.com', amount: 5000, reason: 'Paiement échoué mais montant débité par l\'opérateur.', subscriptionType: 'Annuel', priority: 'high', status: 'rejected', deadline: '2024-12-18', createdAt: '2024-12-08T15:00:00' },
];

// AI Agents
export const MOCK_AI_AGENTS: AIAgent[] = [
  { id: 'ai1', name: 'Structurateur', type: 'structuring', provider: 'claude', status: 'active', totalProcessed: 15420, lastActivity: '2024-12-10T10:30:00' },
  { id: 'ai2', name: 'Générateur d\'exercices', type: 'exercise_generation', provider: 'gemini', status: 'active', totalProcessed: 8750, lastActivity: '2024-12-10T09:45:00' },
  { id: 'ai3', name: 'Modérateur contenu', type: 'moderation', provider: 'claude', status: 'active', totalProcessed: 23000, lastActivity: '2024-12-10T10:00:00' },
  { id: 'ai4', name: 'OCR Documents', type: 'ocr', provider: 'gemini', status: 'inactive', totalProcessed: 5200 },
];

// AI Processing records
export const MOCK_AI_RECORDS: AIProcessingRecord[] = [
  { id: 'ar1', agentId: 'ai1', agentName: 'Structurateur', type: 'lesson_structure', inputTokens: 2500, outputTokens: 800, cost: 0.035, status: 'success', createdAt: '2024-12-10T10:30:00' },
  { id: 'ar2', agentId: 'ai2', agentName: 'Générateur d\'exercices', type: 'exercise_gen', inputTokens: 1200, outputTokens: 2500, cost: 0.042, status: 'success', createdAt: '2024-12-10T09:45:00' },
  { id: 'ar3', agentId: 'ai3', agentName: 'Modérateur contenu', type: 'content_check', inputTokens: 3500, outputTokens: 150, cost: 0.018, status: 'success', createdAt: '2024-12-10T10:00:00' },
  { id: 'ar4', agentId: 'ai1', agentName: 'Structurateur', type: 'lesson_structure', inputTokens: 1800, outputTokens: 600, cost: 0.025, status: 'failed', createdAt: '2024-12-10T08:15:00' },
];

// Audit log entries
export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'al1', userId: 'u1', userName: 'Marie Nguema', userRole: 'super_admin', action: 'CREATE', entityType: 'user', entityId: 'u9', entityLabel: 'new@piq.com', newValue: '{"email":"new@piq.com","role":"enseignant"}', createdAt: '2024-12-10T10:00:00' },
  { id: 'al2', userId: 'u2', userName: 'Paul Mbeki', userRole: 'admin_pays', action: 'UPDATE', entityType: 'lesson', entityId: 'l5', entityLabel: 'Les fonctions dérivées', oldValue: '{"status":"draft"}', newValue: '{"status":"published"}', createdAt: '2024-12-10T09:30:00' },
  { id: 'al3', userId: 'u3', userName: 'Sophie Atangana', userRole: 'admin_contenu', action: 'DELETE', entityType: 'exercise', entityId: 'ex12', entityLabel: 'Exercice obsolète', oldValue: '{"title":"Exercice obsolète"}', createdAt: '2024-12-09T16:00:00' },
  { id: 'al4', userId: 'u5', userName: 'Claire Fouda', userRole: 'moderateur', action: 'UPDATE', entityType: 'forum_message', entityId: 'msg005', entityLabel: 'Message de Junior K.', oldValue: '{"visible":true}', newValue: '{"visible":false,"reason":"propos inappropriés"}', createdAt: '2024-12-09T14:00:00' },
];

// Dashboard stats
export const MOCK_STATS: DashboardStats = {
  activeUsers: 12580,
  totalUsers: 15200,
  renewalRate: 78.5,
  topContent: [
    { id: 'c1', title: 'Les équations du second degré', views: 8500 },
    { id: 'c2', title: 'Théorème de Pythagore', views: 7200 },
    { id: 'c3', title: 'Le Romantisme', views: 4500 },
    { id: 'c4', title: 'Lois de Newton', views: 3800 },
    { id: 'c5', title: 'Division cellulaire', views: 3200 },
  ],
  successRate: 65.8,
  dailyActiveUsers: [11000, 10500, 11200, 10800, 11500, 10000, 9500, 10200, 11000, 11200],
  contentStats: {
    lessons: 2450,
    exercises: 8900,
    exams: 320,
  },
};

// Subscription tiers
export const MOCK_SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'tier1',
    name: 'Basique',
    price: 2500,
    features: { lessons: true, exercises: false, exams: false, forum: true, whatsapp: false },
    classIds: ['c6e', 'c5e'],
  },
  {
    id: 'tier2',
    name: 'Standard',
    price: 5000,
    features: { lessons: true, exercises: true, exams: true, forum: true, whatsapp: true },
    classIds: ['c6e', 'c5e', 'c4e', 'c3e'],
  },
  {
    id: 'tier3',
    name: 'Premium',
    price: 8000,
    features: { lessons: true, exercises: true, exams: true, forum: true, whatsapp: true, mock_exams: true },
    classIds: ['c2nde', 'c1ere', 'cTle'],
  },
];

// Schools
export const MOCK_SCHOOLS: School[] = [
  { id: 'sch1', name: 'Lycée Général Leclerc', countryId: 'cm', city: 'Yaoundé', type: 'public', active: true },
  { id: 'sch2', name: 'Lycée Général de Douala', countryId: 'cm', city: 'Douala', type: 'public', active: true },
  { id: 'sch3', name: 'Collège Libermann', countryId: 'cm', city: 'Douala', type: 'private', active: true },
  { id: 'sch4', name: 'Lycée Bilingue de Bafoussam', countryId: 'cm', city: 'Bafoussam', type: 'public', active: true },
];

// All students list (for user management)
export const MOCK_STUDENTS_USER_MANAGEMENT = [
  { id: 'su1', name: 'Kouam Arnaud', email: 'arnaud.kouam@email.com', phone: '+237 6XX XX XX 01', country: 'Cameroun', classe: 'Terminale C', status: 'active', createdAt: '2024-09-01', lastLogin: '2024-12-10T08:00:00' },
  { id: 'su2', name: 'Ngono Béatrice', email: 'beatrice.ngono@email.com', phone: '+237 6XX XX XX 02', country: 'Cameroun', classe: '1ère D', status: 'active', createdAt: '2024-08-15', lastLogin: '2024-12-09T14:30:00' },
  { id: 'su3', name: 'Mvondo Christian', email: 'christian.mvondo@email.com', phone: '+237 6XX XX XX 03', country: 'Cameroun', classe: '2nde', status: 'suspended', createdAt: '2024-07-20', lastLogin: '2024-11-15T10:00:00' },
  { id: 'su4', name: 'Tchoua Marie', email: 'marie.tchoua@email.com', phone: '+237 6XX XX XX 04', country: 'Cameroun', classe: '3ème', status: 'active', createdAt: '2024-10-01', lastLogin: '2024-12-08T16:45:00' },
  { id: 'su5', name: 'Fouda Emmanuel', email: 'emmanuel.fouda@email.com', phone: '+237 6XX XX XX 05', country: 'Cameroun', classe: '4ème', status: 'archived', createdAt: '2024-06-10', lastLogin: '2024-09-20T09:00:00' },
];

// Teachers list
export const MOCK_TEACHERS = [
  { id: 't1', name: 'Jean-Baptiste Mba', email: 'jb.mba@piqacademy.com', schools: ['Lycée Général Leclerc'], subjects: ['Mathématiques'], classes: ['Terminale C', '1ère C'], status: 'active', pendingRequest: false },
  { id: 't2', name: 'Marie-Claire Atangana', email: 'mc.atangana@piqacademy.com', schools: ['Collège Libermann', 'Lycée Général de Douala'], subjects: ['Physique-Chimie'], classes: ['Terminale D', '1ère D'], status: 'active', pendingRequest: true },
  { id: 't3', name: 'Paul Etoundi', email: 'p.etoundi@piqacademy.com', schools: ['Lycée Bilingue de Bafoussam'], subjects: ['Français', 'Philosophie'], classes: ['Terminale A'], status: 'active', pendingRequest: false },
];

// Donations
export const MOCK_DONATIONS: Donation[] = [
  { id: 'd1', donorName: 'Martin Nkodo', email: 'martin@email.com', amount: 5000, currency: 'XAF', cause: 'Bourses élèves défavorisés', provider: 'Orange Money', receiptSent: true, status: 'completed', createdAt: '2024-12-08' },
  { id: 'd2', donorName: 'Sylvie Atangana', email: 'sylvie@email.com', amount: 10000, currency: 'XAF', cause: 'Développement contenu', provider: 'MTN Mobile Money', receiptSent: false, status: 'completed', createdAt: '2024-12-05' },
  { id: 'd3', donorName: 'Jean-Pierre Fouda', email: 'jp@email.com', amount: 25000, currency: 'XAF', cause: 'Bourses élèves défavorisés', provider: 'MTN Mobile Money', receiptSent: false, status: 'pending', createdAt: '2024-12-10' },
  { id: 'd4', donorName: 'Grace Belinga', email: 'grace@email.com', amount: 15000, currency: 'XAF', cause: 'Développement contenu', provider: 'Orange Money', receiptSent: true, status: 'completed', createdAt: '2024-12-03' },
  { id: 'd5', donorName: 'Serge Amougou', email: 'serge@email.com', amount: 3000, currency: 'XAF', cause: 'Bourses élèves défavorisés', provider: 'Express Union', receiptSent: false, status: 'failed', createdAt: '2024-12-02' },
];

// Referrals
export const MOCK_REFERRALS: Referral[] = [
  { id: 'ref1', referrerId: 'u1', referrerName: 'Kouam Arnaud', referredId: 'u9', referredName: 'Mvondo Pierre', status: 'completed', reward: '500 FCFA', createdAt: '2024-12-01' },
  { id: 'ref2', referrerId: 'u2', referrerName: 'Ngono Béatrice', referredId: 'u10', referredName: 'Tchoua Paul', status: 'pending', reward: '500 FCFA', createdAt: '2024-12-08' },
];

// External Services Status
export const MOCK_EXTERNAL_SERVICES: ExternalService[] = [
  {
    id: 'svc1',
    name: 'Orange Money',
    type: 'payment',
    provider: 'Orange Cameroon',
    status: 'online',
    lastCheck: '2024-12-10T10:30:00',
    responseTime: 245,
    errorRate: 0.02,
  },
  {
    id: 'svc2',
    name: 'MTN Mobile Money',
    type: 'payment',
    provider: 'MTN Cameroon',
    status: 'degraded',
    lastCheck: '2024-12-10T10:28:00',
    responseTime: 1200,
    errorRate: 0.08,
    lastError: 'Timeout sur endpoint de validation',
    lastErrorAt: '2024-12-10T09:15:00',
  },
  {
    id: 'svc3',
    name: 'Express Union',
    type: 'payment',
    provider: 'Express Union',
    status: 'online',
    lastCheck: '2024-12-10T10:30:00',
    responseTime: 389,
    errorRate: 0.01,
  },
  {
    id: 'svc4',
    name: 'Claude API',
    type: 'ai',
    provider: 'Anthropic',
    status: 'online',
    lastCheck: '2024-12-10T10:30:00',
    responseTime: 1800,
    quotaUsed: 850000,
    quotaLimit: 1000000,
    quotaResetDate: '2024-12-15',
    errorRate: 0.005,
  },
  {
    id: 'svc5',
    name: 'Gemini API',
    type: 'ai',
    provider: 'Google',
    status: 'online',
    lastCheck: '2024-12-10T10:30:00',
    responseTime: 1200,
    quotaUsed: 450000,
    quotaLimit: 500000,
    quotaResetDate: '2024-12-31',
    errorRate: 0.008,
  },
];

// Backup Records
export const MOCK_BACKUPS: BackupRecord[] = [
  { id: 'bkp1', type: 'automatic', status: 'completed', size: 245.8, duration: 45, createdAt: '2024-12-10T02:00:00', completedAt: '2024-12-10T02:45:00' },
  { id: 'bkp2', type: 'automatic', status: 'completed', size: 244.2, duration: 42, createdAt: '2024-12-09T02:00:00', completedAt: '2024-12-09T02:42:00' },
  { id: 'bkp3', type: 'manual', status: 'completed', size: 243.5, duration: 38, createdAt: '2024-12-08T14:30:00', completedAt: '2024-12-08T15:08:00', triggeredBy: 'Marie Nguema' },
  { id: 'bkp4', type: 'automatic', status: 'failed', size: 0, createdAt: '2024-12-07T02:00:00', error: 'Connexion au stockage échouée' },
  { id: 'bkp5', type: 'automatic', status: 'completed', size: 241.0, duration: 40, createdAt: '2024-12-06T02:00:00', completedAt: '2024-12-06T02:40:00' },
];

// Data Deletion Requests
export const MOCK_DELETION_REQUESTS: DataDeletionRequest[] = [
  { id: 'del1', userId: 'stud001', userName: 'Kouam Arnaud', userEmail: 'arnaud.kouam@email.com', type: 'data_export', status: 'pending', reason: 'Consultation RGPD', createdAt: '2024-12-10T09:00:00' },
  { id: 'del2', userId: 'stud015', userName: 'Tchouang Marie', userEmail: 'marie.tchouang@email.com', type: 'account_deletion', status: 'processing', reason: 'Désinscription de la plateforme', createdAt: '2024-12-09T15:00:00', processedAt: '2024-12-10T08:00:00', processedBy: 'Paul Mbeki' },
  { id: 'del3', userId: 'stud022', userName: 'Mvongo Pierre', userEmail: 'pierre.mvongo@email.com', type: 'right_to_be_forgotten', status: 'completed', reason: 'Demande de suppression totale', createdAt: '2024-12-05T10:00:00', processedAt: '2024-12-08T16:00:00', processedBy: 'Marie Nguema' },
  { id: 'del4', userId: 'stud030', userName: 'Ngono Luc', userEmail: 'luc.ngono@email.com', type: 'data_export', status: 'completed', reason: 'Transfert vers une autre école', createdAt: '2024-12-03T14:00:00', processedAt: '2024-12-04T09:00:00', processedBy: 'Sophie Atangana' },
];

// Exercise Response Modes
export const MOCK_RESPONSE_MODES: ExerciseResponseMode[] = [
  { id: 'rm1', subjectId: 'sub1', subjectName: 'Mathématiques', classId: 'cTle', className: 'Terminale', exerciseType: 'lesson_linked', allowedModes: ['keyboard', 'qcm', 'tablet_handwritten'], defaultMode: 'keyboard', active: true },
  { id: 'rm2', subjectId: 'sub3', subjectName: 'Français', classId: 'cTle', className: 'Terminale', exerciseType: 'lesson_linked', allowedModes: ['keyboard', 'oral', 'tablet_handwritten'], defaultMode: 'keyboard', active: true },
  { id: 'rm3', subjectId: 'sub7', subjectName: 'Philosophie', classId: 'cTle', className: 'Terminale', exerciseType: 'chapter_linked', allowedModes: ['keyboard', 'oral'], defaultMode: 'keyboard', active: true },
  { id: 'rm4', subjectId: 'sub2', subjectName: 'Physique-Chimie', classId: 'c1ere', className: '1ère', exerciseType: 'lesson_linked', allowedModes: ['keyboard', 'qcm'], defaultMode: 'qcm', active: true },
  { id: 'rm5', subjectId: 'sub6', subjectName: 'SVT', classId: 'c2nde', className: '2nde', exerciseType: 'independent', allowedModes: ['keyboard', 'qcm', 'tablet_handwritten'], defaultMode: 'qcm', active: true },
];

// School Year Promotions
export const MOCK_SCHOOL_YEAR_PROMOTIONS: SchoolYearPromotion[] = [
  { id: 'syp1', name: 'Passage 2024-2025', fromYear: '2023-2024', toYear: '2024-2025', startDate: '2024-07-01', endDate: '2024-07-15', status: 'completed', confirmationRate: 94.5, totalStudents: 12500, confirmedStudents: 11813, caseA: 10200, caseB: 1613, createdAt: '2024-06-15T10:00:00' },
  { id: 'syp2', name: 'Passage 2025-2026', fromYear: '2024-2025', toYear: '2025-2026', startDate: '2025-07-01', endDate: '2025-07-31', status: 'draft', createdAt: '2024-12-01T09:00:00' },
];

// Advertisers
export const MOCK_ADVERTISERS: Advertiser[] = [
  {
    id: 'adv1',
    name: 'Boutique Scolaire Plus',
    contactEmail: 'contact@scolaireplus.cm',
    status: 'active',
    createdAt: '2024-10-01',
    campaigns: [
      { id: 'camp1', advertiserId: 'adv1', name: 'Rentrée 2024', type: 'banner', imageUrl: '/ads/banner1.png', targetUrl: 'https://scolaireplus.cm', targetClasses: ['c6e', 'c5e', 'c4e', 'c3e'], forbiddenCategories: ['alcohol', 'tobacco'], startDate: '2024-09-01', endDate: '2024-12-31', impressions: 45000, clicks: 1200, status: 'active' },
    ],
  },
  {
    id: 'adv2',
    name: 'Institut Supérieur de Technologie',
    contactEmail: 'pub@ist.cm',
    status: 'active',
    createdAt: '2024-11-15',
    campaigns: [
      { id: 'camp2', advertiserId: 'adv2', name: 'Orientation Terminale', type: 'interstitial', imageUrl: '/ads/ist.png', targetUrl: 'https://ist.cm', targetClasses: ['cTle'], forbiddenCategories: ['alcohol', 'tobacco', 'pharmaceuticals'], startDate: '2024-11-01', endDate: '2025-03-31', impressions: 12000, clicks: 450, status: 'active' },
    ],
  },
  {
    id: 'adv3',
    name: 'Maths Academy',
    contactEmail: 'info@mathsacademy.cm',
    status: 'paused',
    createdAt: '2024-08-20',
    campaigns: [
      { id: 'camp3', advertiserId: 'adv3', name: 'Stages Maths', type: 'banner', imageUrl: '/ads/maths.png', targetUrl: 'https://mathsacademy.cm', targetClasses: ['c3e', 'c2nde', 'c1ere', 'cTle'], forbiddenCategories: [], startDate: '2024-08-15', endDate: '2024-12-15', impressions: 8500, clicks: 320, status: 'completed' },
    ],
  },
];

// Composition Modality Configurations
export const MOCK_COMPOSITION_MODALITIES: CompositionModalityConfig[] = [
  { id: 'cm1', name: 'Scan papier standard', type: 'paper_scan', qualityThreshold: 150, maxFileSize: 10, allowedFormats: ['pdf', 'jpg', 'png'], active: true },
  { id: 'cm2', name: 'Enregistrement oral', type: 'oral_recording', maxDuration: 300, maxFileSize: 50, allowedFormats: ['mp3', 'wav', 'm4a'], active: true },
  { id: 'cm3', name: 'Interactive tablette', type: 'interactive', maxDuration: 1800, allowedFormats: [], active: true },
];

// Accessibility Checks
export const MOCK_ACCESSIBILITY_CHECKS: AccessibilityCheck[] = [
  { id: 'ac1', contentType: 'lesson', contentId: 'l1', contentTitle: 'Les équations du second degré', hasSubtitles: false, hasAltText: true, hasAudioDescription: false, hasTranscript: true, complianceScore: 65, issues: ['Sous-titres manquants pour vidéos', 'Description audio manquante'], checkedAt: '2024-12-09T14:00:00' },
  { id: 'ac2', contentType: 'exercise', contentId: 'ex1', contentTitle: 'Lois de Newton - Application', hasSubtitles: true, hasAltText: true, hasAudioDescription: false, hasTranscript: true, complianceScore: 85, issues: ['Description audio manquante'], checkedAt: '2024-12-09T14:30:00' },
  { id: 'ac3', contentType: 'lesson', contentId: 'l2', contentTitle: 'Le Romantisme', hasSubtitles: true, hasAltText: true, hasAudioDescription: true, hasTranscript: true, complianceScore: 100, issues: [], checkedAt: '2024-12-09T15:00:00' },
];

// Accessibility Stats
export const MOCK_ACCESSIBILITY_STATS: AccessibilityStats = {
  totalContent: 2450,
  compliantContent: 1850,
  pendingChecks: 120,
  featuresUsage: {
    screenReader: 450,
    highContrast: 320,
    textToSpeech: 780,
    subtitles: 1200,
  },
};
