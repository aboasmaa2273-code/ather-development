import React, { useState } from 'react';
import { ImprovementPlan, Teacher, User } from '../types';
import { AtharStorageService } from '../services/storageService';
import { OFFICIAL_INDICATORS } from '../data/defaultData';
import { 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  X,
  FileCheck
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface ImprovementPlansListProps {
  plans: ImprovementPlan[];
  teachers: Teacher[];
  currentUser: User;
  onRefreshPlans: () => void;
  initiallyOpenCreate?: boolean;
  language?: Language;
}

export const ImprovementPlansList: React.FC<ImprovementPlansListProps> = ({
  plans,
  teachers,
  currentUser,
  onRefreshPlans,
  initiallyOpenCreate = false,
  language = 'ar'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initiallyOpenCreate);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedPlanForFollowUp, setSelectedPlanForFollowUp] = useState<ImprovementPlan | null>(null);

  const t = translations[language];
  const isEn = language === 'en';

  // New Plan form fields
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [improvementArea, setImprovementArea] = useState(isEn ? 'Teaching Practices & Formative Assessment' : 'الممارسات التدريسية والتقويم الصفي');
  const [relatedIndicatorText, setRelatedIndicatorText] = useState(
    isEn ? (OFFICIAL_INDICATORS[7]?.textEn || OFFICIAL_INDICATORS[7]?.text || '') : OFFICIAL_INDICATORS[7]?.text || ''
  );
  const [developmentalGoal, setDevelopmentalGoal] = useState('');
  const [actionProcedure, setActionProcedure] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState(currentUser.name);
  const [duration, setDuration] = useState(isEn ? '2 Weeks' : 'أسبوعان');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Follow-up modal fields
  const [followUpStatus, setFollowUpStatus] = useState<ImprovementPlan['status']>('completed');
  const [followUpResult, setFollowUpResult] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  const isTeacher = currentUser.role === 'teacher';
  const canCreate = AtharStorageService.canCreatePlan(currentUser);

  // Filter plans based on role and query
  const visiblePlans = plans.filter(p => {
    if (isTeacher && p.teacherJobNumber !== currentUser.jobNumber && p.teacherName !== currentUser.name) {
      return false;
    }

    const matchesSearch = 
      p.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.improvementArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tch = teachers.find(t => t.id === teacherId);
    if (!tch) return;

    const res = AtharStorageService.savePlan({
      schoolId: 'sch_alsadara_01',
      teacherId: tch.id,
      teacherName: tch.fullName,
      teacherJobNumber: tch.jobNumber,
      improvementArea,
      relatedIndicatorText,
      developmentalGoal,
      actionProcedure,
      responsiblePerson,
      duration,
      followUpDate,
      status: 'in_progress'
    });

    if (res.success) {
      setIsCreateModalOpen(false);
      onRefreshPlans();
    } else {
      alert(res.error);
    }
  };

  const handleOpenFollowUp = (plan: ImprovementPlan) => {
    setSelectedPlanForFollowUp(plan);
    setFollowUpStatus(plan.status === 'completed' ? 'completed' : 'completed');
    setFollowUpResult(plan.followUpResult || '');
    setFollowUpNotes(plan.followUpNotes || '');
    setIsFollowUpModalOpen(true);
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForFollowUp) return;

    const res = AtharStorageService.updatePlanFollowUp(selectedPlanForFollowUp.id, {
      status: followUpStatus,
      followUpResult,
      followUpNotes
    });

    if (res.success) {
      setIsFollowUpModalOpen(false);
      onRefreshPlans();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#172C40] font-['Tajawal']">{t.plans.title}</h2>
          <p className="text-xs text-[#64748B] mt-1">
            {t.plans.subtitle}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#172C40] text-white rounded-lg text-xs font-bold hover:bg-[#101F2D] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#C6A66A]" />
            <span>{t.plans.addNewPlan}</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isEn ? 'left-3' : 'right-3'} top-2.5`} />
          <input
            type="text"
            placeholder={t.plans.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isEn ? 'pl-9 pr-3' : 'pr-9 pl-3'} py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#172C40]`}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t.common.all}</option>
            <option value="in_progress">{t.status.in_progress}</option>
            <option value="needs_follow_up">{t.status.needs_follow_up}</option>
            <option value="completed">{t.status.completed}</option>
          </select>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visiblePlans.length > 0 ? (
          visiblePlans.map((plan) => (
            <div key={plan.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#C6A66A] transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 block">{plan.id}</span>
                  <h3 className="font-bold text-sm text-[#172C40] mt-0.5">{plan.teacherName}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {t.teachers.colJobNumber}: {plan.teacherJobNumber}
                  </span>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  plan.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  plan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  plan.status === 'needs_follow_up' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {AtharStorageService.getPlanStatusLabel(plan.status, language)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400 text-[10px] block">
                    {isEn ? 'Growth Area & Targeted Indicator:' : 'مجال التحسين والمؤشر المرتبط:'}
                  </span>
                  <span className="font-bold text-[#172C40]">{plan.improvementArea}</span>
                  <span className="text-[11px] text-[#668575] block mt-0.5">{plan.relatedIndicatorText}</span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-[10px] block">
                    {isEn ? 'Developmental Goal:' : 'الهدف التطويري:'}
                  </span>
                  <p className="text-slate-800 font-medium">{plan.developmentalGoal}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-[10px] block">{t.plans.colProcedure}:</span>
                  <p className="text-slate-700">{plan.actionProcedure}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                <div>
                  <span>{isEn ? 'Responsible:' : 'المسؤول:'} <strong className="text-slate-800">{plan.responsiblePerson}</strong></span>
                  <span className="mx-1.5">·</span>
                  <span>{isEn ? 'Duration:' : 'المدة:'} <strong>{plan.duration}</strong></span>
                </div>
                <div className="font-mono">
                  <span>{t.plans.colFollowUpDate}: <strong className="text-[#172C40]">{plan.followUpDate}</strong></span>
                </div>
              </div>

              {plan.followUpResult && (
                <div className="p-2.5 rounded bg-emerald-50/70 border border-emerald-100 text-[11px]">
                  <strong className="text-emerald-900">{isEn ? 'Follow-Up Result: ' : 'نتيجة المتابعة: '}</strong>
                  <span className="text-emerald-950">{plan.followUpResult}</span>
                  {plan.followUpNotes && (
                    <p className="text-slate-600 mt-1">{plan.followUpNotes}</p>
                  )}
                </div>
              )}

              {/* Action buttons (evaluator / admin) */}
              {!isTeacher && (
                <div className={`pt-2 border-t border-slate-100 flex ${isEn ? 'justify-end' : 'justify-end'}`}>
                  <button
                    onClick={() => handleOpenFollowUp(plan)}
                    className="px-3 py-1 bg-[#F2EBDD] text-[#172C40] hover:bg-[#e4d7bf] rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t.plans.followUpBtn}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 p-12 bg-white border border-dashed rounded-xl text-center text-slate-400 text-xs">
            {isEn ? 'No professional development plans match your query.' : 'لا توجد خطط تطوير مهني مسجلة تطابق البحث.'}
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#172C40]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#172C40] text-white">
              <h3 className="font-bold text-sm font-['Tajawal']">{t.plans.addNewPlan}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/80 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlanSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.visits.teacherLabel} *</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                >
                  {teachers.map(tch => (
                    <option key={tch.id} value={tch.id}>{tch.fullName} ({tch.jobNumber} - {tch.specialization})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{isEn ? 'Growth / Improvement Area *' : 'مجال التحسين *'}</label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? 'e.g. Teaching Practices & Formative Assessment' : 'مثال: الممارسات التدريسية والتقويم الصفي'}
                  value={improvementArea}
                  onChange={(e) => setImprovementArea(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.plans.colIndicator} *</label>
                <select
                  value={relatedIndicatorText}
                  onChange={(e) => setRelatedIndicatorText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {OFFICIAL_INDICATORS.map(ind => (
                    <option key={ind.id} value={`${isEn ? (ind.textEn || ind.text) : ind.text} (${isEn ? 'Indicator' : 'مؤشر'} ${ind.id})`}>
                      {ind.id}. {isEn ? (ind.textEn || ind.text) : ind.text}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{isEn ? 'Measurable Developmental Goal *' : 'الهدف التطويري القابل للقياس *'}</label>
                <textarea
                  required
                  rows={2}
                  placeholder={isEn ? 'Specific observable outcome targeted in the next observation...' : 'صياغة هدف عملي محدد وقابل للملاحظة المباشرة في الزيارة القادمة...'}
                  value={developmentalGoal}
                  onChange={(e) => setDevelopmentalGoal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.plans.colProcedure} *</label>
                <textarea
                  required
                  rows={2}
                  placeholder={isEn ? 'Workshop attendance, peer modeling, sample rubrics creation...' : 'حضور ورشة تخصصية، تبادل زيارات مع زميل متميز، تصميم أنشطة متمايزة...'}
                  value={actionProcedure}
                  onChange={(e) => setActionProcedure(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#172C40] mb-1">{isEn ? 'Duration' : 'المدة المقترحة'}</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#172C40] mb-1">{t.plans.colFollowUpDate} *</label>
                  <input
                    type="date"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] cursor-pointer"
                >
                  {isEn ? 'Assign Plan' : 'إسناد الخطة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {isFollowUpModalOpen && selectedPlanForFollowUp && (
        <div className="fixed inset-0 z-50 bg-[#172C40]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#172C40] text-white">
              <h3 className="font-bold text-sm font-['Tajawal']">{t.plans.followUpModalTitle}</h3>
              <button onClick={() => setIsFollowUpModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/80 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFollowUpSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-[#172C40]">{selectedPlanForFollowUp.teacherName}</div>
                <div className="text-[11px] text-[#668575] mt-0.5">{selectedPlanForFollowUp.developmentalGoal}</div>
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.plans.changeStatusLabel} *</label>
                <select
                  value={followUpStatus}
                  onChange={(e) => setFollowUpStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="completed">{t.status.completed}</option>
                  <option value="in_progress">{t.status.in_progress}</option>
                  <option value="needs_follow_up">{t.status.needs_follow_up}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.plans.resultLabel} *</label>
                <textarea
                  required
                  rows={3}
                  placeholder={isEn ? 'Document verified pedagogical growth in next visit...' : 'توثيق مدى تحقق الهدف في الزيارة اللاحقة والشواهد المشاهدة...'}
                  value={followUpResult}
                  onChange={(e) => setFollowUpResult(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.plans.notesLabel}</label>
                <input
                  type="text"
                  placeholder={isEn ? 'Additional recommendations or next milestones...' : 'توصيات أو خطوات إضافية (اختياري)...'}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
