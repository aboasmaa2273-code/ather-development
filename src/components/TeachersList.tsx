import React, { useState } from 'react';
import { Teacher, User } from '../types';
import { AtharStorageService } from '../services/storageService';
import { 
  Search, 
  UserPlus, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  FileText, 
  Filter, 
  Plus, 
  X,
  Trash2
} from 'lucide-react';
import { TeacherImportModal } from './TeacherImportModal';
import { translations, Language } from '../i18n/translations';

interface TeachersListProps {
  teachers: Teacher[];
  currentUser: User;
  onRefreshTeachers: () => void;
  onOpenTeacherReport: (teacher: Teacher) => void;
  language?: Language;
}

export const TeachersList: React.FC<TeachersListProps> = ({
  teachers,
  currentUser,
  onRefreshTeachers,
  onOpenTeacherReport,
  language = 'ar'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  const t = translations[language];
  const isEn = language === 'en';

  const canManage = AtharStorageService.canManageTeachers(currentUser);
  const canDeleteTeacher = AtharStorageService.canDeleteTeacher(currentUser);
  const isTeacher = currentUser.role === 'teacher';

  // Filtered teachers list
  const filtered = teachers.filter(tch => {
    if (isTeacher && tch.jobNumber !== currentUser.jobNumber && tch.fullName !== currentUser.name) {
      return false;
    }

    const matchesSearch = 
      tch.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tch.jobNumber.includes(searchTerm);

    const matchesSpec = filterSpecialization === 'ALL' || tch.specialization === filterSpecialization;
    const matchesStatus = filterStatus === 'ALL' || tch.status === filterStatus;

    return matchesSearch && matchesSpec && matchesStatus;
  });

  const specializations = Array.from(new Set(teachers.map(tch => tch.specialization)));

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFullName('');
    setJobNumber('');
    setSpecialization(isEn ? 'Mathematics' : 'اللغة العربية');
    setEmail('');
    setPhone('');
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (tch: Teacher) => {
    setEditingTeacher(tch);
    setFullName(tch.fullName);
    setJobNumber(tch.jobNumber);
    setSpecialization(tch.specialization);
    setEmail(tch.email);
    setPhone(tch.phone || '');
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !jobNumber.trim() || !specialization.trim()) {
      setFormError(isEn ? 'Please fill all required fields (Full name, Job ID, Specialization).' : 'يرجى ملء جميع الحقول المطلوبة (الاسم الكامل، الرقم الوظيفي، التخصص).');
      return;
    }

    const res = AtharStorageService.saveTeacher({
      id: editingTeacher?.id,
      schoolId: 'sch_alsadara_01',
      fullName: fullName.trim(),
      jobNumber: jobNumber.trim(),
      specialization: specialization.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status: editingTeacher ? editingTeacher.status : 'active'
    });

    if (res.success) {
      setIsEditModalOpen(false);
      onRefreshTeachers();
    } else {
      setFormError(res.error || (isEn ? 'An error occurred while saving.' : 'حدث خطأ أثناء حفظ المعلم.'));
    }
  };

  const handleToggleStatus = (id: string) => {
    const res = AtharStorageService.toggleTeacherStatus(id);
    if (res.success) {
      onRefreshTeachers();
    } else {
      alert(res.error);
    }
  };

  const handleDeleteTeacher = (teacherId: string, teacherName: string) => {
    if (!confirm(isEn ? `Are you sure you want to delete teacher ${teacherName}? This action is restricted to authorized leadership.` : `هل أنت متأكد من رغبتك في حذف المعلم (${teacherName}) نهائياً؟ هذا الإجراء مقتصر على القيادة المدرسية المخولة فقط.`)) {
      return;
    }
    const res = AtharStorageService.deleteTeacher(teacherId);
    if (res.success) {
      onRefreshTeachers();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#172C40] font-['Tajawal']">{t.teachers.title}</h2>
          <p className="text-xs text-[#64748B] mt-1">
            {t.teachers.subtitle}
          </p>
        </div>

        {!isTeacher && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 bg-white text-[#172C40] border-2 border-[#172C40] rounded-xl text-xs font-bold hover:bg-[#F2EBDD]/40 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#C6A66A]" />
              <span>{isEn ? 'Import Faculty CSV' : 'استيراد ملف معلمين (CSV)'}</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-gradient-to-r from-[#C6A66A] to-[#b89556] hover:from-[#d4b478] hover:to-[#c6a66a] text-[#172C40] rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              title={isEn ? 'Add New Teacher to the Directory' : 'إضافة معلم جديد إلى السجل المدرسي'}
            >
              <UserPlus className="w-4 h-4 text-[#172C40]" />
              <span>{isEn ? '➕ Add New Teacher' : '➕ إضافة معلم جديد'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isEn ? 'left-3' : 'right-3'} top-2.5`} />
          <input
            type="text"
            placeholder={t.teachers.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isEn ? 'pl-9 pr-3' : 'pr-9 pl-3'} py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#172C40]`}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t.teachers.filterAllSpecs}</option>
            {specializations.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t.teachers.filterAllStatuses}</option>
            <option value="active">{t.status.active}</option>
            <option value="inactive">{t.status.inactive}</option>
          </select>
        </div>
      </div>

      {/* Teachers Data Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full ${isEn ? 'text-left' : 'text-right'} border-collapse text-xs`}>
            <thead>
              <tr className="bg-[#F8FAFC] text-[#172C40] border-b border-slate-200">
                <th className="py-3 px-4 font-bold">{t.teachers.colJobNumber}</th>
                <th className="py-3 px-4 font-bold">{t.teachers.colName}</th>
                <th className="py-3 px-4 font-bold">{t.teachers.colSpec}</th>
                <th className="py-3 px-4 font-bold">{t.teachers.colEmailPhone}</th>
                <th className="py-3 px-4 font-bold">{t.teachers.colStatus}</th>
                <th className="py-3 px-4 font-bold">{isEn ? 'Date Added' : 'تاريخ الإضافة'}</th>
                <th className="py-3 px-4 font-bold text-center">{t.teachers.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#172C40]">{teacher.jobNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-[#172C40]">{teacher.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-700">{teacher.specialization}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{teacher.email}</td>
                    <td className="py-3.5 px-4">
                      {teacher.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{t.status.active}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t.status.inactive}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{teacher.dateAdded}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Teacher Report */}
                        <button
                          onClick={() => onOpenTeacherReport(teacher)}
                          title={isEn ? 'View Teacher Performance Report & Visits' : 'عرض تقرير أداء المعلم وسجل زياراته'}
                          className="px-2.5 py-1 bg-[#F2EBDD] text-[#172C40] hover:bg-[#e4d7bf] rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#C6A66A]" />
                          <span>{t.dashboard.viewReport}</span>
                        </button>

                        {/* Edit & Status actions (Admins only) */}
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(teacher)}
                              title={isEn ? 'Edit Teacher' : 'تعديل بيانات المعلم'}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-[#172C40] cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(teacher.id)}
                              title={teacher.status === 'active' ? (isEn ? 'Deactivate' : 'تعطيل الحساب') : (isEn ? 'Activate' : 'تفعيل الحساب')}
                              className={`p-1 rounded text-xs cursor-pointer ${teacher.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            >
                              {teacher.status === 'active' ? (isEn ? 'Deactivate' : 'تعطيل') : (isEn ? 'Activate' : 'تفعيل')}
                            </button>

                            {canDeleteTeacher && (
                              <button
                                onClick={() => handleDeleteTeacher(teacher.id, teacher.fullName)}
                                title={isEn ? 'Delete Teacher (Authorized only)' : 'حذف المعلم (للمخولين فقط)'}
                                className="p-1 hover:bg-rose-50 rounded text-rose-600 hover:text-rose-800 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {isEn ? 'No teachers match your search filter.' : 'لا يوجد معلمون يطابقون معايير البحث الحالية.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Teacher Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#172C40]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#172C40] text-white">
              <h3 className="font-bold text-sm font-['Tajawal']">
                {editingTeacher ? (isEn ? 'Edit Teacher Record' : 'تعديل بيانات المعلم') : t.teachers.modalAddTitle}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/80 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.teachers.fullNameLabel} *</label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? 'e.g. John Miller' : 'مثال: راشد بن سلطان الكعبي'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#172C40]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.teachers.jobNumberLabel} *</label>
                <input
                  type="text"
                  required
                  placeholder="10452"
                  value={jobNumber}
                  onChange={(e) => setJobNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#172C40]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isEn ? 'Job ID must be unique across the system.' : 'يُشترط ألا يكون الرقم الوظيفي مستخدماً مسبقاً في المنظومة.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.teachers.specLabel} *</label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? 'e.g. Mathematics' : 'مثال: الرياضيات'}
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#172C40]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.teachers.emailLabel}</label>
                <input
                  type="email"
                  placeholder="teacher@alsadara.edu.ae"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#172C40]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.teachers.phoneLabel}</label>
                <input
                  type="text"
                  placeholder="0501234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#172C40]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] cursor-pointer"
                >
                  {editingTeacher ? t.common.save : t.teachers.addNewTeacher}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      <TeacherImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          setIsImportModalOpen(false);
          onRefreshTeachers();
        }}
        language={language}
      />
    </div>
  );
};
