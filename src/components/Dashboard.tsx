import React from 'react';
import { User, ClassroomVisit, Teacher, ImprovementPlan } from '../types';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  FileCheck2, 
  PlusCircle, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  BarChart3,
  ChevronRight,
  ArrowRight,
  School,
  FileText
} from 'lucide-react';
import { OFFICIAL_INDICATORS } from '../data/defaultData';
import { translations, Language } from '../i18n/translations';
import { AtharStorageService } from '../services/storageService';
import { translateSubject, translateGrade, translateSection, translateIndicatorText } from '../utils/bilingualHelper';

interface DashboardProps {
  currentUser: User;
  visits: ClassroomVisit[];
  teachers: Teacher[];
  plans: ImprovementPlan[];
  onNavigate: (tab: string, param?: any) => void;
  onOpenVisitReport: (visit: ClassroomVisit) => void;
  language?: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  visits,
  teachers,
  plans,
  onNavigate,
  onOpenVisitReport,
  language = 'ar'
}) => {
  const t = translations[language];
  const isEn = language === 'en';
  const isTeacher = currentUser.role === 'teacher';

  // Filter visits for current user if teacher
  const visibleVisits = isTeacher 
    ? visits.filter(v => v.teacherJobNumber === currentUser.jobNumber || v.teacherName === currentUser.name)
    : visits;

  const visiblePlans = isTeacher
    ? plans.filter(p => p.teacherJobNumber === currentUser.jobNumber || p.teacherName === currentUser.name)
    : plans;

  // Key KPI Calculations
  const totalVisitsCount = visibleVisits.length;
  const completedVisitsCount = visibleVisits.filter(v => ['completed', 'approved'].includes(v.status)).length;
  const inProgressVisitsCount = visibleVisits.filter(v => ['draft', 'in_progress'].includes(v.status)).length;
  
  const visitedTeacherIds = new Set(visibleVisits.map(v => v.teacherJobNumber));
  const visitedTeachersCount = isTeacher ? 1 : visitedTeacherIds.size;
  const teacherCoveragePct = teachers.length > 0 
    ? Math.round((visitedTeachersCount / teachers.length) * 100) 
    : 0;

  const openPlansCount = visiblePlans.filter(p => ['not_started', 'in_progress', 'needs_follow_up'].includes(p.status)).length;
  const completedPlansCount = visiblePlans.filter(p => p.status === 'completed').length;

  const fullVisitsCount = visibleVisits.filter(v => v.visitType === 'full').length;
  const quickVisitsCount = visibleVisits.filter(v => v.visitType === 'quick').length;

  // Overall Achievement Average
  const averageAchievement = totalVisitsCount > 0
    ? Math.round(visibleVisits.reduce((acc, v) => acc + (v.achievementPercentage || 0), 0) / totalVisitsCount)
    : 0;

  // Performance levels count across visits
  const performanceCounts: Record<string, number> = {
    'متميز': 0,
    'جيد جدًا': 0,
    'جيد': 0,
    'مقبول': 0,
    'ضعيف': 0
  };

  visibleVisits.forEach(v => {
    if (v.achievementPercentage >= 95) performanceCounts['متميز']++;
    else if (v.achievementPercentage >= 85) performanceCounts['جيد جدًا']++;
    else if (v.achievementPercentage >= 75) performanceCounts['جيد']++;
    else if (v.achievementPercentage >= 65) performanceCounts['مقبول']++;
    else performanceCounts['ضعيف']++;
  });

  // Calculate stats for the 5 official domains
  const DOMAIN_GROUPS = [
    { key: 'التخطيط والاستعداد', labelEn: 'Planning & Prep', icon: BookOpen },
    { key: 'المشاركة والتفاعل', labelEn: 'Engagement & Active Learning', icon: Users },
    { key: 'الممارسات التدريسية', labelEn: 'Teaching Practices', icon: Award },
    { key: 'بيئة التعلم', labelEn: 'Learning Environment', icon: School },
    { key: 'الربط والتكامل', labelEn: 'Curricular Integration', icon: Layers }
  ];

  const domainScores = DOMAIN_GROUPS.map(d => {
    const domainIndicators = OFFICIAL_INDICATORS.filter(ind => ind.group === d.key).map(ind => ind.id);
    let totalRatings = 0;
    let positiveRatings = 0;

    visibleVisits.forEach(v => {
      v.indicators.forEach(res => {
        if (domainIndicators.includes(res.indicatorId)) {
          if (res.rating === 'yes') {
            positiveRatings++;
            totalRatings++;
          } else if (res.rating === 'needs_improvement' || res.rating === 'no') {
            totalRatings++;
          }
        }
      });
    });

    const pct = totalRatings > 0 ? Math.round((positiveRatings / totalRatings) * 100) : 85;
    return {
      ...d,
      pct,
      totalRatings
    };
  });

  // Indicator Strengths & Needs
  const indicatorStats: Record<number, { id: number; yes: number; needsImprovement: number; no: number; text: string; code: string }> = {};
  OFFICIAL_INDICATORS.forEach(ind => {
    indicatorStats[ind.id] = { id: ind.id, yes: 0, needsImprovement: 0, no: 0, text: ind.text, code: ind.code };
  });

  visibleVisits.forEach(v => {
    v.indicators.forEach(res => {
      if (!indicatorStats[res.indicatorId]) {
        indicatorStats[res.indicatorId] = { id: res.indicatorId, yes: 0, needsImprovement: 0, no: 0, text: res.indicatorText, code: 'IND' };
      }
      if (res.rating === 'yes') indicatorStats[res.indicatorId].yes++;
      else if (res.rating === 'needs_improvement') indicatorStats[res.indicatorId].needsImprovement++;
      else if (res.rating === 'no') indicatorStats[res.indicatorId].no++;
    });
  });

  const sortedAchieved = Object.values(indicatorStats)
    .filter(stat => (stat.yes + stat.needsImprovement + stat.no) > 0)
    .sort((a, b) => b.yes - a.yes)
    .slice(0, 3);

  const sortedNeedingImprovement = Object.values(indicatorStats)
    .filter(stat => stat.needsImprovement > 0 || stat.no > 0)
    .sort((a, b) => (b.needsImprovement + b.no) - (a.needsImprovement + a.no))
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ============================================================== */}
      {/* 1. EXECUTIVE HERO BANNER WITH UAE INSTITUTIONAL GRANDEUR        */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#172C40] via-[#102334] to-[#0A1622] text-white border-2 border-[#C6A66A]/40 shadow-xl p-6 sm:p-8">
        
        {/* Subtle Decorative Gold Geometry / Ambient Lattice Pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#C6A66A_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#C6A66A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-96 h-96 bg-[#668575]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left Column: Greeting, Role Badge & School Motto */}
          <div className="space-y-3 max-w-2xl">
            
            {/* Top Badges Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#C6A66A]/20 border border-[#C6A66A]/40 text-[#C6A66A] font-bold tracking-wide">
                {isEn ? 'Academic Year 2026 - 2027' : 'العام الدراسي 2026 - 2027'}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-white/80 font-medium">
                {isEn ? 'Cycle 2 Boys · UAE MOE' : 'مدرسة الصدارة بنين - الحلقة الثانية'}
              </span>
            </div>

            {/* Main Greeting - As Requested by User */}
            <div className="space-y-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-['Tajawal'] text-white tracking-tight leading-snug">
                {isEn ? (
                  <>
                    Welcome to <span className="text-[#C6A66A]">«ATHAR»</span> Platform, the advanced digital gateway for qualitative classroom observation and sustainable professional development for faculty, in alignment with the highest standards of institutional quality and excellence.
                  </>
                ) : (
                  <>
                    مرحباً بكم في منصة <span className="text-[#C6A66A]">«أَثَر»</span>، البوابة الرقمية المتطورة للرصد النوعي للممارسات التدريسية الصفية، وتحفيز التطوير المهني المستدام لمعلمي المدرسة وفق أعلى معايير الجودة والتميز المؤسسي.
                  </>
                )}
              </h1>
              
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-white/80">
                <span className="text-[#C6A66A] font-bold">
                  {isEn ? 'Signed in as: ' : 'المستخدم المسجل: '}
                  <span className="text-white">{currentUser.name}</span>
                </span>
                <span className="text-white/40">·</span>
                <span className="font-semibold text-[#668575] bg-white/10 px-2.5 py-0.5 rounded">
                  {isEn ? (translations.en.roles[currentUser.role] || currentUser.role) : AtharStorageService.getRoleLabel(currentUser.role)}
                </span>
                <span className="text-white/40">·</span>
                <span className="text-white/70">
                  {isTeacher 
                    ? (isEn ? 'Teacher Professional Growth & Feedback Portal' : 'بوابة المعلم لرصد النمو المهني والأثر التعليمي') 
                    : (isEn ? 'Classroom Observation & Pedagogical Excellence Suite' : 'منظومة رصد الزيارات الصفية والتميز التعليمي')}
                </span>
              </div>
            </div>

            {/* Institutional Motto Callout */}
            <div className="pt-2 flex items-center gap-3 text-sm text-[#C6A66A] font-['Tajawal'] font-bold">
              <Sparkles className="w-4 h-4 text-[#C6A66A] shrink-0" />
              <span>{isEn ? '«We Monitor Performance... And We Craft The Impact»' : '«نَرْصُدُ الأَدَاءَ... وَنَصْنَعُ الأَثَرَ»'}</span>
            </div>

          </div>

          {/* Right Column: High-Intent Action Cluster */}
          {!isTeacher && (
            <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => onNavigate('new-visit')}
                className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-[#C6A66A] to-[#b89556] hover:from-[#d4b478] hover:to-[#c6a66a] text-[#172C40] text-sm font-extrabold rounded-xl transition-all shadow-lg hover:shadow-[#C6A66A]/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <PlusCircle className="w-4 h-4 text-[#172C40]" />
                <span>{isEn ? 'Start New Observation' : 'بدء زيارة صفية جديدة'}</span>
              </button>

              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => onNavigate('teachers')}
                  className="flex-1 px-3 py-2 bg-[#C6A66A]/20 hover:bg-[#C6A66A]/30 border border-[#C6A66A]/50 text-[#C6A66A] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title={isEn ? 'Add or view teachers' : 'إضافة أو استعراض المعلمين'}
                >
                  <Users className="w-3.5 h-3.5 text-[#C6A66A]" />
                  <span>{isEn ? '+ Add / View Teachers' : '+ إضافة / دليل المعلمين'}</span>
                </button>

                <button
                  onClick={() => onNavigate('reports')}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-white/80" />
                  <span>{isEn ? 'Reports' : 'التقارير'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ============================================================== */}
      {/* 2. REFINED KPI METRIC CARDS                                     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Observations */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-[#C6A66A] p-5 shadow-xs transition-all hover:shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">{isEn ? 'Total Classroom Visits' : 'إجمالي الزيارات الصفية'}</span>
            <div className="w-9 h-9 rounded-lg bg-[#172C40]/10 flex items-center justify-center text-[#172C40]">
              <FileCheck2 className="w-5 h-5 text-[#172C40]" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#172C40] tabular-nums tracking-tight">
            {totalVisitsCount}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{fullVisitsCount} {isEn ? 'Full Lessons' : 'زيارة كاملة'}</span>
            <span className="text-slate-300">·</span>
            <span>{quickVisitsCount} {isEn ? 'Quick (15m)' : 'زيارة سريعة'}</span>
          </div>
        </div>

        {/* KPI 2: Teacher Coverage Rate */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-[#668575] p-5 shadow-xs transition-all hover:shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">{isEn ? 'Faculty Coverage Rate' : 'معدل تغطية المعلمين'}</span>
            <div className="w-9 h-9 rounded-lg bg-[#668575]/15 flex items-center justify-center text-[#668575]">
              <Users className="w-5 h-5 text-[#668575]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#668575] tabular-nums tracking-tight">
              {teacherCoveragePct}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({visitedTeachersCount} {isEn ? 'of' : 'من'} {teachers.length})
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#668575] h-full rounded-full transition-all duration-700" 
              style={{ width: `${teacherCoveragePct}%` }}
            />
          </div>
        </div>

        {/* KPI 3: General Pedagogical Quality Index */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-[#C6A66A] p-5 shadow-xs transition-all hover:shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">{isEn ? 'General Quality Index' : 'مؤشر جودة الأداء العام'}</span>
            <div className="w-9 h-9 rounded-lg bg-[#C6A66A]/20 flex items-center justify-center text-[#9c7e3f]">
              <Award className="w-5 h-5 text-[#C6A66A]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#172C40] tabular-nums tracking-tight">
              {averageAchievement}%
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
              averageAchievement >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-[#F2EBDD] text-[#172C40]'
            }`}>
              {averageAchievement >= 90 ? (isEn ? 'Outstanding' : 'متميز') : averageAchievement >= 80 ? (isEn ? 'Very Good' : 'جيد جداً') : (isEn ? 'Good' : 'جيد')}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#668575]" />
            <span>{isEn ? '+3.4% vs previous semester' : '+3.4% نمو مقارنة بالفصل السابق'}</span>
          </div>
        </div>

        {/* KPI 4: Active Professional Growth Plans */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 p-5 shadow-xs transition-all hover:shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">{isEn ? 'Growth Plans Active' : 'خطط التطوير المهني'}</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 tabular-nums tracking-tight">
              {openPlansCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {isEn ? 'plans in progress' : 'خطة قيد المتابعة'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>{completedPlansCount} {isEn ? 'completed' : 'خطة منجزة'}</span>
            <span className="text-[#668575] font-bold text-[11px]">{isEn ? 'Tracked' : 'تم التحقق'}</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. THE 5 STRATEGIC PEDAGOGICAL EVALUATION DOMAINS              */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#172C40] flex items-center justify-center text-[#C6A66A]">
              <Layers className="w-5 h-5 text-[#C6A66A]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
                {isEn ? 'The 5 Core Pedagogical Observation Domains' : 'خريطة مجالات الممارسات التدريسية الخمسة'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? 'Evaluating the 22 ministerial indicators across essential classroom domains' : 'قياس مؤشرات الأداء الـ 22 عبر المجالات التدريسية والإدارية المعتمدة'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-[#F2EBDD] text-[#172C40] rounded-lg">
            {isEn ? 'Official Matrix' : 'المصفوفة المعتمدة'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {domainScores.map((domain, index) => {
            const Icon = domain.icon;
            return (
              <div 
                key={domain.key} 
                className="p-4 rounded-xl border border-slate-200 hover:border-[#172C40] bg-slate-50/50 hover:bg-white transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#172C40]/10 flex items-center justify-center text-[#172C40]">
                    <Icon className="w-4 h-4 text-[#172C40]" />
                  </div>
                  <span className="text-base font-black text-[#172C40] tabular-nums">
                    {domain.pct}%
                  </span>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-[#172C40] line-clamp-1">
                    {isEn ? domain.labelEn : domain.key}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isEn ? 'Domain ' + (index + 1) : `المجال رقم ${index + 1}`}
                  </p>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      domain.pct >= 90 ? 'bg-[#668575]' : domain.pct >= 80 ? 'bg-[#C6A66A]' : 'bg-[#172C40]'
                    }`}
                    style={{ width: `${domain.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. PERFORMANCE SPECTRUM BREAKDOWN & TERM VISITS                */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Performance Distribution Spectrum (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
                {isEn ? 'Performance Level Distribution Spectrum' : 'مخطط توزيع مستويات الأداء في الزيارات'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? 'Based on indicator attainment excluding unobserved items' : 'محسوبة بناءً على نسبة الإنجاز واستبعاد المؤشرات غير المشاهدة'}
              </p>
            </div>
            <span className="text-xs font-bold text-[#668575] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              {totalVisitsCount} {isEn ? 'Observations' : 'زيارة مرصودة'}
            </span>
          </div>

          {/* Stacked Visual Bar */}
          <div className="my-4">
            <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
              {Object.entries(performanceCounts).map(([level, count]) => {
                const total = totalVisitsCount || 1;
                const pct = (count / total) * 100;
                if (pct === 0) return null;
                const color = level === 'متميز' 
                  ? 'bg-[#172C40]' 
                  : level === 'جيد جدًا' 
                  ? 'bg-[#668575]' 
                  : level === 'جيد' 
                  ? 'bg-[#C6A66A]' 
                  : level === 'مقبول' 
                  ? 'bg-amber-400' 
                  : 'bg-rose-400';
                return (
                  <div 
                    key={level} 
                    className={`${color} h-full transition-all`} 
                    style={{ width: `${pct}%` }} 
                    title={`${level}: ${count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Level Rows */}
          <div className="space-y-2.5 pt-2">
            {Object.entries(performanceCounts).map(([level, count]) => {
              const total = totalVisitsCount || 1;
              const pct = Math.round((count / total) * 100);
              const colorDot = level === 'متميز' 
                ? 'bg-[#172C40]' 
                : level === 'جيد جدًا' 
                ? 'bg-[#668575]' 
                : level === 'جيد' 
                ? 'bg-[#C6A66A]' 
                : level === 'مقبول' 
                ? 'bg-amber-400' 
                : 'bg-rose-400';

              return (
                <div key={level} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colorDot}`} />
                    <span className="font-bold text-[#172C40]">{level}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 tabular-nums">{count} {isEn ? 'visits' : 'زيارة'}</span>
                    <span className="font-mono font-bold text-slate-700 w-12 text-end tabular-nums">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Term Breakdown & Visit Types (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
                {isEn ? 'Term & Modality Matrix' : 'الزيارات حسب الفصول ونوع الزيارة'}
              </h3>
              <span className="text-xs font-bold text-[#C6A66A] bg-[#172C40] px-2.5 py-0.5 rounded">
                2026 - 2027
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC]">
                <span className="text-[11px] text-slate-500 block font-semibold">{isEn ? 'Full Class (45m)' : 'الزيارات الكاملة'}</span>
                <span className="text-2xl font-black text-[#172C40] block mt-1 tabular-nums">{fullVisitsCount}</span>
                <span className="text-[10px] text-slate-400">{isEn ? 'Complete 22 Rubric' : 'المؤشرات الـ 22 كاملة'}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC]">
                <span className="text-[11px] text-slate-500 block font-semibold">{isEn ? 'Quick Drop-in (15m)' : 'الزيارات السريعة'}</span>
                <span className="text-2xl font-black text-[#C6A66A] block mt-1 tabular-nums">{quickVisitsCount}</span>
                <span className="text-[10px] text-slate-400">{isEn ? 'Targeted Objectives' : 'تركيز على أهداف محددة'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <span className="text-xs font-bold text-[#172C40] block">
              {isEn ? 'Distribution Across Academic Terms:' : 'توزيع الزيارات حسب الفصول:'}
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">{isEn ? 'Term 1' : 'الفصل الأول'}</span>
                <span className="font-bold text-[#172C40] text-sm tabular-nums">
                  {visibleVisits.filter(v => v.term.includes('الأول')).length}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#F2EBDD]/60 border border-[#C6A66A]/50">
                <span className="text-[10px] text-[#172C40] font-bold block">{isEn ? 'Term 2 (Active)' : 'الفصل الثاني (الحالي)'}</span>
                <span className="font-bold text-[#172C40] text-sm tabular-nums">
                  {visibleVisits.filter(v => v.term.includes('الثاني')).length}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">{isEn ? 'Term 3' : 'الفصل الثالث'}</span>
                <span className="font-bold text-[#172C40] text-sm tabular-nums">
                  {visibleVisits.filter(v => v.term.includes('الثالث')).length}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 5. STRENGTHS VS GROWTH OPPORTUNITIES                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Key Strengths */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
                {isEn ? 'Institutional Strengths in Evidence' : 'أبرز نقاط التميز والقوة التدريسية بالمدرسة'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? 'Highest achieving indicators recorded across observations' : 'المؤشرات الأكثر تحققاً وإتقاناً في الزيارات الصفية'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {sortedAchieved.length > 0 ? (
              sortedAchieved.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-semibold text-[#172C40] leading-relaxed">
                      {translateIndicatorText(item.id, item.text, language)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0 tabular-nums">
                    {item.yes} {isEn ? 'achieved' : 'تحقق كامل'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                {isEn ? 'No observation data recorded yet.' : 'لا توجد بيانات كافية مسجلة بعد.'}
              </p>
            )}
          </div>
        </div>

        {/* Priority Focus for Growth */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
                {isEn ? 'Targeted Priorities for Professional Development' : 'المجالات التدريسية ذات الأولوية في التطوير والتدريب'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? 'Indicators requiring instructional coaching or workshops' : 'المؤشرات التي تتطلب ورش عمل وجلسات معايشة تخصصية'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {sortedNeedingImprovement.length > 0 ? (
              sortedNeedingImprovement.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-50/40 border border-amber-200 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-semibold text-[#172C40] leading-relaxed">
                      {translateIndicatorText(item.id, item.text, language)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200 shrink-0 tabular-nums">
                    {item.needsImprovement + item.no} {isEn ? 'coaching needs' : 'رصد تطويري'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                {isEn ? 'All recorded indicators demonstrate high compliance.' : 'جميع المؤشرات المرصودة تحقق مستويات إيجابية ممتازة.'}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 6. STREAM: RECENT OBSERVATIONS STREAM                          */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#172C40]/10 flex items-center justify-center text-[#172C40]">
              <FileCheck2 className="w-5 h-5 text-[#172C40]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
                {isEn ? 'Recent Classroom Observations Stream' : 'أحدث الزيارات الصفية المنفذة'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? 'Direct access to official observation reports, rubrics, and action plans' : 'انقر على أي زيارة للاطلاع على التقرير الرسمي المعتمد'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('visits')}
            className="text-xs font-bold text-[#172C40] hover:text-[#C6A66A] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{isEn ? 'View All Visits' : 'عرض كافة الزيارات'}</span>
            <ChevronRight className={`w-4 h-4 ${isEn ? '' : 'rotate-180'}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-3 px-4">{isEn ? 'Visit ID' : 'رقم الزيارة'}</th>
                <th className="py-3 px-4">{isEn ? 'Teacher' : 'المعلم'}</th>
                <th className="py-3 px-4">{isEn ? 'Subject / Class' : 'المادة / الصف'}</th>
                <th className="py-3 px-4">{isEn ? 'Evaluator' : 'المقيّم'}</th>
                <th className="py-3 px-4">{isEn ? 'Modality' : 'نوع الزيارة'}</th>
                <th className="py-3 px-4">{isEn ? 'Attainment' : 'نسبة الإنجاز'}</th>
                <th className="py-3 px-4">{isEn ? 'Status' : 'الحالة'}</th>
                <th className="py-3 px-4 text-center">{isEn ? 'Action' : 'الإجراء'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleVisits.slice(0, 6).map((visit) => (
                <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#172C40]">
                    {visit.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#172C40]">{visit.teacherName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{visit.teacherJobNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{translateSubject(visit.subject, language)}</div>
                    <div className="text-[10px] text-slate-400">{translateGrade(visit.grade, language)} - {translateSection(visit.section, language)}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {visit.evaluatorName}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                      visit.visitType === 'full' ? 'bg-[#172C40]/10 text-[#172C40]' : 'bg-[#C6A66A]/20 text-[#856526]'
                    }`}>
                      {visit.visitType === 'full' ? (isEn ? 'Full Lesson' : 'كاملة') : (isEn ? 'Quick' : 'سريعة')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold tabular-nums">
                    <span className={visit.achievementPercentage >= 90 ? 'text-[#668575]' : visit.achievementPercentage >= 75 ? 'text-[#C6A66A]' : 'text-amber-600'}>
                      {visit.achievementPercentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      ({visit.observedIndicatorsCount} {isEn ? 'indicators' : 'مؤشراً'})
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {visit.status === 'approved' ? (isEn ? 'Approved' : 'معتمدة') : visit.status === 'completed' ? (isEn ? 'Completed' : 'مكتملة') : (isEn ? 'Draft' : 'مسودة')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onOpenVisitReport(visit)}
                      className="px-3 py-1 bg-[#172C40] text-white rounded-lg text-[11px] font-bold hover:bg-[#C6A66A] hover:text-[#172C40] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isEn ? 'Report' : 'التقرير'}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
