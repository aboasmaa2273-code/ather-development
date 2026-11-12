export type UserRole = 
  | 'platform_admin'     // مسؤول المنصة
  | 'school_admin'       // مسؤول المدرسة
  | 'vice_principal'     // مساعد المدير
  | 'evaluator'          // المقيم
  | 'teacher';           // المعلم

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  jobNumber?: string;
  specialization?: string;
  avatarUrl?: string;
  username?: string;
  password?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  principalName: string;
  academicStage: string; // e.g. الحلقة الثانية بنين
  welcomeMessage: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  fullName: string;
  jobNumber: string; // unique
  specialization: string;
  status: 'active' | 'inactive';
  email: string;
  phone?: string;
  dateAdded: string;
}

export type IndicatorRating = 'outstanding' | 'very_good' | 'good' | 'acceptable' | 'weak' | 'not_observed' | 'yes' | 'no' | 'needs_improvement';

export interface IndicatorDefinition {
  id: number;
  code: string;
  group: 'التخطيط والاستعداد' | 'المشاركة والتفاعل' | 'الممارسات التدريسية' | 'بيئة التعلم' | 'الربط والتكامل';
  groupEn?: string;
  text: string;
  textEn?: string;
  description?: string;
  descriptionEn?: string;
}

export interface VisitIndicatorResult {
  indicatorId: number;
  indicatorText: string;
  indicatorGroup: string;
  rating: IndicatorRating;
  notes?: string;
}

export type DomainPerformanceLevel = 
  | 'outstanding'   // متميز
  | 'very_good'     // جيد جدًا
  | 'good'          // جيد
  | 'acceptable'    // مقبول
  | 'weak'          // ضعيف
  | 'very_weak';    // ضعيف جدًا

export type ELearningMaturityLevel = 
  | 'weak'          // ضعيف
  | 'acceptable'    // مقبول
  | 'good'          // جيد
  | 'very_good'     // جيد جدًا
  | 'excellent';    // ممتاز

export interface DomainEvaluation {
  domainId: string;
  domainName: string;
  rating: DomainPerformanceLevel;
}

export type VisitType = 'full' | 'quick'; // كاملة أو سريعة
export type VisitStatus = 'draft' | 'in_progress' | 'completed' | 'approved' | 'archived';

export type StudentGender = 'boys' | 'girls' | 'mixed'; // نوع الطلاب (ذكور - إناث - مختلط)

export type VisitorRole = 
  | 'admin'               // إداري
  | 'teacher'             // معلم
  | 'cluster_director'    // مدير / مديرة النطاق
  | 'principal'           // مدير مدرسة
  | 'vice_principal'      // مساعد مدير / نائب أكاديمي
  | 'head_of_arabic'      // رئيس هيئة تدريس المواد العربية
  | 'department_head'     // رئيس قسم
  | 'academic_supervisor' // موجه تربوي / أخصائي
  | 'evaluator'           // مقيّم
  | 'other';              // أخرى

export interface VisitVisitor {
  id: string;
  name: string;
  role: VisitorRole | string;
  roleTitle?: string;
}

export interface RegisteredVisitor {
  id: string;
  name: string;
  role: VisitorRole;
  roleTitle?: string;
  jobNumber?: string;
  email?: string;
  phone?: string;
  department?: string;
  isCustom?: boolean;
  username?: string;
  password?: string;
}

export interface ClassroomVisit {
  id: string;
  schoolId: string;
  academicYear: string;
  term: string;
  visitType: VisitType;
  teacherId: string;
  teacherName: string;
  teacherJobNumber: string;
  teacherSpecialization: string;
  grade: string;
  section: string; // e.g. "الشعبة 1"
  subject: string;
  evaluatorId: string;
  evaluatorName: string;
  date: string;
  time: string;
  visitGoal: string;
  status: VisitStatus;

  // New Student Demographics & Attendance
  totalStudents?: number;      // عدد الطلاب الإجمالي
  attendedStudents?: number;   // عدد الحضور
  absentStudents?: number;     // عدد الغياب
  studentGender?: StudentGender; // نوع الطلاب (ذكور - إناث - مختلط)

  // Multiple Visitors support (تعدد الزائرين)
  visitorRole?: VisitorRole | string; // وظيفة الزائر الأساسي
  visitors?: VisitVisitor[];          // قائمة الزائرين بالأسماء والوظائف
  
  // Indicators results
  indicators: VisitIndicatorResult[];
  
  // General domains (10 domains)
  domains: DomainEvaluation[];
  
  // e-Learning Maturity
  eLearningMaturity: ELearningMaturityLevel;
  
  // Qualitative recommendations & Strengths (Multi-choice selectable banks)
  strengths: string[];
  improvementAreas: string[];
  practicalRecommendations: string;
  suggestedFollowUpPlan?: string;
  
  // Computed metrics
  achievementPercentage: number;
  observedIndicatorsCount: number;
  totalIndicatorsCount: number;

  updatedAt: string;
  createdAt: string;
}

export type PlanStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_follow_up';

export interface ImprovementPlan {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  teacherJobNumber: string;
  improvementArea: string;
  relatedIndicatorText: string;
  developmentalGoal: string;
  actionProcedure: string;
  responsiblePerson: string;
  duration: string;
  followUpDate: string;
  status: PlanStatus;
  followUpResult?: string;
  followUpNotes?: string;
  createdAt: string;
}

export interface AcademicSettings {
  grades: string[];
  sectionsCount: number;
  subjects: string[];
  academicYears: string[];
  currentAcademicYear: string;
  terms: string[];
  currentTerm: string;
}

export interface PlatformSettings {
  platformName: string;
  platformTitle: string;
  slogan: string;
  schoolName: string;
  schoolStage: string;
  principalName?: string;
  logoUrl?: string;
  homeImageUrl?: string;
  welcomeMessage: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  googleWebAppUrl?: string; // Optional real Google Apps Script webhook
}

export interface AuditLogEntry {
  id: string;
  schoolId: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
}
