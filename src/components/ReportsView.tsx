import React, { useState } from 'react';
import { ClassroomVisit, Teacher, ImprovementPlan, PlatformSettings } from '../types';
import { AtharStorageService } from '../services/storageService';
import { OFFICIAL_INDICATORS } from '../data/defaultData';
import { 
  Printer, 
  Download, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface ReportsViewProps {
  visits: ClassroomVisit[];
  teachers: Teacher[];
  plans: ImprovementPlan[];
  platformSettings: PlatformSettings;
  onOpenVisitReport: (visit: ClassroomVisit) => void;
  onOpenTeacherReport: (teacher: Teacher) => void;
  language?: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  visits,
  teachers,
  plans,
  platformSettings,
  onOpenVisitReport,
  onOpenTeacherReport,
  language = 'ar'
}) => {
  const [filterTerm, setFilterTerm] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const t = translations[language];
  const isEn = language === 'en';

  // Filtered visits
  const filteredVisits = visits.filter(v => {
    const matchTerm = filterTerm === 'ALL' || v.term === filterTerm;
    const matchSubject = filterSubject === 'ALL' || v.subject === filterSubject;
    const matchType = filterType === 'ALL' || v.visitType === filterType;
    return matchTerm && matchSubject && matchType;
  });

  const subjectsList = Array.from(new Set(visits.map(v => v.subject)));
  const evaluatorsList = Array.from(new Set(visits.map(v => v.evaluatorName)));

  // Aggregate stats
  const totalCount = filteredVisits.length;
  const fullCount = filteredVisits.filter(v => v.visitType === 'full').length;
  const quickCount = filteredVisits.filter(v => v.visitType === 'quick').length;
  const completedCount = filteredVisits.filter(v => ['completed', 'approved'].includes(v.status)).length;

  // By Evaluator
  const byEvaluator: Record<string, { full: number; quick: number; total: number }> = {};
  filteredVisits.forEach(v => {
    if (!byEvaluator[v.evaluatorName]) byEvaluator[v.evaluatorName] = { full: 0, quick: 0, total: 0 };
    if (v.visitType === 'full') byEvaluator[v.evaluatorName].full++;
    else byEvaluator[v.evaluatorName].quick++;
    byEvaluator[v.evaluatorName].total++;
  });

  // By Subject
  const bySubject: Record<string, { count: number; avgPct: number; sumPct: number }> = {};
  filteredVisits.forEach(v => {
    if (!bySubject[v.subject]) bySubject[v.subject] = { count: 0, avgPct: 0, sumPct: 0 };
    bySubject[v.subject].count++;
    bySubject[v.subject].sumPct += v.achievementPercentage;
  });
  Object.keys(bySubject).forEach(k => {
    bySubject[k].avgPct = Math.round((bySubject[k].sumPct / bySubject[k].count) * 10) / 10;
  });

  // Most achieved vs needing improvement
  const indicatorStats: Record<number, { yes: number; needsImp: number; no: number; text: string }> = {};
  OFFICIAL_INDICATORS.forEach(ind => {
    indicatorStats[ind.id] = { yes: 0, needsImp: 0, no: 0, text: isEn ? (ind.textEn || ind.text) : ind.text };
  });

  filteredVisits.forEach(v => {
    v.indicators.forEach(res => {
      if (!indicatorStats[res.indicatorId]) {
        indicatorStats[res.indicatorId] = { yes: 0, needsImp: 0, no: 0, text: res.indicatorText };
      }
      if (res.rating === 'yes') indicatorStats[res.indicatorId].yes++;
      else if (res.rating === 'needs_improvement') indicatorStats[res.indicatorId].needsImp++;
      else if (res.rating === 'no') indicatorStats[res.indicatorId].no++;
    });
  });

  const sortedAchieved = Object.values(indicatorStats)
    .filter(s => (s.yes + s.needsImp + s.no) > 0)
    .sort((a, b) => b.yes - a.yes)
    .slice(0, 5);

  const sortedNeedsImp = Object.values(indicatorStats)
    .filter(s => s.needsImp > 0 || s.no > 0)
    .sort((a, b) => (b.needsImp + b.no) - (a.needsImp + a.no))
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = isEn 
      ? ['Subject', 'Visits Count', 'Average Achievement %']
      : ['المادة', 'عدد الزيارات', 'متوسط نسبة الإنجاز'];
    
    const rows = Object.entries(bySubject).map(([sub, data]) => [
      sub,
      data.count,
      `${data.avgPct}%`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `athar_performance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 text-xs text-[#172C40]">
      {/* Header and Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#172C40] font-['Tajawal']">{t.reports.title}</h2>
          <p className="text-slate-500 mt-1">
            {t.reports.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white text-[#172C40] border border-[#C6A66A] rounded-lg font-bold hover:bg-[#F2EBDD]/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A66A]" />
            <span>{t.reports.exportDataBtn}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 text-[#C6A66A]" />
            <span>{t.reports.printReportBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">{isEn ? 'Term Filter:' : 'تصفية حسب الفصل:'}</span>
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold cursor-pointer"
          >
            <option value="ALL">{t.visits.filterAllTerms}</option>
            <option value="الفصل الدراسي الأول">{t.dashboard.term1}</option>
            <option value="الفصل الدراسي الثاني">{t.dashboard.term2}</option>
            <option value="الفصل الدراسي الثالث">{t.dashboard.term3}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">{t.visits.subject}:</span>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold cursor-pointer"
          >
            <option value="ALL">{isEn ? 'All Subjects' : 'جميع المواد'}</option>
            {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">{isEn ? 'Visit Type:' : 'نوع الزيارة:'}</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold cursor-pointer"
          >
            <option value="ALL">{t.visits.filterAllTypes}</option>
            <option value="full">{t.dashboard.full}</option>
            <option value="quick">{t.dashboard.quick}</option>
          </select>
        </div>
      </div>

      {/* Aggregated KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <span className="text-slate-400 block text-[11px]">{t.dashboard.totalVisits}</span>
          <span className="text-2xl font-black text-[#172C40] mt-1 block tabular-nums">{totalCount}</span>
          <span className="text-[10px] text-slate-400">{fullCount} {t.dashboard.full} · {quickCount} {t.dashboard.quick}</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <span className="text-slate-400 block text-[11px]">{t.dashboard.completedVisits}</span>
          <span className="text-2xl font-black text-[#668575] mt-1 block tabular-nums">{completedCount}</span>
          <span className="text-[10px] text-slate-400">{isEn ? `of ${totalCount} visits` : `من أصل ${totalCount} زيارة`}</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <span className="text-slate-400 block text-[11px]">{t.dashboard.openPlans}</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block tabular-nums">
            {plans.filter(p => ['in_progress', 'needs_follow_up'].includes(p.status)).length}
          </span>
          <span className="text-[10px] text-slate-400">{isEn ? 'Active & In Progress' : 'قيد المتابعة والإجراء'}</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <span className="text-slate-400 block text-[11px]">{t.dashboard.teachersVisited}</span>
          <span className="text-2xl font-black text-[#172C40] mt-1 block tabular-nums">
            {new Set(filteredVisits.map(v => v.teacherJobNumber)).size}
          </span>
          <span className="text-[10px] text-slate-400">{isEn ? `of ${teachers.length} teachers` : `من أصل ${teachers.length} معلماً`}</span>
        </div>
      </div>

      {/* Analytics Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visits by Subject */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#172C40] font-['Tajawal'] pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>{isEn ? 'Observations by Subject' : 'مؤشرات الزيارات حسب المادة الدراسية'}</span>
            <span className="text-[10px] text-slate-400">{isEn ? 'Avg Achievement %' : 'متوسط نسبة الإنجاز'}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className={`w-full ${isEn ? 'text-left' : 'text-right'} border-collapse text-[11px]`}>
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="p-2">{t.visits.subject}</th>
                  <th className="p-2 text-center">{isEn ? 'Visits' : 'عدد الزيارات'}</th>
                  <th className="p-2 text-center">{t.dashboard.tableAchievement}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(bySubject).map(([sub, data]) => (
                  <tr key={sub} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-[#172C40]">{sub}</td>
                    <td className="p-2 text-center font-mono">{data.count}</td>
                    <td className="p-2 text-center font-bold text-[#172C40] font-mono">{data.avgPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visits by Evaluator */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#172C40] font-['Tajawal'] pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>{isEn ? 'Evaluator & Observer Statistics' : 'إحصاءات المقيمين والزوار'}</span>
            <span className="text-[10px] text-slate-400">{isEn ? 'Full vs Quick' : 'كاملة وسريعة'}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className={`w-full ${isEn ? 'text-left' : 'text-right'} border-collapse text-[11px]`}>
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="p-2">{t.dashboard.tableEvaluator}</th>
                  <th className="p-2 text-center">{t.dashboard.full}</th>
                  <th className="p-2 text-center">{t.dashboard.quick}</th>
                  <th className="p-2 text-center">{isEn ? 'Total' : 'المجموع'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(byEvaluator).map(([evName, stats]) => (
                  <tr key={evName} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-[#172C40]">{evName}</td>
                    <td className="p-2 text-center font-mono">{stats.full}</td>
                    <td className="p-2 text-center font-mono">{stats.quick}</td>
                    <td className="p-2 text-center font-bold text-[#172C40] font-mono">{stats.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Top Achieved vs Needing Improvement Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm text-emerald-950 font-['Tajawal']">
              {t.dashboard.topAchieved}
            </h3>
          </div>
          <div className="space-y-2">
            {sortedAchieved.map((stat, i) => (
              <div key={i} className="p-2.5 bg-white rounded-lg border border-emerald-200 flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-800 pr-2">{stat.text}</span>
                <span className="font-bold text-emerald-800 shrink-0 font-mono">
                  {stat.yes} {isEn ? 'achieved' : 'تحقق'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-amber-50/40 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-sm text-amber-950 font-['Tajawal']">
              {t.dashboard.topNeedingImprovement}
            </h3>
          </div>
          <div className="space-y-2">
            {sortedNeedsImp.map((stat, i) => (
              <div key={i} className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-800 pr-2">{stat.text}</span>
                <span className="font-bold text-amber-800 shrink-0 font-mono">
                  {stat.needsImp + stat.no} {isEn ? 'growth instances' : 'تكرار حاجة'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
