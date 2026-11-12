import React from 'react';
import schoolLogoFallback from '../assets/images/athar_school_emblem_1793852788755.jpg';
import { ClassroomVisit, PlatformSettings } from '../types';
import { AtharStorageService } from '../services/storageService';
import { 
  Printer, 
  X, 
  Award, 
  Calendar, 
  User as UserIcon, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Compass,
  Users,
  GraduationCap,
  Trash2
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { 
  translateSubject, 
  translateGrade, 
  translateSection, 
  translateTerm, 
  translateIndicatorText, 
  translateIndicatorGroup, 
  translateDomainName, 
  translateRecommendationItem, 
  translateGoalText 
} from '../utils/bilingualHelper';

interface VisitReportModalProps {
  visit: ClassroomVisit | null;
  platformSettings: PlatformSettings;
  onClose: () => void;
  language?: Language;
  canDelete?: boolean;
  onDeleteReport?: (visitId: string) => void;
}

export const VisitReportModal: React.FC<VisitReportModalProps> = ({
  visit,
  platformSettings,
  onClose,
  language = 'ar',
  canDelete = false,
  onDeleteReport
}) => {
  if (!visit) return null;

  const t = translations[language];
  const isEn = language === 'en';

  const handlePrint = async () => {
    // Wait for the school emblem and any uploaded images before opening print.
    const images = Array.from(document.querySelectorAll('.print-modal-body img')) as HTMLImageElement[];
    await Promise.all(images.map((img) => img.decode().catch(() => undefined)));
    window.print();
  };

  // Group indicators for clean report presentation
  const grouped = visit.indicators.reduce((acc, ind) => {
    if (!acc[ind.indicatorGroup]) acc[ind.indicatorGroup] = [];
    acc[ind.indicatorGroup].push(ind);
    return acc;
  }, {} as Record<string, typeof visit.indicators>);

  const attendanceRate = (visit.totalStudents && visit.totalStudents > 0 && typeof visit.attendedStudents === 'number')
    ? Math.round((visit.attendedStudents / visit.totalStudents) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#172C40]/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print-report-modal-root print:p-0 print:bg-white print:static print:overflow-visible print:block">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 15mm 10mm;
          }
          html, body {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            background: #fff !important;
          }
          body * {
            visibility: hidden;
          }
          .print-report-modal-root,
          .print-report-modal-root * {
            visibility: visible;
          }
          .print-report-modal-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            background: #fff !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
          }
          .print-modal-inner {
            max-height: none !important;
            overflow: visible !important;
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
          }
          .print-modal-body {
            max-height: none !important;
            overflow: visible !important;
            height: auto !important;
            display: block !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden my-auto print-modal-inner print:max-h-none print:shadow-none print:border-none print:w-full print:block print:my-0">
        
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print p-4 border-b border-slate-200 bg-[#172C40] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C6A66A]" />
            <h3 className="font-bold text-sm font-['Tajawal']">
              {t.visitReportModal.officialTitle} — {platformSettings.schoolName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#C6A66A] text-[#172C40] rounded-lg font-bold text-xs hover:bg-[#b5955a] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{t.visitReportModal.printBtn}</span>
            </button>
            {canDelete && onDeleteReport && (
              <button
                onClick={() => {
                  if (confirm(isEn ? 'Are you sure you want to delete this report permanently?' : 'هل أنت متأكد من رغبتك في حذف هذا التقرير نهائياً؟')) {
                    onDeleteReport(visit.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-600/90 text-white rounded-lg font-bold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-rose-400/40"
                title={isEn ? 'Delete Report' : 'حذف التقرير'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Delete Report' : 'حذف التقرير'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg text-white/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-[#172C40] bg-white print-modal-body print:p-0 print:overflow-visible print:max-h-none print:block">
          
          {/* Official Document Header */}
          <div className="border-b-2 border-[#172C40] pb-6 flex items-center justify-between">
            <div className={isEn ? 'text-left' : 'text-right'}>
              <div className="text-lg font-black font-['Tajawal'] text-[#172C40]">{platformSettings.schoolName}</div>
              <div className="text-xs text-slate-600 font-semibold">{platformSettings.schoolStage}</div>
              <div className="text-[11px] text-[#668575] font-bold mt-1">
                {isEn ? 'ATHAR System for Educational Excellence & Growth' : 'منظومة «أَثَر» للتميز والتطوير التعليمي'}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full border border-[#C6A66A] p-1 bg-[#F2EBDD]/20 overflow-hidden flex items-center justify-center">
                <img
                  src={platformSettings.logoUrl || schoolLogoFallback}
                  alt="شعار مدرسة الصدارة"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">{visit.id}</div>
            </div>

            <div className={isEn ? 'text-right' : 'text-left'}>
              <div className="text-xs text-slate-500">
                {t.visits.academicYear}: <span className="font-bold text-[#172C40] font-mono">{visit.academicYear}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t.visits.term}: <span className="font-bold text-[#172C40]">{translateTerm(visit.term, language)}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t.visits.visitDate}: <span className="font-bold text-[#172C40] font-mono">{visit.date}</span>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-2 bg-[#F2EBDD]/40 border-y border-[#C6A66A]/30 rounded">
            <h1 className="text-lg font-black text-[#172C40] font-['Tajawal']">
              {t.visitReportModal.officialTitle} ({visit.visitType === 'full' ? t.dashboard.full : t.dashboard.quick})
            </h1>
            <p className="text-[11px] text-[#668575] font-bold">
              {isEn ? platformSettings.slogan : platformSettings.slogan}
            </p>
          </div>

          {/* Teacher & Class Meta Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[10px]">{t.visitReportModal.teacherName}</span>
              <span className="font-bold text-sm text-[#172C40]">{visit.teacherName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{t.visitReportModal.jobNumber}</span>
              <span className="font-bold font-mono text-[#172C40]">{visit.teacherJobNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{t.visitReportModal.subjectGrade}</span>
              <span className="font-bold text-[#172C40]">{translateSubject(visit.subject, language)} ({translateSubject(visit.teacherSpecialization, language)})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{t.visits.grade} & {t.visits.section}:</span>
              <span className="font-bold text-[#172C40]">{translateGrade(visit.grade, language)} - {translateSection(visit.section, language)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{t.visitReportModal.evaluator}</span>
              <span className="font-bold text-[#172C40]">{visit.evaluatorName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{t.visits.visitTime}:</span>
              <span className="font-mono text-[#172C40]">{visit.time}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{t.dashboard.tableStatus}:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                {AtharStorageService.getVisitStatusLabel(visit.status, language)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{t.visitReportModal.achievementHeader}:</span>
              <span className="font-bold text-[#172C40] text-sm tabular-nums">
                {visit.achievementPercentage}%
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* NEW SECTION: Student Demographics & Attendance (الطلبة والحضور) */}
          {/* ============================================================== */}
          {(visit.totalStudents !== undefined || visit.studentGender) && (
            <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="font-bold text-[#172C40] flex items-center gap-1.5 text-xs">
                  <GraduationCap className="w-4 h-4 text-[#C6A66A]" />
                  <span>{t.visitReportModal.demographicsHeader}</span>
                </span>
                {attendanceRate !== null && (
                  <span className="text-[#668575] font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {t.attendance.attendanceRate}: {attendanceRate}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">{t.attendance.studentGender}</span>
                  <span className="font-bold text-[#172C40]">
                    {AtharStorageService.getStudentGenderLabel(visit.studentGender, language)}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">{t.attendance.totalStudents}</span>
                  <span className="font-bold font-mono text-[#172C40] text-sm">
                    {visit.totalStudents ?? '—'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">{t.attendance.attendedStudents}</span>
                  <span className="font-bold font-mono text-emerald-700 text-sm">
                    {visit.attendedStudents ?? '—'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">{t.attendance.absentStudents}</span>
                  <span className="font-bold font-mono text-rose-700 text-sm">
                    {visit.absentStudents ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* NEW SECTION: Observers & Visitors Team (فريق الزوار والملاحظين) */}
          {/* ============================================================== */}
          {visit.visitors && visit.visitors.length > 0 && (
            <div className="p-3 bg-[#F2EBDD]/25 border border-[#C6A66A]/40 rounded-xl space-y-2">
              <span className="font-bold text-[#172C40] flex items-center gap-1.5 text-xs">
                <Users className="w-4 h-4 text-[#172C40]" />
                <span>{t.visitReportModal.visitorsHeader} ({visit.visitors.length} {isEn ? 'Members' : 'أعضاء'})</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {visit.visitors.map((visitor, idx) => (
                  <div key={visitor.id || idx} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#172C40] text-white text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-[#172C40] text-xs truncate">{visitor.name || visit.evaluatorName}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {visitor.roleTitle || AtharStorageService.getVisitorRoleLabel(visitor.role, language)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visit Goal */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="font-bold text-[#172C40] block mb-1">{t.visitReportModal.goal}</span>
            <p className="text-slate-700 leading-relaxed">
              {visit.visitGoal ? translateGoalText(visit.visitGoal, language) : (isEn ? 'Comprehensive classroom observation and learning outcomes monitoring.' : 'رصد الممارسات التدريسية الصفية الشاملة ونواتج التعلم.')}
            </p>
          </div>

          {/* Indicators Matrix Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="font-bold text-[#172C40] text-sm font-['Tajawal']">
                {t.visitReportModal.indicatorsHeader}
              </h3>
              <span className="text-slate-500 text-[11px]">
                {isEn 
                  ? `Observed: (${visit.observedIndicatorsCount}) · Not Observed: (${visit.totalIndicatorsCount - visit.observedIndicatorsCount})` 
                  : `المشاهد: (${visit.observedIndicatorsCount}) مؤشرات · غير المشاهد: (${visit.totalIndicatorsCount - visit.observedIndicatorsCount})`}
              </span>
            </div>

            <table className={`w-full ${isEn ? 'text-left' : 'text-right'} border-collapse text-[11px]`}>
              <thead>
                <tr className="bg-[#172C40] text-white">
                  <th className="p-2 border border-slate-300 w-12 text-center">#</th>
                  <th className="p-2 border border-slate-300">{isEn ? 'Core Indicator' : 'المؤشر الصفي الملاحظ'}</th>
                  <th className="p-2 border border-slate-300 w-28 text-center">{isEn ? 'Rating' : 'التقييم'}</th>
                  <th className="p-2 border border-slate-300">{isEn ? 'Qualitative Notes & Evidence' : 'الشواهد والملاحظات النوعية'}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([groupName, indList]) => (
                  <React.Fragment key={groupName}>
                    <tr className="bg-slate-100 font-bold text-[#172C40]">
                      <td colSpan={4} className="p-2 border border-slate-300 text-xs font-['Tajawal']">
                        {isEn ? 'Domain:' : 'المجموعة:'} {translateIndicatorGroup(groupName, language)}
                      </td>
                    </tr>
                    {indList.map((ind) => (
                      <tr key={ind.indicatorId} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 text-center font-mono font-bold text-[#172C40]">
                          {ind.indicatorId}
                        </td>
                        <td className="p-2 border border-slate-300 font-medium">
                          {translateIndicatorText(ind.indicatorId, ind.indicatorText, language)}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-bold">
                          {ind.rating === 'outstanding' && <span className="text-emerald-800">ممتاز</span>}
                          {ind.rating === 'very_good' && <span className="text-emerald-700">جيد جداً</span>}
                          {ind.rating === 'good' && <span className="text-sky-700">جيد</span>}
                          {ind.rating === 'acceptable' && <span className="text-amber-700">مقبول</span>}
                          {ind.rating === 'weak' && <span className="text-rose-700">ضعيف</span>}
                          {ind.rating === 'not_observed' && <span className="text-slate-400">لم يُشاهد</span>}
                          {ind.rating === 'yes' && <span className="text-emerald-700">ممتاز</span>}
                          {ind.rating === 'needs_improvement' && <span className="text-amber-700">مقبول</span>}
                          {ind.rating === 'no' && <span className="text-rose-700">ضعيف</span>}
                        </td>
                        <td className="p-2 border border-slate-300 text-slate-600">
                          {ind.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* General Domains Ratings & e-Learning Maturity */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#172C40] text-sm font-['Tajawal'] border-b border-slate-200 pb-1">
              {t.visitReportModal.domainsHeader}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {visit.domains.map((dom) => (
                <div key={dom.domainId} className="p-2 border border-slate-200 rounded bg-slate-50/70 text-center">
                  <span className="text-[10px] text-slate-500 block truncate" title={dom.domainName}>
                    {translateDomainName(dom.domainName, language)}
                  </span>
                  <span className="text-xs font-bold text-[#172C40] mt-0.5 block">
                    {AtharStorageService.getDomainRatingLabel(dom.rating, language)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-[#F2EBDD]/40 border border-[#C6A66A]/30 rounded flex items-center justify-between text-xs">
              <span className="font-bold text-[#172C40]">{t.visitReportModal.eLearningHeader}:</span>
              <span className="font-extrabold text-[#172C40] bg-white px-3 py-1 rounded border border-[#C6A66A]/40">
                {t.ratings[visit.eLearningMaturity] || visit.eLearningMaturity}
              </span>
            </div>
          </div>

          {/* Strengths & Improvement Areas & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-2">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{t.visitReportModal.strengthsHeader}:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-emerald-950 text-[11px] leading-relaxed">
                {visit.strengths && visit.strengths.length > 0 ? (
                  visit.strengths.map((s, idx) => <li key={idx}>{translateRecommendationItem(s, language)}</li>)
                ) : (
                  <li>{isEn ? 'Maintained foundational lesson standards.' : 'تم الالتزام بمعايير الحصة الأساسية.'}</li>
                )}
              </ul>
            </div>

            <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-xl space-y-2">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>{t.visitReportModal.growthHeader}:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-amber-950 text-[11px] leading-relaxed">
                {visit.improvementAreas && visit.improvementAreas.length > 0 ? (
                  visit.improvementAreas.map((ia, idx) => <li key={idx}>{translateRecommendationItem(ia, language)}</li>)
                ) : (
                  <li>{isEn ? 'Maintain sustained high performance.' : 'مواصلة الحفاظ على المستوى المتميز.'}</li>
                )}
              </ul>
            </div>

          </div>

          {/* Practical Recommendations */}
          {visit.practicalRecommendations && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-[#172C40] block mb-1">{t.visitReportModal.recommendationsHeader}:</span>
              <p className="text-slate-800 leading-relaxed text-[11px]">{translateRecommendationItem(visit.practicalRecommendations, language)}</p>
            </div>
          )}

          {/* Suggested Follow-up Plan (خطة المتابعة المقترحة) */}
          {visit.suggestedFollowUpPlan && (
            <div className="p-3 bg-[#F2EBDD]/50 border border-[#C6A66A]/40 rounded-xl">
              <span className="font-bold text-[#172C40] block mb-1">
                {language === 'ar' ? 'خطة المتابعة المقترحة:' : 'Suggested Follow-up Plan:'}
              </span>
              <p className="text-slate-800 leading-relaxed text-[11px]">{translateRecommendationItem(visit.suggestedFollowUpPlan, language)}</p>
            </div>
          )}

          {/* Teacher acknowledgement, evaluator signature and school approval */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs print:pt-12 print:gap-4">
            <div className="print-break-avoid">
              <span className="text-slate-500 block mb-3 font-bold">{isEn ? 'Teacher Acknowledgement:' : 'اعتماد المعلم:'}</span>
              <div className="font-bold text-[#172C40] mb-5">{visit.teacherName}</div>
              <div className="min-h-7 border-t border-slate-300 pt-1 text-slate-500">{isEn ? 'Teacher signature' : 'توقيع المعلم'}</div>
            </div>
            <div className="print-break-avoid">
              <span className="text-slate-500 block mb-3 font-bold">{isEn ? 'Visitor / Evaluator Signature:' : 'توقيع الزائر/المقيّم:'}</span>
              <div className="font-bold text-[#172C40] mb-5">{visit.evaluatorName}</div>
              <div className="min-h-7 border-t border-slate-300 pt-1 text-slate-500">{isEn ? 'Signature' : 'التوقيع'}</div>
            </div>
            <div className="print-break-avoid">
              <span className="text-slate-500 block mb-3 font-bold">{isEn ? 'School Approval:' : 'اعتماد إدارة مدرسة الصدارة'}</span>
              <div className="min-h-7 border-t border-slate-300 pt-1" aria-label={isEn ? 'School approval area' : 'مساحة اعتماد إدارة المدرسة'}></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
