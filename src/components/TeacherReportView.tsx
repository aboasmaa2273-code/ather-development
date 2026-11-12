import React from 'react';
import { Teacher, ClassroomVisit, ImprovementPlan, PlatformSettings } from '../types';
import { AtharStorageService } from '../services/storageService';
import { 
  ArrowRight, 
  ArrowLeft,
  Printer, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface TeacherReportViewProps {
  teacher: Teacher;
  visits: ClassroomVisit[];
  plans: ImprovementPlan[];
  platformSettings: PlatformSettings;
  onBack: () => void;
  onOpenVisitReport: (visit: ClassroomVisit) => void;
  language?: Language;
}

export const TeacherReportView: React.FC<TeacherReportViewProps> = ({
  teacher,
  visits,
  plans,
  platformSettings,
  onBack,
  onOpenVisitReport,
  language = 'ar'
}) => {
  const t = translations[language];
  const isEn = language === 'en';

  // Filter teacher's specific visits and plans
  const teacherVisits = visits.filter(
    v => v.teacherJobNumber === teacher.jobNumber || v.teacherId === teacher.id
  );

  const teacherPlans = plans.filter(
    p => p.teacherJobNumber === teacher.jobNumber || p.teacherId === teacher.id
  );

  // Compute average achievement percentage
  const totalVisits = teacherVisits.length;
  const avgAchievement = totalVisits > 0 
    ? Math.round(teacherVisits.reduce((sum, v) => sum + v.achievementPercentage, 0) / totalVisits * 10) / 10
    : 0;

  // Recurring strengths and areas for improvement
  const allStrengths = teacherVisits.flatMap(v => v.strengths || []);
  const allImprovements = teacherVisits.flatMap(v => v.improvementAreas || []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Back and Action Bar */}
      <div className="no-print bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isEn ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          <span>{isEn ? 'Back to Teachers Roster' : 'العودة إلى قائمة المعلمين'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-[#172C40] text-white rounded-lg text-xs font-bold hover:bg-[#101F2D] flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4 text-[#C6A66A]" />
          <span>{isEn ? 'Print Longitudinal Teacher Report' : 'طباعة تقرير المعلم التراكمي'}</span>
        </button>
      </div>

      {/* Main Report Container */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm space-y-8 text-xs text-[#172C40]">
        
        {/* Header Strip */}
        <div className="border-b-2 border-[#172C40] pb-6 flex items-center justify-between">
          <div className={isEn ? 'text-left' : 'text-right'}>
            <span className="text-[11px] font-bold text-[#668575] block">
              {isEn ? 'ATHAR System for Excellence & Development' : 'منظومة «أَثَر» للتطوير والتميز'}
            </span>
            <h1 className="text-2xl font-black font-['Tajawal'] text-[#172C40] mt-0.5">
              {isEn ? 'Cumulative Pedagogical Performance & Growth Report' : 'تقرير الأداء التدريسي والنمو المهني التراكمي'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{platformSettings.schoolName}</p>
          </div>

          <div className={isEn ? 'text-right text-xs text-slate-500' : 'text-left text-xs text-slate-500'}>
            <div>
              {isEn ? 'Report Generated:' : 'تاريخ استخراج التقرير:'} <span className="font-mono font-bold text-[#172C40]">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <div className="mt-1">
              {t.visits.academicYear}: <span className="font-bold text-[#172C40]">2026 - 2027</span>
            </div>
          </div>
        </div>

        {/* Teacher Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-xl bg-[#F8FAFC] border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px]">{t.teachers.colName}:</span>
            <span className="font-bold text-base text-[#172C40]">{teacher.fullName}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">{t.teachers.colJobNumber}:</span>
            <span className="font-mono font-bold text-[#172C40] text-sm">{teacher.jobNumber}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">{t.teachers.colSpec}:</span>
            <span className="font-bold text-[#172C40]">{teacher.specialization}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">{isEn ? 'Average Achievement %:' : 'متوسط نسبة الإنجاز:'}</span>
            <span className="text-lg font-black text-[#668575] tabular-nums">{avgAchievement}%</span>
            <span className="text-[10px] text-slate-400 block">
              {isEn ? `Across ${totalVisits} visits` : `عبر ${totalVisits} زيارات`}
            </span>
          </div>
        </div>

        {/* Term Comparison KPI Strip */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#172C40] font-['Tajawal']">
            {isEn ? 'Performance Progression Across Academic Terms' : 'مقارنة الأداء وتطور الزيارات عبر الفصول الدراسية'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'الفصل الدراسي الأول', label: t.dashboard.term1 },
              { id: 'الفصل الدراسي الثاني', label: t.dashboard.term2 },
              { id: 'الفصل الدراسي الثالث', label: t.dashboard.term3 }
            ].map(({ id, label }) => {
              const termVisits = teacherVisits.filter(v => v.term === id);
              const termAvg = termVisits.length > 0 
                ? Math.round(termVisits.reduce((s, v) => s + v.achievementPercentage, 0) / termVisits.length * 10) / 10
                : null;

              return (
                <div key={id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="font-bold text-slate-700 block text-xs">{label}</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#172C40] tabular-nums">
                      {termAvg !== null ? `${termAvg}%` : '—'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {termVisits.length} {isEn ? 'visits' : 'زيارات'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visited Sessions History */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#172C40] font-['Tajawal']">
            {isEn ? 'Observed Classroom Visits Registry' : 'سجل الزيارات الصفية المنفذة للمعلم'}
          </h3>
          
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className={`w-full ${isEn ? 'text-left' : 'text-right'} border-collapse text-xs`}>
              <thead className="bg-[#172C40] text-white">
                <tr>
                  <th className="p-3">{t.dashboard.tableVisitId}</th>
                  <th className="p-3">{t.visits.visitDate}</th>
                  <th className="p-3">{t.dashboard.tableSubjectGrade}</th>
                  <th className="p-3">{t.dashboard.tableType}</th>
                  <th className="p-3">{t.dashboard.tableEvaluator}</th>
                  <th className="p-3">{t.dashboard.tableAchievement}</th>
                  <th className="p-3 text-center">{t.dashboard.tableAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teacherVisits.length > 0 ? (
                  teacherVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-[#172C40]">{v.id}</td>
                      <td className="p-3 font-mono text-slate-500">{v.date}</td>
                      <td className="p-3">{v.subject} ({v.grade} - {v.section})</td>
                      <td className="p-3">
                        <span className="text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded">
                          {v.visitType === 'full' ? t.dashboard.full : t.dashboard.quick}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{v.evaluatorName}</td>
                      <td className="p-3 font-bold text-emerald-700 tabular-nums">
                        {v.achievementPercentage}%
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onOpenVisitReport(v)}
                          className="px-2.5 py-1 bg-[#172C40] text-white rounded text-[10px] font-bold hover:bg-[#C6A66A] hover:text-[#172C40] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>{t.dashboard.viewReport}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      {isEn ? 'No classroom visits recorded for this teacher yet.' : 'لم يتم تسجيل أي زيارات صفية لهذا المعلم حتى الآن.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strengths & Improvement Areas Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{isEn ? 'Recurring Strengths & Best Practices:' : 'نقاط القوة والممارسات المتكررة المتميزة:'}</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-emerald-950 text-[11px] leading-relaxed">
              {allStrengths.length > 0 ? (
                Array.from(new Set(allStrengths)).map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))
              ) : (
                <li>{isEn ? 'Positive engagement and commitment to core lesson outcomes.' : 'الالتزام بالأنشطة الصفية الأساسية والتفاعل الإيجابي.'}</li>
              )}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>{isEn ? 'Indicators Targeted for Continuous Growth:' : 'المؤشرات التي تحتاج إلى تطوير مستمر:'}</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-amber-950 text-[11px] leading-relaxed">
              {allImprovements.length > 0 ? (
                Array.from(new Set(allImprovements)).map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))
              ) : (
                <li>{isEn ? 'Sustain excellence across all targeted lesson domains.' : 'مواصلة التميز في كافة مخرجات الحصة الدراسية.'}</li>
              )}
            </ul>
          </div>

        </div>

        {/* Professional Development Plans Assigned to Teacher */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#172C40] font-['Tajawal']">
            {isEn ? 'Professional Development Action Plans' : 'خطط التطوير المهني المسندة للمعلم'}
          </h3>
          
          <div className="space-y-3">
            {teacherPlans.length > 0 ? (
              teacherPlans.map((plan) => (
                <div key={plan.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#172C40]">{plan.id}</span>
                      <span className="font-bold text-[#172C40]">{plan.improvementArea}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      plan.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      plan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {AtharStorageService.getPlanStatusLabel(plan.status, language)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700">
                    <strong>{isEn ? 'Goal:' : 'الهدف التطويري:'}</strong> {plan.developmentalGoal}
                  </p>
                  <p className="text-[11px] text-slate-700">
                    <strong>{isEn ? 'Action Procedure:' : 'الإجراء العملي:'}</strong> {plan.actionProcedure}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                    <span>{isEn ? 'Responsible:' : 'المسؤول:'} <strong>{plan.responsiblePerson}</strong></span>
                    <span>{isEn ? 'Duration:' : 'المدة:'} <strong>{plan.duration}</strong></span>
                    <span>{t.plans.colFollowUpDate}: <strong>{plan.followUpDate}</strong></span>
                    {plan.followUpResult && (
                      <span className="text-emerald-700">
                        {isEn ? 'Follow-Up Result:' : 'نتيجة المتابعة:'} <strong>{plan.followUpResult}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 p-4 border border-dashed rounded-xl text-center">
                {isEn ? 'No professional development plans assigned to this teacher.' : 'لا توجد خطط تطوير مهني مسجلة لهذا المعلم.'}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
