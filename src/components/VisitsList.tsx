import React, { useState } from 'react';
import { ClassroomVisit, User } from '../types';
import { AtharStorageService } from '../services/storageService';
import { 
  Search, 
  PlusCircle, 
  Filter, 
  FileText, 
  Edit, 
  CheckCircle, 
  Clock, 
  Award,
  Download,
  AlertCircle,
  Users,
  GraduationCap,
  Trash2
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { translateSubject, translateGrade, translateSection } from '../utils/bilingualHelper';

interface VisitsListProps {
  visits: ClassroomVisit[];
  currentUser: User;
  onOpenReport: (visit: ClassroomVisit) => void;
  onEditVisit: (visit: ClassroomVisit) => void;
  onCreateNewVisit: () => void;
  onRefreshVisits: () => void;
  language?: Language;
}

export const VisitsList: React.FC<VisitsListProps> = ({
  visits,
  currentUser,
  onOpenReport,
  onEditVisit,
  onCreateNewVisit,
  onRefreshVisits,
  language = 'ar'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTerm, setFilterTerm] = useState('ALL');

  const t = translations[language];
  const isEn = language === 'en';

  const isTeacher = currentUser.role === 'teacher';
  const canCreate = AtharStorageService.canCreateVisit(currentUser);

  // Security filtering: teachers only see their own visits
  const visibleVisits = visits.filter(v => {
    if (!AtharStorageService.canViewVisit(currentUser, v)) {
      return false;
    }

    const matchesSearch = 
      v.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.teacherJobNumber.includes(searchTerm) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || v.visitType === filterType;
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    const matchesTerm = filterTerm === 'ALL' || v.term === filterTerm;

    return matchesSearch && matchesType && matchesStatus && matchesTerm;
  });

  const handleApproveVisit = (visitId: string) => {
    const res = AtharStorageService.updateVisitStatus(visitId, 'approved');
    if (res.success) {
      onRefreshVisits();
    } else {
      alert(res.error);
    }
  };

  const handleDeleteVisit = (visitId: string) => {
    if (!confirm(isEn ? 'Are you sure you want to delete this visit record? This action is restricted to authorized leadership.' : 'هل أنت متأكد من حذف سجل هذه الزيارة نهائياً؟ هذا الإجراء مقتصر على القيادات المخولة فقط.')) {
      return;
    }
    const res = AtharStorageService.deleteVisit(visitId);
    if (res.success) {
      onRefreshVisits();
    } else {
      alert(res.error);
    }
  };

  const handleExportCsv = () => {
    const headers = isEn 
      ? ['Visit ID', 'Teacher', 'Job ID', 'Subject', 'Grade', 'Section', 'Type', 'Students', 'Present', 'Absent', 'Gender', 'Evaluator', 'Date', 'Achievement %', 'Status']
      : ['رقم الزيارة', 'المعلم', 'الرقم الوظيفي', 'المادة', 'الصف', 'الشعبة', 'نوع الزيارة', 'إجمالي الطلبة', 'الحضور', 'الغياب', 'نوع الطلبة', 'المقيم والزوار', 'التاريخ', 'نسبة الإنجاز', 'الحالة'];
    
    const rows = visibleVisits.map(v => [
      v.id,
      v.teacherName,
      v.teacherJobNumber,
      translateSubject(v.subject, language),
      translateGrade(v.grade, language),
      translateSection(v.section, language),
      v.visitType === 'full' ? (isEn ? 'Full' : 'كاملة') : (isEn ? 'Quick' : 'سريعة'),
      v.totalStudents ?? '',
      v.attendedStudents ?? '',
      v.absentStudents ?? '',
      AtharStorageService.getStudentGenderLabel(v.studentGender, language),
      v.visitors && v.visitors.length > 0 ? v.visitors.map(vis => `${vis.name} (${vis.role})`).join('; ') : v.evaluatorName,
      v.date,
      `${v.achievementPercentage}%`,
      AtharStorageService.getVisitStatusLabel(v.status, language)
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `athar_visits_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#172C40] font-['Tajawal']">{t.visits.title}</h2>
          <p className="text-xs text-[#64748B] mt-1">
            {isTeacher 
              ? (isEn ? 'Your certified observation reports and feedback.' : 'سجل زياراتك الصفية المعتمدة وتقارير التقييم الصادرة بحقك.')
              : t.visits.subtitle
            }
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white text-[#172C40] border border-[#C6A66A] rounded-lg text-xs font-bold hover:bg-[#F2EBDD]/40 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A66A]" />
            <span>{t.common.exportCsv}</span>
          </button>

          {canCreate && (
            <button
              onClick={onCreateNewVisit}
              className="px-4 py-2 bg-[#172C40] text-white rounded-lg text-xs font-bold hover:bg-[#101F2D] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#C6A66A]" />
              <span>{t.visits.formTitleNew}</span>
            </button>
          )}
        </div>
      </div>

      {/* Fair Comparison Rule Callout */}
      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#668575] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#172C40]">
            {isEn ? 'Principle of Fair Metric Evaluation: ' : 'مبدأ العدالة والمقارنة الموضوعية: '}
          </strong>
          <span className={isEn ? 'ml-1' : 'mr-1'}>
            {t.visits.fairComparisonNotice}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isEn ? 'left-3' : 'right-3'} top-2.5`} />
          <input
            type="text"
            placeholder={t.visits.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isEn ? 'pl-9 pr-3' : 'pr-9 pl-3'} py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#172C40]`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t.visits.filterAllTypes}</option>
            <option value="full">{t.dashboard.full}</option>
            <option value="quick">{t.dashboard.quick}</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t.visits.filterAllStatuses}</option>
            <option value="approved">{t.status.approved}</option>
            <option value="completed">{t.status.completed}</option>
            <option value="draft">{t.status.draft}</option>
          </select>

          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t.visits.filterAllTerms}</option>
            <option value="الفصل الدراسي الأول">{t.dashboard.term1}</option>
            <option value="الفصل الدراسي الثاني">{t.dashboard.term2}</option>
            <option value="الفصل الدراسي الثالث">{t.dashboard.term3}</option>
          </select>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full ${isEn ? 'text-left' : 'text-right'} border-collapse text-xs`}>
            <thead>
              <tr className="bg-[#F8FAFC] text-[#172C40] border-b border-slate-200">
                <th className="py-3.5 px-4 font-bold">{t.dashboard.tableVisitId}</th>
                <th className="py-3.5 px-4 font-bold">{t.dashboard.tableTeacher}</th>
                <th className="py-3.5 px-4 font-bold">{t.dashboard.tableSubjectGrade}</th>
                <th className="py-3.5 px-4 font-bold">{isEn ? 'Attendance & Demographics' : 'الحضور والطلبة'}</th>
                <th className="py-3.5 px-4 font-bold">{t.dashboard.tableEvaluator}</th>
                <th className="py-3.5 px-4 font-bold">{t.dashboard.tableType}</th>
                <th className="py-3.5 px-4 font-bold">{t.visits.visitDate}</th>
                <th className="py-3.5 px-4 font-bold">{t.dashboard.tableAchievement}</th>
                <th className="py-3.5 px-4 font-bold">{t.dashboard.tableStatus}</th>
                <th className="py-3.5 px-4 font-bold text-center">{t.dashboard.tableAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleVisits.length > 0 ? (
                visibleVisits.map((visit) => {
                  const canEdit = AtharStorageService.canEditVisit(currentUser, visit);
                  const canApprove = AtharStorageService.canApproveVisit(currentUser) && visit.status !== 'approved';
                  const canDelete = !isTeacher;

                  return (
                    <tr key={visit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#172C40]">{visit.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#172C40]">{visit.teacherName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{visit.teacherJobNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">{translateSubject(visit.subject, language)}</div>
                        <div className="text-[10px] text-slate-400">{translateGrade(visit.grade, language)} - {translateSection(visit.section, language)}</div>
                      </td>
                      
                      {/* Attendance & Demographics Tag */}
                      <td className="py-3.5 px-4">
                        {visit.totalStudents !== undefined ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#172C40]">
                              <span>👥 {visit.attendedStudents}/{visit.totalStudents}</span>
                              <span className="text-[10px] text-[#668575] font-sans">
                                ({visit.totalStudents > 0 ? Math.round(((visit.attendedStudents || 0) / visit.totalStudents) * 100) : 0}%)
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {AtharStorageService.getStudentGenderLabel(visit.studentGender, language)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Evaluator & Multi-visitors */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium">{visit.evaluatorName}</div>
                        {visit.visitors && visit.visitors.length > 1 && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#668575] bg-[#F2EBDD] border border-[#C6A66A]/30 px-1.5 py-0.2 rounded mt-0.5">
                            <Users className="w-2.5 h-2.5" />
                            <span>+{visit.visitors.length - 1} {isEn ? 'observers' : 'زوار إضافيين'}</span>
                          </span>
                        )}
                      </td>

                      {/* Visit Type */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          visit.visitType === 'full' 
                            ? 'bg-[#172C40]/10 text-[#172C40]' 
                            : 'bg-[#C6A66A]/20 text-[#856526]'
                        }`}>
                          {visit.visitType === 'full' ? t.dashboard.full : t.dashboard.quick}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">{visit.date}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-[#172C40]">
                          <span>{visit.achievementPercentage}%</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {visit.observedIndicatorsCount} {t.dashboard.observedCount}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          visit.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          visit.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {AtharStorageService.getVisitStatusLabel(visit.status, language)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenReport(visit)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#172C40] hover:text-white text-slate-700 transition-colors cursor-pointer"
                            title={t.dashboard.viewReport}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {canEdit && (
                            <button
                              onClick={() => onEditVisit(visit)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title={isEn ? 'Edit Visit' : 'تعديل الزيارة'}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canApprove && (
                            <button
                              onClick={() => handleApproveVisit(visit.id)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-colors cursor-pointer"
                              title={isEn ? 'Approve & Certify' : 'اعتماد رسمي'}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteVisit(visit.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                              title={isEn ? 'Delete Report' : 'حذف التقرير'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>{t.visits.noVisitsFound}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
