import { 
  User, 
  Teacher, 
  ClassroomVisit, 
  ImprovementPlan, 
  AcademicSettings, 
  PlatformSettings, 
  AuditLogEntry,
  VisitIndicatorResult,
  UserRole,
  RegisteredVisitor
} from '../types';

import { 
  DEFAULT_USERS, 
  DEFAULT_TEACHERS, 
  DEFAULT_VISITS, 
  DEFAULT_PLANS, 
  DEFAULT_ACADEMIC_SETTINGS, 
  DEFAULT_PLATFORM_SETTINGS, 
  DEFAULT_AUDIT_LOGS,
  DEFAULT_REGISTERED_VISITORS,
  OFFICIAL_INDICATORS
} from '../data/defaultData';

const STORAGE_KEYS = {
  CURRENT_USER: 'athar_current_user_v1',
  TEACHERS: 'athar_teachers_v1',
  VISITS: 'athar_visits_v1',
  PLANS: 'athar_plans_v1',
  ACADEMIC_SETTINGS: 'athar_academic_settings_v1',
  PLATFORM_SETTINGS: 'athar_platform_settings_v1',
  AUDIT_LOGS: 'athar_audit_logs_v1',
  GAS_CONFIG: 'athar_gas_config_v1',
  REGISTERED_VISITORS: 'athar_registered_visitors_v1',
  CUSTOM_USERS: 'athar_custom_users_v1',
  USER_OVERRIDES: 'athar_user_overrides_v2'
};

