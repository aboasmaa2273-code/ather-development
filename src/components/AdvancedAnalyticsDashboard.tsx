import React, { useMemo, useState } from 'react';
import { ClassroomVisit, Teacher, ImprovementPlan, AuditLogEntry, User } from '../types';
import { OFFICIAL_INDICATORS } from '../data/defaultData';
import { FileText, Users, ClipboardList, GraduationCap, ListChecks, ChartNoAxesCombined, Archive, History, Download, Search, CalendarDays, Filter, Eye, Printer, ShieldCheck, RotateCcw } from 'lucide-react';

type Section = 'overview' | 'evaluators' | 'visits' | 'teachers' | 'plans' | 'analytics' | 'archive' | 'audit';
interface Props {
  currentUser: User;
  visits: ClassroomVisit[];
  teachers: Teacher[];
  plans: ImprovementPlan[];
  auditLogs: AuditLogEntry[];
  onOpenVisitReport: (visit: ClassroomVisit) => void;
}
const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'الملخص العام', icon: ChartNoAxesCombined },
  { id: 'evaluators', label: 'أداء المقيمين', icon: Users },
  { id: 'visits', label: 'سجل الزيارات', icon: ClipboardList },
  { id: 'teachers', label: 'ملفات المعلمين', icon: GraduationCap },
  { id: 'plans', label: 'خطط التحسين', icon: ListChecks },
  { id: 'analytics', label: 'التحليلات', icon: ChartNoAxesCombined },
  { id: 'archive', label: 'الأرشيف والاسترجاع', icon: Archive },
  { id: 'audit', label: 'سجل النشاط والتدقيق', icon: History }
];
const dateValue = (value: string) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value.slice(0, 10) : d.toISOString().slice(0, 10);
};
const esc = (v: unknown) => '"' + String(v ?? '').replace(/"/g, '""') + '"';

export const AdvancedAnalyticsDashboard: React.FC<Props> = ({ currentUser, visits, teachers, plans, auditLogs, onOpenVisitReport }) => {
  const isLeader = ['school_admin', 'platform_admin', 'vice_principal'].includes(currentUser.role);
  const [section, setSection] = useState<Section>('overview');
  const [evaluator, setEvaluator] = useState('ALL');
  const [teacherId, setTeacherId] = useState('ALL');
  const [visitType, setVisitType] = useState('ALL');
  const [term, setTerm] = useState('ALL');
  const [subject, setSubject] = useState('ALL');
  const [grade, setGrade] = useState('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [planStatus, setPlanStatus] = useState('ALL');

  const scopedVisits = useMemo(() => isLeader ? visits : visits.filter(v => v.evaluatorId === currentUser.id || v.evaluatorName === currentUser.name), [visits, isLeader, currentUser]);
  const filtered = useMemo(() => scopedVisits.filter(v => {
    const d = dateValue(v.date);
    return (evaluator === 'ALL' || v.evaluatorName === evaluator) &&
      (teacherId === 'ALL' || v.teacherId === teacherId || v.teacherJobNumber === teacherId) &&
      (visitType === 'ALL' || v.visitType === visitType) &&
      (term === 'ALL' || v.term === term) &&
      (subject === 'ALL' || v.subject === subject) &&
      (grade === 'ALL' || v.grade === grade) &&
      (!from || d >= from) && (!to || d <= to) &&
      (!search || [v.teacherName, v.teacherJobNumber, v.evaluatorName, v.id, v.subject].some(x => String(x || '').toLowerCase().includes(search.toLowerCase())));
  }), [scopedVisits, evaluator, teacherId, visitType, term, subject, grade, from, to, search]);
  const evaluatorNames = Array.from(new Set(scopedVisits.map(v => v.evaluatorName).filter(Boolean))).sort();
  const subjects = Array.from(new Set(scopedVisits.map(v => v.subject).filter(Boolean))).sort();
  const grades = Array.from(new Set(scopedVisits.map(v => v.grade).filter(Boolean))).sort();
  const terms = Array.from(new Set(scopedVisits.map(v => v.term).filter(Boolean))).sort();
  const activeTeachers = Array.from(new Map(scopedVisits.map(v => [v.teacherId || v.teacherJobNumber, { id: v.teacherId || v.teacherJobNumber, name: v.teacherName, job: v.teacherJobNumber }])).values());
  const full = filtered.filter(v => v.visitType === 'full').length;
  const quick = filtered.filter(v => v.visitType === 'quick').length;
  const completed = filtered.filter(v => ['completed', 'approved'].includes(v.status)).length;
  const uniqueTeachers = new Set(filtered.map(v => v.teacherJobNumber || v.teacherId)).size;
  const visiblePlans = plans.filter(p => isLeader || p.teacherJobNumber === currentUser.jobNumber || p.teacherName === currentUser.name);
  const visibleAuditLogs = auditLogs.filter(log => isLeader || log.userName === currentUser.name);
  const filteredPlans = visiblePlans.filter(p => (planStatus === 'ALL' || p.status === planStatus) && (!search || [p.teacherName, p.improvementArea, p.relatedIndicatorText].some(x => String(x || '').toLowerCase().includes(search.toLowerCase()))));
  const resetFilters = () => { setEvaluator('ALL'); setTeacherId('ALL'); setVisitType('ALL'); setTerm('ALL'); setSubject('ALL'); setGrade('ALL'); setFrom(''); setTo(''); setSearch(''); setPlanStatus('ALL'); };
  const exportCsv = (rows: ClassroomVisit[]) => {
    const headers = ['رقم الزيارة','التاريخ','المقيم','المعلم','الرقم الوظيفي','نوع الزيارة','المادة','الصف','الشعبة','الفصل الدراسي','نسبة الإنجاز','الحالة'];
    const body = rows.map(v => [v.id,v.date,v.evaluatorName,v.teacherName,v.teacherJobNumber,v.visitType === 'full' ? 'رسمية' : 'سريعة',v.subject,v.grade,v.section,v.term,v.achievementPercentage,v.status]);
    const blob = new Blob(['\uFEFF' + [headers, ...body].map(row => row.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'athar-visits-' + new Date().toISOString().slice(0,10) + '.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const card = (label: string, value: number | string, hint: string, Icon: React.ElementType) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between"><span className="text-xs text-slate-500 font-bold">{label}</span><Icon className="w-5 h-5 text-[#C6A66A]" /></div>
      <div className="text-2xl font-black text-[#172C40] mt-2 tabular-nums">{value}</div>
      <div className="text-[10px] text-slate-400 mt-1">{hint}</div>
    </div>
  );
  const tableHead = ['التاريخ','المقيم','المعلم','النوع','المادة','الصف / الشعبة','الإنجاز','التقرير'];
  const visitTable = (rows: ClassroomVisit[]) => (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <table className="w-full text-right text-xs min-w-[850px]">
        <thead className="bg-[#172C40] text-white"><tr>{tableHead.map(h => <th key={h} className="p-3 font-bold">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.map(v => <tr key={v.id} className="hover:bg-slate-50">
          <td className="p-3 whitespace-nowrap">{v.date}</td><td className="p-3">{v.evaluatorName}</td><td className="p-3 font-bold">{v.teacherName}<div className="text-[10px] text-slate-400">{v.teacherJobNumber}</div></td>
          <td className="p-3">{v.visitType === 'full' ? 'رسمية' : 'سريعة'}</td><td className="p-3">{v.subject}</td><td className="p-3">{v.grade} / {v.section}</td><td className="p-3 font-bold">{v.achievementPercentage}%</td>
          <td className="p-3"><button onClick={() => onOpenVisitReport(v)} className="inline-flex items-center gap-1 rounded-lg bg-[#F2EBDD] px-3 py-2 font-bold text-[#172C40] hover:bg-[#e6d8bd]"><Eye className="w-3.5 h-3.5"/>عرض</button></td>
        </tr>)}</tbody>
      </table>
      {rows.length === 0 && <div className="p-8 text-center text-slate-400">لا توجد سجلات تطابق معايير البحث الحالية.</div>}
    </div>
  );
  const heading = sections.find(s => s.id === section)?.label || 'لوحة المتابعة';
  const monthBuckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    return { key, label: d.toLocaleDateString('ar-AE', { month: 'short', year: '2-digit' }), count: filtered.filter(v => dateValue(v.date).startsWith(key)).length };
  });
  const maxMonth = Math.max(1, ...monthBuckets.map(x => x.count));
  const selectedTeacher = teacherId === 'ALL' ? null : activeTeachers.find(t => t.id === teacherId);
  const selectedTeacherVisits = selectedTeacher ? scopedVisits.filter(v => v.teacherId === selectedTeacher.id || v.teacherJobNumber === selectedTeacher.job) : [];
  const selectedTeacherPlans = selectedTeacher ? visiblePlans.filter(p => p.teacherJobNumber === selectedTeacher.job || p.teacherName === selectedTeacher.name) : [];

  return <div className="space-y-5 animate-in fade-in duration-300" dir="rtl">
    <div className="rounded-2xl bg-gradient-to-l from-[#172C40] to-[#263f55] text-white p-6 shadow-lg border-b-4 border-[#C6A66A]">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[#C6A66A] text-xs font-bold mb-2">أَثَر | منظومة التميز والتطوير التعليمي</div><h1 className="text-2xl font-black">لوحة متابعة الزيارات والتقييمات</h1><p className="text-white/70 text-xs mt-2">رؤية إدارية متكاملة للزيارات الصفية، وأداء المقيمين، وتطور المعلمين، وخطط التحسين.</p></div><div className="text-xs bg-white/10 border border-white/15 rounded-lg px-3 py-2">نطاق العرض: {isLeader ? 'جميع سجلات المدرسة' : 'سجلات زياراتك فقط'}</div></div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{sections.map(s => { const Icon=s.icon; return <button key={s.id} onClick={() => setSection(s.id)} className={'flex items-center gap-2 rounded-xl border p-3 text-right text-xs font-bold transition-all ' + (section===s.id ? 'bg-[#172C40] text-white border-[#C6A66A] shadow-md' : 'bg-white text-[#172C40] border-slate-200 hover:border-[#C6A66A]')}><Icon className="w-4 h-4 text-[#C6A66A]"/>{s.label}</button>; })}</div>
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 font-black text-sm"><Filter className="w-4 h-4 text-[#C6A66A]"/> تصفية السجلات</div><button onClick={resetFilters} className="text-xs text-slate-500 hover:text-[#172C40] flex items-center gap-1"><RotateCcw className="w-3 h-3"/>مسح التصفيات</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="text-[11px] font-bold text-slate-600">المقيم<select value={evaluator} onChange={e=>setEvaluator(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 bg-slate-50"><option value="ALL">جميع المقيمين</option>{evaluatorNames.map(n=><option key={n}>{n}</option>)}</select></label>
        <label className="text-[11px] font-bold text-slate-600">المعلم<select value={teacherId} onChange={e=>setTeacherId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 bg-slate-50"><option value="ALL">جميع المعلمين</option>{activeTeachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label className="text-[11px] font-bold text-slate-600">نوع الزيارة<select value={visitType} onChange={e=>setVisitType(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 bg-slate-50"><option value="ALL">جميع الأنواع</option><option value="full">زيارة رسمية / حصة كاملة</option><option value="quick">زيارة سريعة</option></select></label>
        <label className="text-[11px] font-bold text-slate-600">الفصل الدراسي<select value={term} onChange={e=>setTerm(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 bg-slate-50"><option value="ALL">جميع الفصول</option>{terms.map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="text-[11px] font-bold text-slate-600">المادة<select value={subject} onChange={e=>setSubject(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 bg-slate-50"><option value="ALL">جميع المواد</option>{subjects.map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="text-[11px] font-bold text-slate-600">الصف<select value={grade} onChange={e=>setGrade(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 bg-slate-50"><option value="ALL">جميع الصفوف</option>{grades.map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="text-[11px] font-bold text-slate-600">من تاريخ<input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 bg-slate-50"/></label>
        <label className="text-[11px] font-bold text-slate-600">إلى تاريخ<input type="date" value={to} onChange={e=>setTo(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 bg-slate-50"/></label>
      </div>
      <div className="flex flex-wrap gap-2"><div className="relative flex-1 min-w-[220px]"><Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث برقم الزيارة أو اسم المعلم أو المقيم أو المادة..." className="w-full rounded-lg border border-slate-200 py-2 pr-9 pl-3 text-xs"/></div><button onClick={()=>exportCsv(filtered)} className="rounded-lg bg-[#172C40] text-white px-4 py-2 text-xs font-bold flex items-center gap-2"><Download className="w-4 h-4 text-[#C6A66A]"/>تصدير نتائج البحث Excel/CSV</button></div>
    </div>
    <div className="flex items-center justify-between"><h2 className="font-black text-lg text-[#172C40]">{heading}</h2><span className="text-xs text-slate-500">عدد السجلات المطابقة: {filtered.length}</span></div>
    {section === 'overview' && <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{card('إجمالي الزيارات',filtered.length,'وفق التصفيات الحالية',ClipboardList)}{card('الزيارات الرسمية',full,'حصة كاملة',FileText)}{card('الزيارات السريعة',quick,'زيارات مركزة',CalendarDays)}{card('المعلمون الذين تمت زيارتهم',uniqueTeachers,'دون احتساب التكرار',GraduationCap)}{card('الزيارات المكتملة / المعتمدة',completed,'من إجمالي النتائج',ShieldCheck)}{card('المقيمون النشطون',new Set(filtered.map(v=>v.evaluatorId || v.evaluatorName)).size,'سجلوا زيارة ضمن النتائج',Users)}{card('خطط التحسين',visiblePlans.length,'إجمالي الخطط المسجلة',ListChecks)}{card('خطط قيد المتابعة',visiblePlans.filter(p=>p.status==='in_progress'||p.status==='needs_follow_up').length,'تحتاج إلى استكمال',History)}</div>
      <div className="bg-white border border-slate-200 rounded-xl p-5"><h3 className="font-bold mb-4">حركة الزيارات خلال آخر ستة أشهر</h3><div className="grid grid-cols-6 gap-3 items-end h-36">{monthBuckets.map(m=><div key={m.key} className="h-full flex flex-col justify-end items-center gap-2"><span className="text-[10px] font-bold">{m.count}</span><div className="w-full max-w-12 rounded-t-md bg-[#C6A66A]" style={{height: (m.count/maxMonth*85)+'%'}}/><span className="text-[9px] text-slate-500">{m.label}</span></div>)}</div></div>
      {visitTable(filtered.slice(0,8))}
    </>}
    {section === 'evaluators' && <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto"><table className="w-full text-right text-xs min-w-[700px]"><thead className="bg-[#172C40] text-white"><tr>{['المقيم','إجمالي الزيارات','رسمية','سريعة','المعلمون','متوسط الإنجاز','آخر زيارة'].map(x=><th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody className="divide-y">{evaluatorNames.filter(n=>evaluator==='ALL'||n===evaluator).map(n=>{const rows=filtered.filter(v=>v.evaluatorName===n);return <tr key={n}><td className="p-3 font-bold">{n}</td><td className="p-3">{rows.length}</td><td className="p-3">{rows.filter(v=>v.visitType==='full').length}</td><td className="p-3">{rows.filter(v=>v.visitType==='quick').length}</td><td className="p-3">{new Set(rows.map(v=>v.teacherJobNumber)).size}</td><td className="p-3">{rows.length?Math.round(rows.reduce((a,v)=>a+v.achievementPercentage,0)/rows.length):0}%</td><td className="p-3">{rows[0]?.date||'—'}</td></tr>})}</tbody></table></div>}
    {section === 'visits' && visitTable(filtered)}
    {section === 'teachers' && <div className="space-y-3"><div className="bg-white border border-slate-200 rounded-xl p-4"><label className="text-xs font-bold">اختر المعلم لعرض ملفه التاريخي<select value={teacherId} onChange={e=>setTeacherId(e.target.value)} className="mt-2 w-full rounded-lg border p-2"><option value="ALL">اختر المعلم</option>{activeTeachers.map(t=><option value={t.id} key={t.id}>{t.name} — {t.job}</option>)}</select></label></div>{selectedTeacher ? <><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{card('إجمالي الزيارات',selectedTeacherVisits.length,'كل الزيارات المسجلة',ClipboardList)}{card('زيارات رسمية',selectedTeacherVisits.filter(v=>v.visitType==='full').length,'حصة كاملة',FileText)}{card('زيارات سريعة',selectedTeacherVisits.filter(v=>v.visitType==='quick').length,'زيارة مركزة',CalendarDays)}{card('خطط التحسين',selectedTeacherPlans.length,'الخطط المرتبطة بالمعلم',ListChecks)}</div><div className="bg-white border border-slate-200 rounded-xl p-4"><h3 className="font-bold mb-3">التطور التاريخي لمتوسط الإنجاز عبر الزيارات</h3><div className="space-y-2">{selectedTeacherVisits.slice().sort((a,b)=>dateValue(a.date).localeCompare(dateValue(b.date))).map(v=><div key={v.id} className="grid grid-cols-[100px_1fr_55px] items-center gap-3 text-xs"><span>{v.date}</span><div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-[#668575]" style={{width:Math.max(0,Math.min(100,v.achievementPercentage))+'%'}}/></div><b>{v.achievementPercentage}%</b></div>)}</div></div>{visitTable(selectedTeacherVisits.slice().sort((a,b)=>dateValue(b.date).localeCompare(dateValue(a.date))))}<div className="bg-white border border-slate-200 rounded-xl p-4"><h3 className="font-bold mb-3">خطط التحسين والمتابعة المرتبطة بالمعلم</h3>{selectedTeacherPlans.map(p=><div key={p.id} className="border-b py-3 text-xs"><b>{p.improvementArea}</b><p className="text-slate-500 mt-1">{p.developmentalGoal}</p><p className="mt-1">الحالة: {p.status} | موعد المتابعة: {p.followUpDate||'غير محدد'}</p><p className="mt-1">{p.followUpNotes||p.followUpResult||'لم تسجل ملاحظات متابعة بعد'}</p></div>)}</div></>:<div className="p-8 text-center text-slate-400 bg-white rounded-xl border">اختر اسم المعلم لعرض ملفه التاريخي.</div>}</div>}
    {section === 'plans' && <div className="space-y-3"><div className="flex items-center gap-2"><span className="text-xs font-bold">حالة الخطة</span><select value={planStatus} onChange={e=>setPlanStatus(e.target.value)} className="rounded-lg border p-2 text-xs"><option value="ALL">جميع الحالات</option><option value="not_started">لم تبدأ</option><option value="in_progress">قيد التنفيذ</option><option value="needs_follow_up">تحتاج متابعة</option><option value="completed">مكتملة</option></select></div><div className="bg-white border rounded-xl overflow-x-auto"><table className="w-full min-w-[800px] text-right text-xs"><thead className="bg-[#172C40] text-white"><tr>{['المعلم','مجال التحسين','الهدف التطويري','الإجراء','المسؤول','موعد المتابعة','الحالة','نتيجة المتابعة'].map(x=><th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody className="divide-y">{filteredPlans.map(p=><tr key={p.id}><td className="p-3 font-bold">{p.teacherName}</td><td className="p-3">{p.improvementArea}</td><td className="p-3">{p.developmentalGoal}</td><td className="p-3">{p.actionProcedure}</td><td className="p-3">{p.responsiblePerson}</td><td className="p-3">{p.followUpDate}</td><td className="p-3">{p.status}</td><td className="p-3">{p.followUpResult||p.followUpNotes||'—'}</td></tr>)}</tbody></table>{filteredPlans.length===0&&<div className="p-8 text-center text-slate-400">لا توجد خطط مطابقة.</div>}</div></div>}
    {section === 'analytics' && <div className="grid md:grid-cols-2 gap-4"><div className="bg-white border rounded-xl p-5"><h3 className="font-bold mb-4">توزيع الزيارات حسب النوع</h3>{[{label:'رسمية',count:full},{label:'سريعة',count:quick}].map(x=><div key={x.label} className="mb-4"><div className="flex justify-between text-xs mb-1"><span>{x.label}</span><b>{x.count}</b></div><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#C6A66A]" style={{width:(filtered.length?x.count/filtered.length*100:0)+'%'}}/></div></div>)}</div><div className="bg-white border rounded-xl p-5"><h3 className="font-bold mb-4">متوسط الإنجاز حسب المادة</h3>{subjects.map(s=>{const rows=filtered.filter(v=>v.subject===s);const avg=rows.length?Math.round(rows.reduce((a,v)=>a+v.achievementPercentage,0)/rows.length):0;return <div key={s} className="mb-3"><div className="flex justify-between text-xs mb-1"><span>{s}</span><b>{avg}% ({rows.length})</b></div><div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#668575]" style={{width:avg+'%'}}/></div></div>})}</div><div className="bg-white border rounded-xl p-5 md:col-span-2"><h3 className="font-bold mb-3">المؤشرات التي تحتاج إلى تركيز تطويري</h3>{OFFICIAL_INDICATORS.map(ind=>{const ratings=filtered.flatMap(v=>v.indicators.filter(r=>r.indicatorId===ind.id));const needs=ratings.filter(r=>['weak','no','acceptable','needs_improvement'].includes(r.rating)).length;return <div key={ind.id} className="grid grid-cols-[1fr_80px] gap-3 py-2 border-b text-xs"><span>{ind.id}. {ind.text}</span><b className="text-amber-700">{needs} ملاحظة</b></div>})}</div></div>}
    {section === 'archive' && <>{visitTable(filtered.slice().sort((a,b)=>dateValue(b.date).localeCompare(dateValue(a.date))))}<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">الأرشيف يعرض السجلات المحفوظة حاليًا، ويمكن فتح التقرير الأصلي وطباعته من زر «عرض». لا يُحذف سجل لمجرد تعطيل حساب المقيم.</div></>}
    {section === 'audit' && <div className="space-y-3"><div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">سجل التدقيق يعرض العمليات التي تسجلها المنصة حاليًا، مثل تسجيل الدخول وإنشاء الزيارات وتعديلها وإدارة خطط التحسين والإعدادات. السجلات المتاحة حاليًا محفوظة محليًا على هذا المتصفح.</div><div className="bg-white border rounded-xl overflow-x-auto"><table className="w-full min-w-[800px] text-right text-xs"><thead className="bg-[#172C40] text-white"><tr>{['التاريخ والوقت','المستخدم','الصلاحية','العملية','التفاصيل'].map(x=><th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody className="divide-y">{visibleAuditLogs.map(log=><tr key={log.id}><td className="p-3 whitespace-nowrap">{log.timestamp}</td><td className="p-3 font-bold">{log.userName}</td><td className="p-3">{log.userRole}</td><td className="p-3">{log.action}</td><td className="p-3">{log.details}</td></tr>)}</tbody></table>{auditLogs.length===0&&<div className="p-8 text-center text-slate-400">لا توجد أحداث مسجلة.</div>}</div></div>}
    <div className="text-[10px] text-slate-400 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5"/> يتم تطبيق نطاق العرض حسب صلاحية الحساب الحالي. لا تُعرض بيانات المعلمين لمستخدم غير مخول.</div>
  </div>;
};
