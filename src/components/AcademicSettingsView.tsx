import React, { useState } from 'react';
import { AcademicSettings, User } from '../types';
import { AtharStorageService } from '../services/storageService';
import { 
  Settings, 
  Check, 
  Plus, 
  Trash2, 
  Layers, 
  BookOpen, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface AcademicSettingsViewProps {
  settings: AcademicSettings;
  currentUser: User;
  onRefreshSettings: () => void;
  language?: Language;
}

export const AcademicSettingsView: React.FC<AcademicSettingsViewProps> = ({
  settings,
  currentUser,
  onRefreshSettings,
  language = 'ar'
}) => {
  const [grades, setGrades] = useState<string[]>(() => {
    return (settings.grades || []).filter(g => g !== 'الصف التاسع');
  });
  const [newGrade, setNewGrade] = useState('');

  const [sectionsCount, setSectionsCount] = useState<number>(settings.sectionsCount || 4);

  const [subjects, setSubjects] = useState<string[]>(settings.subjects);
  const [newSubject, setNewSubject] = useState('');

  const [academicYears, setAcademicYears] = useState<string[]>(settings.academicYears);
  const [currentYear, setCurrentYear] = useState(settings.currentAcademicYear);

  const [terms, setTerms] = useState<string[]>(settings.terms);
  const [currentTerm, setCurrentTerm] = useState(settings.currentTerm);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const t = translations[language];
  const isEn = language === 'en';
  const canEdit = currentUser?.role !== 'teacher';

  const handleAddGrade = () => {
    const trimmed = newGrade.trim();
    if (trimmed && !grades.includes(trimmed)) {
      const updatedGrades = [...grades, trimmed];
      setGrades(updatedGrades);
      setNewGrade('');
      
      const updated: AcademicSettings = {
        grades: updatedGrades,
        sectionsCount,
        subjects,
        academicYears,
        currentAcademicYear: currentYear,
        terms,
        currentTerm
      };
      AtharStorageService.saveAcademicSettings(updated);
      onRefreshSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleRemoveGrade = (gradeToRemove: string) => {
    if (!confirm(isEn ? `Are you sure you want to delete grade "${gradeToRemove}"?` : `هل أنت متأكد من حذف "${gradeToRemove}" من قائمة الصفوف الدراسية؟`)) {
      return;
    }
    const updatedGrades = grades.filter(g => g !== gradeToRemove);
    setGrades(updatedGrades);
    
    const updated: AcademicSettings = {
      grades: updatedGrades,
      sectionsCount,
      subjects,
      academicYears,
      currentAcademicYear: currentYear,
      terms,
      currentTerm
    };
    AtharStorageService.saveAcademicSettings(updated);
    onRefreshSettings();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddSubject = () => {
    const trimmed = newSubject.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      const updatedSubjects = [...subjects, trimmed];
      setSubjects(updatedSubjects);
      setNewSubject('');
      
      const updated: AcademicSettings = {
        grades,
        sectionsCount,
        subjects: updatedSubjects,
        academicYears,
        currentAcademicYear: currentYear,
        terms,
        currentTerm
      };
      AtharStorageService.saveAcademicSettings(updated);
      onRefreshSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    if (!confirm(isEn ? `Are you sure you want to delete subject "${subjectToRemove}"?` : `هل أنت متأكد من حذف "${subjectToRemove}" من قائمة المواد الدراسية؟`)) {
      return;
    }
    const updatedSubjects = subjects.filter(s => s !== subjectToRemove);
    setSubjects(updatedSubjects);
    
    const updated: AcademicSettings = {
      grades,
      sectionsCount,
      subjects: updatedSubjects,
      academicYears,
      currentAcademicYear: currentYear,
      terms,
      currentTerm
    };
    AtharStorageService.saveAcademicSettings(updated);
    onRefreshSettings();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSave = () => {
    setSaveSuccess(false);
    setSaveError('');

    const updated: AcademicSettings = {
      grades,
      sectionsCount,
      subjects,
      academicYears,
      currentAcademicYear: currentYear,
      terms,
      currentTerm
    };

    const res = AtharStorageService.saveAcademicSettings(updated);
    if (res.success) {
      setSaveSuccess(true);
      onRefreshSettings();
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(res.error || (isEn ? 'Error occurred while saving settings.' : 'حدث خطأ أثناء حفظ الإعدادات.'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#172C40] font-['Tajawal']">
            {isEn ? 'Academic Structure & Curriculum Settings' : 'الإعدادات الأكاديمية وهيكل المدرسة'}
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            {isEn ? 'Manage grade levels, numbered sections, subjects, active years and terms.' : 'إدارة الصفوف الدراسية، الشعب، المواد، الأعوام والفصول الأكاديمية المعتمدة.'}
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#172C40] text-white rounded-lg text-xs font-bold hover:bg-[#101F2D] flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Check className="w-4 h-4 text-[#C6A66A]" />
            <span>{isEn ? 'Save Academic Settings' : 'حفظ الإعدادات الأكاديمية'}</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{isEn ? 'Academic settings updated and saved successfully.' : 'تم حفظ الإعدادات بنجاح وتحديث جداول النظام.'}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Grid of Academic Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Sections Management */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-[#C6A66A]" />
            <h3 className="font-bold text-sm text-[#172C40] font-['Tajawal']">
              {isEn ? 'Numbered Classroom Sections' : 'إدارة الشعب الدراسية (تنسيق بالأرقام)'}
            </h3>
          </div>

          <div>
            <label className="block font-bold text-[#172C40] mb-1">{isEn ? 'Number of sections per grade level:' : 'عدد الشعب لكل صف دراسي:'}</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={15}
                value={sectionsCount}
                onChange={(e) => setSectionsCount(parseInt(e.target.value) || 1)}
                className="w-28 px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-center"
              />
              <span className="text-slate-500 text-[11px]">{isEn ? 'sections per grade' : 'شعب لكل صف دراسي'}</span>
            </div>
          </div>

          <div>
            <span className="font-bold text-[#172C40] block mb-2">{isEn ? 'Live preview of sections:' : 'معاينة أسماء الشعب الظاهرة للمقيم عند إنشاء الزيارة:'}</span>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: sectionsCount }).map((_, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-[#172C40] font-bold rounded border border-slate-200">
                  {isEn ? `Section ${i + 1}` : `الشعبة ${i + 1}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Grades Management */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-[#668575]" />
            <h3 className="font-bold text-sm text-[#172C40] font-['Tajawal']">{t.settings.gradesList}</h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={isEn ? 'Add new grade...' : 'إضافة صف جديد...'}
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg"
            />
            <button
              onClick={handleAddGrade}
              className="px-3 py-1.5 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] cursor-pointer"
            >
              {isEn ? 'Add' : 'إضافة'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {grades.map((grade) => (
              <span key={grade} className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 bg-white hover:bg-[#F2EBDD]/40 text-[#172C40] font-bold rounded-lg border-2 border-[#C6A66A]/40 shadow-2xs transition-all">
                <span>{grade}</span>
                {canEdit && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveGrade(grade)} 
                    className="p-1 rounded-md bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors cursor-pointer border border-rose-200"
                    title={isEn ? `Delete ${grade}` : `حذف ${grade}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Subjects Management */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-[#172C40]" />
            <h3 className="font-bold text-sm text-[#172C40] font-['Tajawal']">{t.settings.subjectsList}</h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={isEn ? 'Add new subject...' : 'إضافة مادة دراسية جديدة...'}
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg"
            />
            <button
              onClick={handleAddSubject}
              className="px-3 py-1.5 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] cursor-pointer"
            >
              {isEn ? 'Add' : 'إضافة'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {subjects.map((sub) => (
              <span key={sub} className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-lg border-2 border-slate-200 shadow-2xs transition-all">
                <span>{sub}</span>
                {canEdit && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveSubject(sub)} 
                    className="p-1 rounded-md bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors cursor-pointer border border-rose-200"
                    title={isEn ? `Delete ${sub}` : `حذف ${sub}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Years & Terms Management */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-[#C6A66A]" />
            <h3 className="font-bold text-sm text-[#172C40] font-['Tajawal']">{isEn ? 'Academic Years & Terms' : 'الأعوام والفصول الأكاديمية'}</h3>
          </div>

          <div>
            <label className="block font-bold text-[#172C40] mb-1">{t.settings.academicYearLabel}:</label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold cursor-pointer"
            >
              {academicYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#172C40] mb-1">{t.settings.currentTermLabel}:</label>
            <select
              value={currentTerm}
              onChange={(e) => setCurrentTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold cursor-pointer"
            >
              {terms.map(tm => (
                <option key={tm} value={tm}>{tm}</option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
