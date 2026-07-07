// User roles in the system
export type UserRole =
  | 'super_admin'
  | 'admin_pays'
  | 'admin_contenu'
  | 'enseignant'
  | 'moderateur'
  | 'support'
  | 'traducteur'
  | 'validateur';

// Role configuration for permissions
export interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  badgeColor: string;
  canViewFinancials: boolean;
  canViewIACosts: boolean;
  canManageUsers: boolean;
  canManageContent: boolean;
  canModerateForum: boolean;
  canManageSupport: boolean;
  canManageSettings: boolean;
  canManageTranslations: boolean;
  countryScope: 'all' | 'assigned' | 'none';
}

// User profile
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  country?: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'suspended' | 'archived';
}

// Country
export interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string;
  active: boolean;
}

// Academic tree node types
export type AcademicNodeType = 'pays' | 'section' | 'type_enseignement' | 'classe' | 'serie';

export interface AcademicTreeNode {
  id: string;
  type: AcademicNodeType;
  name: string;
  code?: string;
  active: boolean;
  children?: AcademicTreeNode[];
  parentId?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

// Subject/Matiere
export interface Subject {
  id: string;
  name: string;
  code: string;
  classes: string[];
  active: boolean;
}

// Chapter
export interface Chapter {
  id: string;
  subjectId: string;
  classId: string;
  name: string;
  order: number;
  active: boolean;
}

// Lesson
export interface Lesson {
  id: string;
  chapterId: string;
  name: string;
  content: string;
  version: number;
  status: 'draft' | 'pending' | 'published' | 'revision';
  mediaIds: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// Exercise types
export type ExerciseType = 'lesson_linked' | 'chapter_linked' | 'independent';

export interface Exercise {
  id: string;
  lessonId?: string;
  chapterId?: string;
  type: ExerciseType;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'pending' | 'published';
}

// Official exam
export interface OfficialExam {
  id: string;
  name: string;
  type: 'BEPC' | 'Probatoire' | 'Bac';
  country: string;
  classId: string;
  subjectId: string;
  year: number;
  subjectUrl?: string;
  correctionUrl?: string;
  correctionHidden: boolean;
  status: 'draft' | 'published';
}

// School/Etablissement
export interface School {
  id: string;
  name: string;
  countryId: string;
  city: string;
  type: 'public' | 'private';
  active: boolean;
}

// School exam
export interface SchoolExam {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  year: number;
  subjectUrl: string;
  correctionUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
}

// Content validation status
export type ValidationStatus = 'draft' | 'pending' | 'correction' | 'published' | 'rejected';

// Content validation item
export interface ContentValidationItem {
  id: string;
  title: string;
  type: 'lesson' | 'exercise' | 'exam';
  author: string;
  subject: string;
  class: string;
  status: ValidationStatus;
  submittedAt: string;
  aiReport?: {
    quality: number;
    completeness: number;
    errors: string[];
  };
}

// Grade contestation
export interface GradeContestation {
  id: string;
  studentName: string;
  studentId: string;
  examId: string;
  initialGrade: number;
  contestedGrade?: number;
  reason: string;
  status: 'open' | 'reviewing' | 'resolved';
  deadline: string;
  assignedTo?: string;
  resolution?: {
    decision: 'maintained' | 'revised';
    newGrade?: number;
    reason: string;
    resolvedBy: string;
    resolvedAt: string;
  };
}

// Forum moderation
export interface ForumReport {
  id: string;
  messageId: string;
  reportedBy: string;
  reason: string;
  context: {
    beforeMessages: string[];
    reportedMessage: string;
    afterMessages: string[];
  };
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

// WhatsApp Community
export interface WhatsAppCommunity {
  id: string;
  classId: string;
  className: string;
  link: string;
  memberCount: number;
  active: boolean;
  createdAt: string;
}

// Event (mock exams, olympiads)
export interface Event {
  id: string;
  type: 'mock_exam' | 'olympiad';
  name: string;
  country: string;
  classes: string[];
  subjects: string[];
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  price: number;
  status: 'draft' | 'registration_open' | 'in_progress' | 'grading' | 'completed';
}

// Announcement
export interface Announcement {
  id: string;
  title: string;
  content: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  targetCountries: string[];
  targetClasses: string[];
  startDate: string;
  endDate: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

// Support ticket
export interface SupportTicket {
  id: string;
  title: string;
  category: 'technical' | 'billing' | 'content' | 'account' | 'other';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  userType: 'eleve' | 'parent';
  userName: string;
  createdAt: string;
  lastUpdate: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: 'user' | 'support';
  content: string;
  createdAt: string;
}

// Subscription tier
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: Record<string, boolean>;
  classIds: string[];
}

// Transaction
export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'subscription' | 'purchase' | 'donation';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: string;
  providerRef?: string;
  createdAt: string;
}

// Reconciliation
export interface ReconciliationItem {
  id: string;
  providerRef: string;
  dbAmount: number;
  providerAmount: number;
  userId: string;
  userName: string;
  operator: string;
  status: 'pending' | 'matched' | 'discrepancy' | 'resolved';
  createdAt: string;
}

// Refund request
export interface RefundRequest {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  email: string;
  amount: number;
  reason: string;
  subscriptionType: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
  deadline: string;
  createdAt: string;
}

// Donation
export interface Donation {
  id: string;
  donorName: string;
  email: string;
  amount: number;
  currency: string;
  cause: string;
  provider: string;
  receiptSent: boolean;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

// Referral
export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referredId: string;
  referredName: string;
  status: 'pending' | 'completed';
  reward: string;
  createdAt: string;
}

// AI Agent
export interface AIAgent {
  id: string;
  name: string;
  type: 'structuring' | 'exercise_generation' | 'moderation' | 'ocr';
  provider: 'claude' | 'gemini';
  status: 'active' | 'inactive';
  totalProcessed: number;
  lastActivity?: string;
}

// AI Processing record
export interface AIProcessingRecord {
  id: string;
  agentId: string;
  agentName: string;
  type: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  status: 'success' | 'failed';
  createdAt: string;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  /** Nom lisible de l'élément concerné (jamais l'id brut affiché à l'écran). */
  entityLabel: string;
  oldValue?: string;
  newValue?: string;
  ip?: string;
  createdAt: string;
}

// Settings configuration
export interface SystemSettings {
  theme: {
    primary: string;
    logo: string;
    baseline: string;
  };
  payment: {
    provider: string;
    environment: 'sandbox' | 'production';
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  };
}

// Translation task
export interface TranslationTask {
  id: string;
  contentType: 'lesson' | 'exercise' | 'ui' | 'announcement';
  contentId: string;
  sourceLang: string;
  targetLang: string;
  status: 'draft' | 'in_review' | 'validated' | 'published';
  translatorId?: string;
  translatorName?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification template
export interface NotificationTemplate {
  id: string;
  event: string;
  channels: ('email' | 'sms' | 'push')[];
  subject: Record<string, string>;
  body: Record<string, string>;
  active: boolean;
}

// Statistics metrics
export interface DashboardStats {
  activeUsers: number;
  totalUsers: number;
  renewalRate: number;
  topContent: { id: string; title: string; views: number }[];
  successRate: number;
  dailyActiveUsers: number[];
  contentStats: Record<string, number>;
}

// External service status
export interface ExternalService {
  id: string;
  name: string;
  type: 'payment' | 'ai';
  provider: string;
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  lastCheck: string;
  responseTime?: number;
  errorRate?: number;
  quotaUsed?: number;
  quotaLimit?: number;
  quotaResetDate?: string;
  lastError?: string;
  lastErrorAt?: string;
}

// Backup record
export interface BackupRecord {
  id: string;
  type: 'automatic' | 'manual';
  status: 'in_progress' | 'completed' | 'failed';
  size: number;
  duration?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
  triggeredBy?: string;
}

// Data deletion request
export interface DataDeletionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'account_deletion' | 'data_export' | 'right_to_be_forgotten';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  reason?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  retentionPolicy?: string;
}

// Exercise response mode
export type ResponseModeType = 'keyboard' | 'qcm' | 'tablet_handwritten' | 'oral' | 'mixed';

export interface ExerciseResponseMode {
  id: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  exerciseType: 'lesson_linked' | 'chapter_linked' | 'independent';
  allowedModes: ResponseModeType[];
  defaultMode: ResponseModeType;
  active: boolean;
}

// School year promotion
export interface SchoolYearPromotion {
  id: string;
  name: string;
  fromYear: string;
  toYear: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  confirmationRate?: number;
  totalStudents?: number;
  confirmedStudents?: number;
  caseA?: number;
  caseB?: number;
  createdAt: string;
}

// Advertising configuration
export interface Advertiser {
  id: string;
  name: string;
  contactEmail: string;
  status: 'active' | 'paused' | 'suspended';
  campaigns: AdCampaign[];
  createdAt: string;
}

export interface AdCampaign {
  id: string;
  advertiserId: string;
  name: string;
  type: 'banner' | 'interstitial' | 'native';
  imageUrl: string;
  targetUrl: string;
  targetClasses: string[];
  forbiddenCategories: string[];
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  status: 'pending' | 'active' | 'paused' | 'completed';
}

// Composition modality configuration
export interface CompositionModalityConfig {
  id: string;
  name: string;
  type: 'paper_scan' | 'oral_recording' | 'interactive';
  qualityThreshold?: number;
  maxDuration?: number;
  maxFileSize?: number;
  allowedFormats: string[];
  active: boolean;
}

// Accessibility configuration
export interface AccessibilityCheck {
  id: string;
  contentType: 'lesson' | 'exercise' | 'exam';
  contentId: string;
  contentTitle: string;
  hasSubtitles: boolean;
  hasAltText: boolean;
  hasAudioDescription: boolean;
  hasTranscript: boolean;
  complianceScore: number;
  issues: string[];
  checkedAt: string;
}

export interface AccessibilityStats {
  totalContent: number;
  compliantContent: number;
  pendingChecks: number;
  featuresUsage: {
    screenReader: number;
    highContrast: number;
    textToSpeech: number;
    subtitles: number;
  };
}