// Helper for safe localStorage access
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading key ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving key ${key} to localStorage:`, err);
  }
}

export class AtharStorageService {
  // Current logged in user
  static getCurrentUser(): User {
    const user = getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    const all = this.getAllUsers();
    if (!user) {
      return all[0] || DEFAULT_USERS[0];
    }
    const found = all.find(u => u.id === user.id);
    return found || all[0] || DEFAULT_USERS[0];
  }

  static setCurrentUser(user: User): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    this.logAction(user, 'تسجيل دخول / تبديل دور', `تم تفعيل حساب: ${user.name} كـ (${this.getRoleLabel(user.role)})`);
  }

  static getAllUsers(): User[] {
    const custom = getStored<User[]>(STORAGE_KEYS.CUSTOM_USERS, []);
    const overrides = getStored<Record<string, Partial<User>>>(STORAGE_KEYS.USER_OVERRIDES, {});
    const deletedIds = getStored<string[]>('athar_deleted_user_ids', []);
    
    const combined = [...DEFAULT_USERS, ...custom].filter(u => !deletedIds.includes(u.id));
    return combined.map(u => {
      const override = overrides[u.id];
      if (override) {
        return { ...u, ...override };
      }
      return u;
    });
  }

  static deleteUser(userId: string): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    const allUsers = this.getAllUsers();
    const target = allUsers.find(u => u.id === userId);
    if (!target) return { success: false, error: 'المستخدم غير موجود.' };

    if (currentUser && currentUser.id === userId) {
      return { success: false, error: 'لا يمكن حذف الحساب النشط حالياً الذي تستخدمه لتسجيل الدخول.' };
    }

    // Remove from custom users
    const custom = getStored<User[]>(STORAGE_KEYS.CUSTOM_USERS, []);
    const filteredCustom = custom.filter(u => u.id !== userId);
    setStored(STORAGE_KEYS.CUSTOM_USERS, filteredCustom);

    // Track deleted user IDs so any user (including defaults) can be deleted
    const deletedIds = getStored<string[]>('athar_deleted_user_ids', []);
    if (!deletedIds.includes(userId)) {
      deletedIds.push(userId);
      setStored('athar_deleted_user_ids', deletedIds);
    }

    // Also remove matching registered visitor if exists
    const visitors = this.getRegisteredVisitors();
    const matchingVisitor = visitors.find(v => v.name === target.name || (target.username && v.username === target.username));
    if (matchingVisitor) {
      const filteredVisitors = visitors.filter(v => v.id !== matchingVisitor.id);
      setStored(STORAGE_KEYS.REGISTERED_VISITORS, filteredVisitors);
    }

    this.logAction(currentUser, 'حذف حساب مقيم', `تم حذف حساب المقيم: ${target.name} (@${target.username || 'بدون'})`);
    return { success: true };
  }

  // Authentication by Username and Password
  static authenticate(username: string, password: string): { success: boolean; user?: User; error?: string } {
    const trimmedUsername = username.trim().toLowerCase();
    const approvedVisitors = this.getRegisteredVisitors();
    const approved = approvedVisitors.find(v =>
      (v.username || '').trim().toLowerCase() === trimmedUsername &&
      Boolean(v.password) &&
      v.password === password &&
      v.role !== 'teacher'
    );

    if (!approved) {
      return {
        success: false,
        error: 'بيانات الدخول غير مطابقة لقائمة المقيمين والزائرين المعتمدين. يرجى مراجعة إدارة المنظومة.'
      };
    }

    const allUsers = this.getAllUsers();
    let matchedUser = allUsers.find(u =>
      (u.username || '').trim().toLowerCase() === trimmedUsername
    );

    // Keep the approved directory as the source of truth and provision or
    // refresh the matching local profile after credentials have been verified.
    const approvedRole: UserRole = approved.role === 'principal' ? 'school_admin'
      : approved.role === 'vice_principal' ? 'vice_principal' : 'evaluator';
    if (!matchedUser) {
      matchedUser = {
        id: approved.id,
        name: approved.name,
        email: approved.email || `${trimmedUsername}@alsadara.sch.ae`,
        role: approvedRole,
        schoolId: 'sch_alsadara_01',
        specialization: approved.roleTitle || approved.department || 'مقيّم معتمد',
        username: trimmedUsername,
        password: approved.password
      };
      const custom = getStored<User[]>(STORAGE_KEYS.CUSTOM_USERS, []);
      custom.push(matchedUser);
      setStored(STORAGE_KEYS.CUSTOM_USERS, custom);
    } else {
      matchedUser = {
        ...matchedUser,
        name: approved.name,
        role: approvedRole,
        specialization: approved.roleTitle || approved.department || matchedUser.specialization,
        username: trimmedUsername,
        password: approved.password
      };
    }

    // Credentials are checked against the approved roster, never against an
    // arbitrary account or the public self-registration form.
    this.setCurrentUser(matchedUser);
    this.logAction(matchedUser, 'تسجيل دخول ناجح', `تم تسجيل دخول المستخدم (${matchedUser.name}) بنجاح`);
    return { success: true, user: matchedUser };
  }

  // Update credentials (username, password, full name)
  static updateUserCredentials(
    userId: string, 
    newUsername: string, 
    newPassword?: string, 
    newName?: string
  ): { success: boolean; user?: User; error?: string } {
    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername) {
      return { success: false, error: 'اسم المستخدم مطلوب ولا يمكن تركه فارغاً.' };
    }

    const allUsers = this.getAllUsers();
    const existing = allUsers.find(u => u.id === userId);
    if (!existing) {
      return { success: false, error: 'المستخدم غير موجود.' };
    }

    // Check if new username is already taken by someone else
    const duplicate = allUsers.find(u => 
      u.id !== userId && 
      (u.username || '').trim().toLowerCase() === trimmedUsername.toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: 'اسم المستخدم هذا محجوز مسبقاً لمستخدم آخر. يرجى اختيار اسم مستخدم مختلف.' };
    }

    const overrides = getStored<Record<string, Partial<User>>>(STORAGE_KEYS.USER_OVERRIDES, {});
    const updatedFields: Partial<User> = {
      ...overrides[userId],
      username: trimmedUsername
    };

    if (newPassword && newPassword.trim()) {
      updatedFields.password = newPassword.trim();
    }

    if (newName && newName.trim()) {
      updatedFields.name = newName.trim();
    }

    overrides[userId] = updatedFields;
    setStored(STORAGE_KEYS.USER_OVERRIDES, overrides);

    // Also update CUSTOM_USERS if it's a custom user
    const custom = getStored<User[]>(STORAGE_KEYS.CUSTOM_USERS, []);
    const customIdx = custom.findIndex(u => u.id === userId);
    if (customIdx !== -1) {
      custom[customIdx] = { ...custom[customIdx], ...updatedFields };
      setStored(STORAGE_KEYS.CUSTOM_USERS, custom);
    }

    const updatedUser = { ...existing, ...updatedFields };
    
    // Keep the approved evaluator directory synchronized with credential edits.
    const approvedVisitors = this.getRegisteredVisitors();
    const visitorIndex = approvedVisitors.findIndex(v =>
      v.id === userId ||
      (existing.username && (v.username || '').trim().toLowerCase() === existing.username.trim().toLowerCase()) ||
      v.name === existing.name
    );
    if (visitorIndex >= 0) {
      approvedVisitors[visitorIndex] = {
        ...approvedVisitors[visitorIndex],
        name: newName?.trim() || approvedVisitors[visitorIndex].name,
        username: trimmedUsername,
        password: newPassword?.trim() || approvedVisitors[visitorIndex].password
      };
      setStored(STORAGE_KEYS.REGISTERED_VISITORS, approvedVisitors);
    }

    // Update current user if this user is the active one
    const current = getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (current && current.id === userId) {
      setStored(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }

    this.logAction(updatedUser, 'تعديل بيانات الحساب', `تم تحديث اسم المستخدم (${trimmedUsername}) وكلمة المرور للمستخدم: ${updatedUser.name}`);

    return { success: true, user: updatedUser };
  }

  // Register a brand new evaluator
  static registerEvaluator(data: { 
    name: string; 
    username: string; 
    password: string; 
    specialization?: string 
  }): { success: boolean; user?: User; error?: string } {
    const trimmedName = data.name.trim();
    const trimmedUsername = data.username.trim().toLowerCase();
    const trimmedPassword = data.password.trim();

    if (!trimmedName) return { success: false, error: 'الاسم الكامل مطلوب.' };
    if (!trimmedUsername) return { success: false, error: 'اسم المستخدم مطلوب.' };
    if (!trimmedPassword || trimmedPassword.length < 3) {
      return { success: false, error: 'كلمة المرور يجب أن لا تقل عن 3 أحرف أو أرقام.' };
    }

    const all = this.getAllUsers();
    if (all.some(u => (u.username || '').toLowerCase() === trimmedUsername)) {
      return { success: false, error: 'اسم المستخدم محجوز مسبقاً.' };
    }

    const id = `user_eval_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newEvaluator: User = {
      id,
      name: trimmedName,
      email: `${trimmedUsername}@alsadara.sch.ae`,
      role: 'evaluator',
      schoolId: 'sch_alsadara_01',
      specialization: data.specialization?.trim() || 'مقيّم تربوي معتمد',
      username: trimmedUsername,
      password: trimmedPassword
    };

    const custom = getStored<User[]>(STORAGE_KEYS.CUSTOM_USERS, []);
    custom.push(newEvaluator);
    setStored(STORAGE_KEYS.CUSTOM_USERS, custom);
    this.setCurrentUser(newEvaluator);

    this.logAction(newEvaluator, 'تسجيل مقيم جديد', `تم إنشاء وتفعيل حساب مقيم جديد: ${trimmedName} (${trimmedUsername})`);

    return { success: true, user: newEvaluator };
  }

  static addCustomEvaluator(name: string): User {
    const trimmed = name.trim();
    const id = `user_eval_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const cleanUsername = trimmed.toLowerCase().replace(/\s+/g, '_');
    const newEvaluator: User = {
      id,
      name: trimmed,
      email: `evaluator_${Date.now().toString(36)}@alsadara.sch.ae`,
      role: 'evaluator',
      schoolId: 'sch_alsadara_01',
      specialization: 'مقيّم تربوي معتمد',
      username: cleanUsername,
      password: '123'
    };
    const custom = getStored<User[]>(STORAGE_KEYS.CUSTOM_USERS, []);
    custom.push(newEvaluator);
    setStored(STORAGE_KEYS.CUSTOM_USERS, custom);
    this.setCurrentUser(newEvaluator);
    return newEvaluator;
  }

  // Teachers Management
  static getTeachers(schoolId = 'sch_alsadara_01'): Teacher[] {
    return getStored<Teacher[]>(STORAGE_KEYS.TEACHERS, DEFAULT_TEACHERS)
      .filter(t => !schoolId || t.schoolId === schoolId);
  }

  static getTeacherById(id: string): Teacher | undefined {
    const teachers = this.getTeachers();
    return teachers.find(t => t.id === id);
  }

  static isJobNumberDuplicate(jobNumber: string, excludeId?: string): boolean {
    const teachers = this.getTeachers();
    return teachers.some(t => t.jobNumber.trim() === jobNumber.trim() && t.id !== excludeId);
  }

  static saveTeacher(teacher: Omit<Teacher, 'id' | 'dateAdded'> & { id?: string }): { success: boolean; teacher?: Teacher; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canManageTeachers(currentUser)) {
      return { success: false, error: 'غير مصرح لك بإدارة بيانات المعلمين وفق صلاحياتك الحالية.' };
    }

    if (!teacher.fullName?.trim() || !teacher.jobNumber?.trim() || !teacher.specialization?.trim()) {
      return { success: false, error: 'جميع الحقول الأساسية (الاسم، الرقم الوظيفي، التخصص) مطلوبة.' };
    }

    if (this.isJobNumberDuplicate(teacher.jobNumber, teacher.id)) {
      return { success: false, error: `الرقم الوظيفي (${teacher.jobNumber}) مستخدم بالفعل لمعلم آخر في النظام.` };
    }

    const teachers = this.getTeachers();
    let savedTeacher: Teacher;

    if (teacher.id) {
      // Edit
      const index = teachers.findIndex(t => t.id === teacher.id);
      if (index === -1) return { success: false, error: 'المعلم غير موجود في النظام.' };
      savedTeacher = {
        ...teachers[index],
        ...teacher,
        schoolId: teacher.schoolId || 'sch_alsadara_01'
      };
      teachers[index] = savedTeacher;
      this.logAction(currentUser, 'تعديل بيانات معلم', `تم تعديل بيانات المعلم: ${savedTeacher.fullName} (${savedTeacher.jobNumber})`);
    } else {
      // New
      savedTeacher = {
        ...teacher,
        id: `tch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        schoolId: teacher.schoolId || 'sch_alsadara_01',
        dateAdded: new Date().toISOString().split('T')[0]
      };
      teachers.push(savedTeacher);
      this.logAction(currentUser, 'إضافة معلم جديد', `تمت إضافة المعلم: ${savedTeacher.fullName} برقم وظيفي: ${savedTeacher.jobNumber}`);
    }

    setStored(STORAGE_KEYS.TEACHERS, teachers);
    return { success: true, teacher: savedTeacher };
  }

  static toggleTeacherStatus(teacherId: string): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canManageTeachers(currentUser)) {
      return { success: false, error: 'غير مصرح لك بتغيير حالة المعلم.' };
    }

    const teachers = this.getTeachers();
    const index = teachers.findIndex(t => t.id === teacherId);
    if (index === -1) return { success: false, error: 'المعلم غير موجود.' };

    teachers[index].status = teachers[index].status === 'active' ? 'inactive' : 'active';
    setStored(STORAGE_KEYS.TEACHERS, teachers);
    this.logAction(currentUser, 'تغيير حالة معلم', `تم تغيير حالة المعلم ${teachers[index].fullName} إلى: ${teachers[index].status === 'active' ? 'نشط' : 'معطل'}`);
    return { success: true };
  }

  static deleteTeacher(teacherId: string): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canDeleteTeacher(currentUser)) {
      return { success: false, error: 'حذف المعلمين مقتصر فقط على إدارة المدرسة والمشرفين المخولين.' };
    }

    const teachers = this.getTeachers();
    const target = teachers.find(t => t.id === teacherId);
    if (!target) return { success: false, error: 'المعلم غير موجود.' };

    const filtered = teachers.filter(t => t.id !== teacherId);
    setStored(STORAGE_KEYS.TEACHERS, filtered);
    this.logAction(currentUser, 'حذف معلم', `تم حذف المعلم: ${target.fullName} (${target.jobNumber})`);
    return { success: true };
  }

  static bulkImportTeachers(newTeachers: Array<{ fullName: string; jobNumber: string; specialization: string; email?: string; phone?: string }>): {
    success: boolean;
    importedCount: number;
    rejectedCount: number;
    errors: string[];
  } {
    const currentUser = this.getCurrentUser();
    if (!this.canManageTeachers(currentUser)) {
      return { success: false, importedCount: 0, rejectedCount: 0, errors: ['غير مصرح لك بالاستيراد.'] };
    }

    const currentTeachers = this.getTeachers();
    const existingJobNumbers = new Set(currentTeachers.map(t => t.jobNumber.trim()));
    const batchJobNumbers = new Set<string>();

    const imported: Teacher[] = [];
    const errors: string[] = [];
    let rejectedCount = 0;

    newTeachers.forEach((row, idx) => {
      const rowNum = idx + 2; // considering header
      const name = row.fullName?.trim();
      const jobNo = row.jobNumber?.toString().trim();
      const spec = row.specialization?.trim();

      if (!name || !jobNo || !spec) {
        errors.push(`السطر ${rowNum}: بيانات ناقصة (الاسم أو الرقم الوظيفي أو التخصص غير موجود).`);
        rejectedCount++;
        return;
      }

      if (existingJobNumbers.has(jobNo)) {
        errors.push(`السطر ${rowNum}: الرقم الوظيفي (${jobNo}) مسجل مسبقاً في النظام للمعلم ${name}.`);
        rejectedCount++;
        return;
      }

      if (batchJobNumbers.has(jobNo)) {
        errors.push(`السطر ${rowNum}: الرقم الوظيفي (${jobNo}) مكرر أكثر من مرة داخل ملف الاستيراد.`);
        rejectedCount++;
        return;
      }

      batchJobNumbers.add(jobNo);
      existingJobNumbers.add(jobNo);

      imported.push({
        id: `tch_imp_${Date.now()}_${idx}`,
        schoolId: 'sch_alsadara_01',
        fullName: name,
        jobNumber: jobNo,
        specialization: spec,
        email: row.email?.trim() || `${jobNo}@alsadara.edu.ae`,
        phone: row.phone?.trim() || '',
        status: 'active',
        dateAdded: new Date().toISOString().split('T')[0]
      });
    });

    if (imported.length > 0) {
      const updated = [...currentTeachers, ...imported];
      setStored(STORAGE_KEYS.TEACHERS, updated);
      this.logAction(currentUser, 'استيراد جماعي للمعلمين', `تم استيراد ${imported.length} معلماً بنجاح، ورفض ${rejectedCount} سجل.`);
    }

    return {
      success: imported.length > 0,
      importedCount: imported.length,
      rejectedCount,
      errors
    };
  }

  // Visits Management
  static getVisits(schoolId = 'sch_alsadara_01'): ClassroomVisit[] {
    return getStored<ClassroomVisit[]>(STORAGE_KEYS.VISITS, DEFAULT_VISITS)
      .filter(v => !schoolId || v.schoolId === schoolId);
  }

  static getVisitById(id: string): ClassroomVisit | undefined {
    return this.getVisits().find(v => v.id === id);
  }

  // Calculate Achievement Percentage strictly complying with rules:
  // "لم يُشاهد" (not_observed) DOES NOT count as failure, DOES NOT enter denominator!
  static calculateAchievement(indicators: VisitIndicatorResult[]): {
    percentage: number;
    observedCount: number;
    totalCount: number;
    yesCount: number;
    needsImprovementCount: number;
    noCount: number;
    notObservedCount: number;
  } {
    let yesCount = 0;
    let needsImprovementCount = 0;
    let noCount = 0;
    let notObservedCount = 0;
    let score = 0;

    indicators.forEach(ind => {
      switch (ind.rating) {
        case 'not_observed':
          notObservedCount++;
          break;
        case 'outstanding':
          yesCount++;
          score += 5;
          break;
        case 'very_good':
          yesCount++;
          score += 4;
          break;
        case 'good':
          yesCount++;
          score += 3;
          break;
        case 'acceptable':
        case 'needs_improvement':
          needsImprovementCount++;
          score += 2;
          break;
        case 'weak':
        case 'no':
          noCount++;
          score += 1;
          break;
        case 'yes':
          yesCount++;
          score += 5;
          break;
      }
    });

    const observedCount = yesCount + needsImprovementCount + noCount;
    const totalCount = indicators.length;
    const percentage = observedCount > 0
      ? Math.round((score / (observedCount * 5)) * 1000) / 10
      : 0;

    return {
      percentage,
      observedCount,
      totalCount,
      yesCount,
      needsImprovementCount,
      noCount,
      notObservedCount
    };
  }

  static saveVisit(visit: ClassroomVisit): { success: boolean; visit?: ClassroomVisit; error?: string } {
    const currentUser = this.getCurrentUser();
    
    // Server-side check
    if (!this.canCreateVisit(currentUser) && !this.canEditVisit(currentUser, visit)) {
      return { success: false, error: 'غير مصرح لك بإنشاء أو تعديل الزيارات الصفية.' };
    }

    // Teacher can never edit visits!
    if (currentUser.role === 'teacher') {
      return { success: false, error: 'المعلم لا يستطيع تعديل نتائج التقييم أو أحكام المقيم.' };
    }

    // Recalculate metrics accurately
    const metrics = this.calculateAchievement(visit.indicators);
    const enrichedVisit: ClassroomVisit = {
      ...visit,
      achievementPercentage: metrics.percentage,
      observedIndicatorsCount: metrics.observedCount,
      totalIndicatorsCount: metrics.totalCount,
      updatedAt: new Date().toISOString()
    };

    const visits = this.getVisits();
    const index = visits.findIndex(v => v.id === visit.id);

    if (index >= 0) {
      visits[index] = enrichedVisit;
      this.logAction(currentUser, 'تحديث زيارة صفية', `تحديث زيارة المعلم: ${enrichedVisit.teacherName} (${enrichedVisit.id}) بنسبة إنجاز: ${enrichedVisit.achievementPercentage}%`);
    } else {
      visits.unshift(enrichedVisit);
      this.logAction(currentUser, 'إنشاء زيارة صفية جديدة', `إنشاء زيارة (${enrichedVisit.visitType === 'full' ? 'كاملة' : 'سريعة'}) للمعلم: ${enrichedVisit.teacherName} (${enrichedVisit.id})`);
    }

    setStored(STORAGE_KEYS.VISITS, visits);
    return { success: true, visit: enrichedVisit };
  }

  static updateVisitStatus(visitId: string, newStatus: ClassroomVisit['status']): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    const visits = this.getVisits();
    const index = visits.findIndex(v => v.id === visitId);
    if (index === -1) return { success: false, error: 'الزيارة غير موجودة.' };

    const visit = visits[index];

    // Status security rules: Only admins or vice principals can approve
    if (newStatus === 'approved' && !['school_admin', 'vice_principal', 'platform_admin'].includes(currentUser.role)) {
      return { success: false, error: 'اعتماد الزيارة مقتصر على مدير المدرسة أو مساعد المدير فقط.' };
    }

    // Teacher cannot change status
    if (currentUser.role === 'teacher') {
      return { success: false, error: 'غير مصرح للمعلم بتغيير حالة الزيارة.' };
    }

    visits[index].status = newStatus;
    visits[index].updatedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.VISITS, visits);

    this.logAction(currentUser, 'تغيير حالة زيارة', `تغيير حالة زيارة المعلم ${visit.teacherName} إلى (${this.getVisitStatusLabel(newStatus)})`);
    return { success: true };
  }

  static deleteVisit(visitId: string): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canDeleteVisit(currentUser)) {
      return { success: false, error: 'حذف الزيارات مقتصر فقط على إدارة المدرسة والمشرفين المخولين.' };
    }

    const visits = this.getVisits();
    const target = visits.find(v => v.id === visitId);
    if (!target) return { success: false, error: 'الزيارة غير موجودة.' };

    const filtered = visits.filter(v => v.id !== visitId);
    setStored(STORAGE_KEYS.VISITS, filtered);
    this.logAction(currentUser, 'حذف زيارة صفية', `تم حذف الزيارة (${visitId}) للمعلم: ${target.teacherName}`);
    return { success: true };
  }

  // Improvement Plans Management
  static getPlans(schoolId = 'sch_alsadara_01'): ImprovementPlan[] {
    return getStored<ImprovementPlan[]>(STORAGE_KEYS.PLANS, DEFAULT_PLANS)
      .filter(p => !schoolId || p.schoolId === schoolId);
  }

  static savePlan(plan: Omit<ImprovementPlan, 'id' | 'createdAt'> & { id?: string }): { success: boolean; plan?: ImprovementPlan; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canCreatePlan(currentUser)) {
      return { success: false, error: 'غير مصرح لك بإسناد خطط التطوير المهني.' };
    }

    const plans = this.getPlans();
    let savedPlan: ImprovementPlan;

    if (plan.id) {
      const idx = plans.findIndex(p => p.id === plan.id);
      if (idx === -1) return { success: false, error: 'خطة التطوير غير موجودة.' };
      savedPlan = {
        ...plans[idx],
        ...plan
      };
      plans[idx] = savedPlan;
      this.logAction(currentUser, 'تعديل خطة تطوير', `تم تحديث خطة التطوير (${savedPlan.id}) للمعلم: ${savedPlan.teacherName}`);
    } else {
      savedPlan = {
        ...plan,
        id: `PLN-${new Date().getFullYear()}-${String(plans.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString()
      };
      plans.unshift(savedPlan);
      this.logAction(currentUser, 'إنشاء خطة تطوير جديدة', `إسناد خطة تطوير (${savedPlan.id}) للمعلم: ${savedPlan.teacherName}`);
    }

    setStored(STORAGE_KEYS.PLANS, plans);
    return { success: true, plan: savedPlan };
  }

  static updatePlanFollowUp(
    planId: string, 
    statusOrPayload: ImprovementPlan['status'] | { status: ImprovementPlan['status']; followUpResult: string; followUpNotes: string }, 
    resultArg?: string, 
    notesArg?: string
  ): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (currentUser.role === 'teacher') {
      return { success: false, error: 'المعلم لا يستطيع تعديل نتيجة المتابعة الرسمية.' };
    }

    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return { success: false, error: 'الخطة غير موجودة.' };

    let status: ImprovementPlan['status'];
    let result = '';
    let notes = '';

    if (typeof statusOrPayload === 'object' && statusOrPayload !== null) {
      status = statusOrPayload.status;
      result = statusOrPayload.followUpResult || '';
      notes = statusOrPayload.followUpNotes || '';
    } else {
      status = statusOrPayload;
      result = resultArg || '';
      notes = notesArg || '';
    }

    plans[idx].status = status;
    plans[idx].followUpResult = result;
    plans[idx].followUpNotes = notes;
    setStored(STORAGE_KEYS.PLANS, plans);

    this.logAction(currentUser, 'متابعة خطة تطوير', `تم تسجيل متابعة الخطة (${planId}) للمعلم ${plans[idx].teacherName}: حالة (${status})`);
    return { success: true };
  }

  // Academic Settings
  static getAcademicSettings(): AcademicSettings {
    const stored = getStored<AcademicSettings>(STORAGE_KEYS.ACADEMIC_SETTINGS, DEFAULT_ACADEMIC_SETTINGS);
    const requestedYears = [
      '2026 - 2027',
      '2027 - 2028',
      '2028 - 2029',
      '2029 - 2030',
      '2030 - 2031'
    ];
    if (!stored.academicYears || !stored.academicYears.includes('2026 - 2027')) {
      stored.academicYears = requestedYears;
      stored.currentAcademicYear = '2026 - 2027';
      setStored(STORAGE_KEYS.ACADEMIC_SETTINGS, stored);
    }

    // Ensure Grade 9 is removed as Al-Sadara Boys Cycle 2 has only 4 grades (5, 6, 7, 8)
    if (stored.grades && stored.grades.includes('الصف التاسع')) {
      stored.grades = stored.grades.filter(g => g !== 'الصف التاسع');
      setStored(STORAGE_KEYS.ACADEMIC_SETTINGS, stored);
    }

    return stored;
  }

  static saveAcademicSettings(settings: AcademicSettings): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canEditSettings(currentUser)) {
      return { success: false, error: 'تعديل الإعدادات الأكاديمية مقتصر على إدارة المدرسة.' };
    }

    setStored(STORAGE_KEYS.ACADEMIC_SETTINGS, settings);
    this.logAction(currentUser, 'تحديث الإعدادات الأكاديمية', 'تم حفظ تعديلات الصفوف والشعب والمواد والأعوام الدراسية.');
    return { success: true };
  }

  // Platform Settings
  static getPlatformSettings(): PlatformSettings {
    const saved = getStored<Partial<PlatformSettings> | null>(STORAGE_KEYS.PLATFORM_SETTINGS, null);
    // Merge newly introduced identity fields into existing installations without
    // overwriting any school-specific values already saved by the administrator.
    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...(saved || {}),
      logoUrl: saved?.logoUrl || DEFAULT_PLATFORM_SETTINGS.logoUrl
    };
  }

  static savePlatformSettings(settings: PlatformSettings): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canEditSettings(currentUser)) {
      return { success: false, error: 'تعديل إعدادات وهوية المنصة مقتصر على مسؤول النظام.' };
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(settings));
      const saved = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
      if (!saved) throw new Error('Settings were not persisted');
      const parsed = JSON.parse(saved) as PlatformSettings;
      if ((settings.logoUrl && parsed.logoUrl !== settings.logoUrl) ||
          (settings.homeImageUrl && parsed.homeImageUrl !== settings.homeImageUrl)) {
        throw new Error('Uploaded image verification failed');
      }
    } catch (error) {
      console.error('Could not persist platform settings:', error);
      return { success: false, error: 'تعذّر حفظ الصور بسبب سعة التخزين في المتصفح. أعد اختيار الصورة بعد تصغير حجمها، ثم حاول الحفظ مرة أخرى.' };
    }
    this.logAction(currentUser, 'تحديث هوية وإعدادات المنصة', `تم حفظ إعدادات: ${settings.platformName} - ${settings.schoolName}`);
    return { success: true };
  }

  // Audit Log
  static getAuditLogs(): AuditLogEntry[] {
    return getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  }

  static logAction(user: User, action: string, details: string): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      schoolId: user.schoolId || 'sch_alsadara_01',
      timestamp: new Date().toLocaleString('ar-AE', { dateStyle: 'short', timeStyle: 'medium' }),
      userName: user.name,
      userRole: this.getRoleLabel(user.role),
      action,
      details
    };
    logs.unshift(newEntry);
    // Keep last 150 logs
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 2000));
  }

  static clearAuditLogs(): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    setStored(STORAGE_KEYS.AUDIT_LOGS, []);
    this.logAction(currentUser, 'مسح سجل العمليات', 'تم مسح كامل سجل العمليات والأمان.');
    return { success: true };
  }

  // Registered Visitors Management (دليل الزائرين والمقيمين المعتمدين)
  static getRegisteredVisitors(): RegisteredVisitor[] {
    const list = getStored<RegisteredVisitor[]>(STORAGE_KEYS.REGISTERED_VISITORS, DEFAULT_REGISTERED_VISITORS);
    return list.map(v => {
      if (v.name === 'رئيس هيئة تدريس المواد العربية' && v.role === 'evaluator') {
        return { ...v, role: 'head_of_arabic' };
      }
      return v;
    });
  }

  static saveRegisteredVisitor(visitor: RegisteredVisitor): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canEditSettings(currentUser)) {
      return { success: false, error: 'إدارة وتعديل الزائرين مقتصرة على الإدارة المدرسية.' };
    }

    if (!visitor.name.trim()) {
      return { success: false, error: 'اسم الزائر مطلوب.' };
    }

    const visitors = this.getRegisteredVisitors();
    const existingIndex = visitors.findIndex(v => v.id === visitor.id);

    if (existingIndex >= 0) {
      visitors[existingIndex] = { ...visitor };
      this.logAction(currentUser, 'تعديل بيانات زائر', `تم تحديث بيانات الزائر: ${visitor.name} (${this.getVisitorRoleLabel(visitor.role)})`);
    } else {
      const newVisitor: RegisteredVisitor = {
        ...visitor,
        id: visitor.id || `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        isCustom: true
      };
      visitors.push(newVisitor);
      this.logAction(currentUser, 'إضافة زائر جديد', `تم تسجيل الزائر: ${visitor.name} بصفة (${this.getVisitorRoleLabel(visitor.role)})`);
    }

    // Synchronize login credentials for the evaluator if username and password provided
    if (visitor.username && visitor.username.trim()) {
      const cleanUsername = visitor.username.trim().toLowerCase();
      const cleanPassword = visitor.password?.trim() || '123';
      const customUsers = getStored<User[]>(STORAGE_KEYS.CUSTOM_USERS, []);
      const userIndex = customUsers.findIndex(u => u.username?.toLowerCase() === cleanUsername || u.name === visitor.name);

      if (userIndex >= 0) {
        customUsers[userIndex].name = visitor.name;
        customUsers[userIndex].username = cleanUsername;
        customUsers[userIndex].password = cleanPassword;
        customUsers[userIndex].specialization = visitor.roleTitle || visitor.department || 'مقيّم معتمد';
        setStored(STORAGE_KEYS.CUSTOM_USERS, customUsers);
      } else {
        const newEvaluatorUser: User = {
          id: `user_eval_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          name: visitor.name,
          username: cleanUsername,
          password: cleanPassword,
          role: 'evaluator',
          schoolId: 'sch_alsadara_01',
          email: visitor.email || `${cleanUsername}@alsadara.sch.ae`,
          specialization: visitor.roleTitle || visitor.department || 'مقيّم معتمد'
        };
        customUsers.push(newEvaluatorUser);
        setStored(STORAGE_KEYS.CUSTOM_USERS, customUsers);
      }
    }

    setStored(STORAGE_KEYS.REGISTERED_VISITORS, visitors);
    return { success: true };
  }

  static deleteRegisteredVisitor(visitorId: string): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canEditSettings(currentUser)) {
      return { success: false, error: 'حذف الزائرين مقتصر على الإدارة المدرسية.' };
    }

    const visitors = this.getRegisteredVisitors();
    const target = visitors.find(v => v.id === visitorId);
    if (!target) return { success: false, error: 'الزائر غير موجود.' };

    const filtered = visitors.filter(v => v.id !== visitorId);
    setStored(STORAGE_KEYS.REGISTERED_VISITORS, filtered);

    // Also remove from custom users if existed
    const customUsers = getStored<User[]>(STORAGE_KEYS.CUSTOM_USERS, []);
    const filteredUsers = customUsers.filter(u => u.name !== target.name && (!target.username || u.username !== target.username));
    setStored(STORAGE_KEYS.CUSTOM_USERS, filteredUsers);

    this.logAction(currentUser, 'حذف زائر', `تم حذف الزائر: ${target.name} من الدليل المعتمد.`);
    return { success: true };
  }

  // Demo Data Management & Selective Cleanup (إدارة وحذف السجلات التجريبية - مقتصرة على المخولين)
  static clearDemoVisits(): { success: boolean; count: number; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canDeleteDemoData(currentUser)) {
      return { success: false, count: 0, error: 'عمليات الحذف والتفريغ مقتصرة فقط على إدارة المدرسة والمشرفين المخولين.' };
    }
    const visits = this.getVisits();
    const count = visits.length;
    setStored(STORAGE_KEYS.VISITS, []);
    this.logAction(currentUser, 'حذف الزيارات التجريبية', `تم مسح جميع الزيارات الصفية (${count} زيارة) لبدء سجل مدرسي جديد.`);
    return { success: true, count };
  }

  static clearDemoPlans(): { success: boolean; count: number; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canDeleteDemoData(currentUser)) {
      return { success: false, count: 0, error: 'عمليات الحذف والتفريغ مقتصرة فقط على إدارة المدرسة والمشرفين المخولين.' };
    }
    const plans = this.getPlans();
    const count = plans.length;
    setStored(STORAGE_KEYS.PLANS, []);
    this.logAction(currentUser, 'حذف خطط التطوير التجريبية', `تم مسح جميع خطط التطوير المهني (${count} خطة).`);
    return { success: true, count };
  }

  static clearDemoTeachers(): { success: boolean; count: number; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canDeleteDemoData(currentUser)) {
      return { success: false, count: 0, error: 'عمليات الحذف والتفريغ مقتصرة فقط على إدارة المدرسة والمشرفين المخولين.' };
    }
    const teachers = this.getTeachers();
    const count = teachers.length;
    setStored(STORAGE_KEYS.TEACHERS, []);
    this.logAction(currentUser, 'حذف المعلمين التجريبيين', `تم مسح سجل المعلمين التجريبي (${count} معلماً) لتمكين استيراد الكادر الرسمي.`);
    return { success: true, count };
  }

  static resetAllDataToClean(): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (!this.canDeleteDemoData(currentUser)) {
      return { success: false, error: 'عمليات الحذف والتفريغ مقتصرة فقط على إدارة المدرسة والمشرفين المخولين.' };
    }
    setStored(STORAGE_KEYS.VISITS, []);
    setStored(STORAGE_KEYS.PLANS, []);
    setStored(STORAGE_KEYS.TEACHERS, []);
    this.logAction(currentUser, 'تفريغ كامل البيانات التجريبية', 'تم مسح كافة البيانات التجريبية (الزيارات، المعلمين، خطط التطوير) وبدء سجل مدرسي رسمي نظيف.');
    return { success: true };
  }

  // Reset to initial defaults
  static resetToDefaults(): void {
    const currentUser = this.getCurrentUser();
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.VISITS);
    localStorage.removeItem(STORAGE_KEYS.PLANS);
    localStorage.removeItem(STORAGE_KEYS.ACADEMIC_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PLATFORM_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.REGISTERED_VISITORS);
    this.logAction(currentUser, 'استعادة ضبط المصنع', 'تمت استعادة البيانات الأولية الافتراضية لمنظومة أَثَر.');
  }

  // Strict Security and Permissions Helpers (صلاحيات دقيقة ومقيدة للمخولين فقط)
  static canManageTeachers(user: User): boolean {
    if (!user) return false;
    // Teachers and unauthorized users are strictly blocked
    return ['school_admin', 'platform_admin', 'vice_principal', 'evaluator'].includes(user.role);
  }

  static canDeleteTeacher(user: User): boolean {
    if (!user) return false;
    return ['school_admin', 'platform_admin', 'vice_principal', 'evaluator'].includes(user.role);
  }

  static canCreateVisit(user: User): boolean {
    if (!user) return false;
    return ['evaluator', 'school_admin', 'vice_principal', 'platform_admin'].includes(user.role);
  }

  static canEditVisit(user: User, visit?: ClassroomVisit): boolean {
    if (!user || user.role === 'teacher') return false; // Teachers can NEVER edit visits
    if (['school_admin', 'platform_admin'].includes(user.role)) return true;
    if (user.role === 'vice_principal') return true;
    if (user.role === 'evaluator') {
      if (!visit) return true;
      // Evaluator can edit their own visit or draft visit
      return visit.evaluatorId === user.id || visit.evaluatorName === user.name || visit.status === 'draft' || ['school_admin', 'platform_admin', 'vice_principal', 'evaluator'].includes(user.role);
    }
    return false;
  }

  static canDeleteVisit(user: User): boolean {
    if (!user) return false;
    // Authorized leadership and evaluators can delete reports
    return ['school_admin', 'platform_admin', 'vice_principal', 'evaluator'].includes(user.role);
  }

  static canApproveVisit(user: User): boolean {
    if (!user) return false;
    return ['school_admin', 'platform_admin', 'vice_principal'].includes(user.role);
  }

  static canCreatePlan(user: User): boolean {
    if (!user) return false;
    return ['school_admin', 'vice_principal', 'evaluator', 'platform_admin'].includes(user.role);
  }

  static canEditSettings(user: User): boolean {
    if (!user) return false;
    // Authorized leadership and evaluators can manage platform settings and directory
    return ['school_admin', 'platform_admin', 'vice_principal', 'evaluator'].includes(user.role);
  }

  static canDeleteDemoData(user: User): boolean {
    if (!user) return false;
    return ['school_admin', 'platform_admin', 'vice_principal', 'evaluator'].includes(user.role);
  }

  static canViewVisit(user: User, visit: ClassroomVisit): boolean {
    if (!user) return false;
    if (['school_admin', 'vice_principal', 'evaluator', 'platform_admin'].includes(user.role)) {
      return true;
    }
    // Teacher: only view their own visits
    if (user.role === 'teacher') {
      return visit.teacherJobNumber === user.jobNumber || visit.teacherName === user.name;
    }
    return false;
  }

  // Labels with bilingual support
  static getRoleLabel(role: UserRole, lang: 'ar' | 'en' = 'ar'): string {
    if (lang === 'en') {
      switch (role) {
        case 'platform_admin': return 'Platform Admin';
        case 'school_admin': return 'School Principal / Admin';
        case 'vice_principal': return 'Vice Principal';
        case 'evaluator': return 'Evaluator / Observer';
        case 'teacher': return 'Teacher';
        default: return role;
      }
    }
    switch (role) {
      case 'platform_admin': return 'مسؤول المنصة';
      case 'school_admin': return 'مسؤول المدرسة';
      case 'vice_principal': return 'مساعد المدير';
      case 'evaluator': return 'المقيم';
      case 'teacher': return 'المعلم';
      default: return role;
    }
  }

  static getVisitorRoleLabel(role: string, lang: 'ar' | 'en' = 'ar'): string {
    if (lang === 'en') {
      switch (role) {
        case 'admin': return 'Administrative Staff';
        case 'teacher': return 'Teacher';
        case 'cluster_director': return 'Cluster Director';
        case 'principal': return 'School Principal';
        case 'vice_principal': return 'Vice Principal';
        case 'head_of_arabic': return 'Head of Arabic Language Faculty';
        case 'department_head': return 'Department Head';
        case 'academic_supervisor': return 'Educational Supervisor';
        case 'evaluator': return 'Certified Evaluator';
        default: return 'Other';
      }
    }
    switch (role) {
      case 'admin': return 'إداري';
      case 'teacher': return 'معلم';
      case 'cluster_director': return 'مدير / مديرة النطاق';
      case 'principal': return 'مدير مدرسة';
      case 'vice_principal': return 'مساعد مدير / نائب أكاديمي';
      case 'head_of_arabic': return 'رئيس هيئة تدريس المواد العربية';
      case 'department_head': return 'رئيس قسم';
      case 'academic_supervisor': return 'موجه تربوي / أخصائي';
      case 'evaluator': return 'مقيّم معتمد';
      default: return 'أخرى';
    }
  }

  static getStudentGenderLabel(gender?: string, lang: 'ar' | 'en' = 'ar'): string {
    if (!gender) return lang === 'en' ? 'Unspecified' : 'غير محدد';
    if (lang === 'en') {
      switch (gender) {
        case 'boys': return 'Boys (Male)';
        case 'girls': return 'Girls (Female)';
        case 'mixed': return 'Mixed (Co-ed)';
        default: return gender;
      }
    }
    switch (gender) {
      case 'boys': return 'ذكور (بنين)';
      case 'girls': return 'إناث (بنات)';
      case 'mixed': return 'مختلط';
      default: return gender;
    }
  }

  static getVisitStatusLabel(status: ClassroomVisit['status'], lang: 'ar' | 'en' = 'ar'): string {
    if (lang === 'en') {
      switch (status) {
        case 'draft': return 'Draft';
        case 'in_progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'approved': return 'Approved';
        case 'archived': return 'Archived';
        default: return status;
      }
    }
    switch (status) {
      case 'draft': return 'مسودة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتملة';
      case 'approved': return 'معتمدة';
      case 'archived': return 'مؤرشفة';
      default: return status;
    }
  }

  static getRatingLabel(rating: string, lang: 'ar' | 'en' = 'ar'): string {
    const labels: Record<string, { ar: string; en: string }> = {
      outstanding: { ar: 'ممتاز', en: 'Excellent' },
      very_good: { ar: 'جيد جدًا', en: 'Very Good' },
      good: { ar: 'جيد', en: 'Good' },
      acceptable: { ar: 'مقبول', en: 'Acceptable' },
      weak: { ar: 'ضعيف', en: 'Weak' },
      not_observed: { ar: 'لم يُشاهد', en: 'Not Observed' },
      // Legacy values are retained for previously saved visits.
      yes: { ar: 'ممتاز', en: 'Excellent' },
      needs_improvement: { ar: 'مقبول', en: 'Acceptable' },
      no: { ar: 'ضعيف', en: 'Weak' }
    };
    return labels[rating]?.[lang] || rating;
  }

  static getDomainRatingLabel(rating: string, lang: 'ar' | 'en' = 'ar'): string {
    if (lang === 'en') {
      switch (rating) {
        case 'outstanding': return 'Outstanding';
        case 'very_good': return 'Very Good';
        case 'good': return 'Good';
        case 'acceptable': return 'Acceptable';
        case 'weak': return 'Weak';
        case 'very_weak': return 'Very Weak';
        default: return rating;
      }
    }
    switch (rating) {
      case 'outstanding': return 'متميز';
      case 'very_good': return 'جيد جدًا';
      case 'good': return 'جيد';
      case 'acceptable': return 'مقبول';
      case 'weak': return 'ضعيف';
      case 'very_weak': return 'ضعيف جدًا';
      default: return rating;
    }
  }

  static getPlanStatusLabel(status: ImprovementPlan['status'], lang: 'ar' | 'en' = 'ar'): string {
    if (lang === 'en') {
      switch (status) {
        case 'not_started': return 'Not Started';
        case 'in_progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'needs_follow_up': return 'Needs Follow-Up';
        default: return status;
      }
    }
    switch (status) {
      case 'not_started': return 'لم تبدأ';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتملة';
      case 'needs_follow_up': return 'تحتاج إلى متابعة';
      default: return status;
    }
  }
}
