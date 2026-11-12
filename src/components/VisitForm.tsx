import React, { useState, useEffect, useRef } from 'react';
import { 
  ClassroomVisit, 
  Teacher, 
  User, 
  AcademicSettings, 
  IndicatorRating, 
  DomainPerformanceLevel,
  ELearningMaturityLevel,
  VisitIndicatorResult,
  DomainEvaluation,
  StudentGender,
  VisitVisitor,
  VisitorRole,
} from '../types';
import { OFFICIAL_INDICATORS, GENERAL_DOMAINS, POTENTIAL_VISIT_GOALS, PRESET_RECOMMENDATION_BANKS } from '../data/defaultData';
import { AtharStorageService } from '../services/storageService';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  FileCheck,
  Check,
  Info,
  Target,
  CheckCheck,
  Users,
  UserPlus,
  Trash2,
  GraduationCap,
  ListChecks,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Plus,
  Briefcase,
  UserCheck,
  BadgeCheck
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface VisitFormProps {
  currentUser: User;
  teachers: Teacher[];
  academicSettings: AcademicSettings;
  editingVisit?: ClassroomVisit | null;
  onSaveSuccess: (savedVisit: ClassroomVisit) => void;
  onCancel: () => void;
  language?: Language;
}

export const VisitForm: React.FC<VisitFormProps> = ({
  currentUser,
  teachers,
  academicSettings,
  editingVisit,
  onSaveSuccess,
  onCancel,
  language = 'ar'
}) => {
  const t = translations[language];
  const isEn = language === 'en';

  // Wizard Steps: 1: Meta, 2: Indicators, 3: General Domains, 4: e-Learning & Recommendations
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Core Visit Meta
  const [visitId] = useState<string>(
    editingVisit?.id || `VST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [academicYear, setAcademicYear] = useState(editingVisit?.academicYear || academicSettings.currentAcademicYear);
  const [term, setTerm] = useState(editingVisit?.term || '');
  const [visitType, setVisitType] = useState<'full' | 'quick'>(editingVisit?.visitType || 'full');
  
  // Teacher selection
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(editingVisit?.teacherId || '');
  const [teacherName, setTeacherName] = useState(editingVisit?.teacherName || '');
  const [teacherJobNumber, setTeacherJobNumber] = useState(editingVisit?.teacherJobNumber || '');
  const [teacherSpecialization, setTeacherSpecialization] = useState(editingVisit?.teacherSpecialization || '');

  // Classroom & Session Details
  const [grade, setGrade] = useState(editingVisit?.grade || '');
  const [section, setSection] = useState(editingVisit?.section || '');
  const [subject, setSubject] = useState(editingVisit?.subject || '');
  const [date, setDate] = useState(editingVisit?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(editingVisit?.time || '09:00');
  const [visitGoal, setVisitGoal] = useState(
    visitType === 'full' ? (isEn ? 'Official Visit' : 'زيارة رسمية') : (editingVisit?.visitGoal || POTENTIAL_VISIT_GOALS[0]?.text || '')
  );
  const [selectedGoalPresetId, setSelectedGoalPresetId] = useState<string>(() => {
    if (visitType === 'full') return 'official';
    if (editingVisit?.visitGoal) {
      const found = POTENTIAL_VISIT_GOALS.find(g => g.text === editingVisit.visitGoal);
      return found ? found.id : 'custom';
    }
    return POTENTIAL_VISIT_GOALS[0]?.id || 'custom';
  });
  const [status, setStatus] = useState<ClassroomVisit['status']>(editingVisit?.status || 'in_progress');

  // New Student Demographics & Attendance
  const [totalStudents, setTotalStudents] = useState<number | ''>(editingVisit?.totalStudents ?? '');
  const [attendedStudents, setAttendedStudents] = useState<number | ''>(editingVisit?.attendedStudents ?? '');
  const [absentStudents, setAbsentStudents] = useState<number | ''>(editingVisit?.absentStudents ?? '');
  const [studentGender, setStudentGender] = useState<StudentGender>(
    editingVisit?.studentGender || 'boys'
  );

  // Visitors & Multiple Observers (تعدد الزائرين)
  const [visitors, setVisitors] = useState<VisitVisitor[]>(() => {
    if (editingVisit?.visitors && editingVisit.visitors.length > 0) {
      return editingVisit.visitors;
    }
    const registeredList = AtharStorageService.getRegisteredVisitors();
    const matched = registeredList.find(
      rv => rv.name === currentUser.name || (currentUser.username && rv.username === currentUser.username)
    );
    let defaultRole: VisitorRole | string = 'evaluator';
    if (matched) {
      defaultRole = matched.role;
    } else if (currentUser.name?.includes('هيئة تدريس المواد العربية') || currentUser.specialization?.includes('المواد العربية')) {
      defaultRole = 'head_of_arabic';
    } else if (currentUser.name?.includes('عائشة الغفلي') || currentUser.specialization?.includes('نطاق')) {
      defaultRole = 'cluster_director';
    } else if (currentUser.name?.includes('مدير المدرسة') || currentUser.role === 'school_admin') {
      defaultRole = 'principal';
    } else if (currentUser.name?.includes('مساعد المدير') || currentUser.role === 'vice_principal') {
      defaultRole = 'vice_principal';
    } else if (currentUser.specialization?.includes('رئيس قسم')) {
      defaultRole = 'department_head';
    }

    return [
      {
        id: `vis-${Date.now()}-1`,
        name: currentUser.name || (isEn ? 'Lead Observer' : 'المقيم الزائر'),
        role: editingVisit?.visitorRole || defaultRole,
        roleTitle: currentUser.specialization || ''
      }
    ];
  });

  // Automatically sync primary visitor with the current logged-in user who logged in via username & password
  useEffect(() => {
    if (!editingVisit && currentUser?.name) {
      setVisitors(prev => {
        const registeredList = AtharStorageService.getRegisteredVisitors();
        const matched = registeredList.find(
          rv => rv.name === currentUser.name || (currentUser.username && rv.username === currentUser.username)
        );
        let userRole: VisitorRole | string = 'evaluator';
        if (matched) {
          userRole = matched.role;
        } else if (currentUser.name?.includes('هيئة تدريس المواد العربية') || currentUser.specialization?.includes('المواد العربية')) {
          userRole = 'head_of_arabic';
        } else if (currentUser.name?.includes('عائشة الغفلي') || currentUser.specialization?.includes('نطاق')) {
          userRole = 'cluster_director';
        } else if (currentUser.name?.includes('مدير المدرسة') || currentUser.role === 'school_admin') {
          userRole = 'principal';
        } else if (currentUser.name?.includes('مساعد المدير') || currentUser.role === 'vice_principal') {
          userRole = 'vice_principal';
        } else if (currentUser.specialization?.includes('رئيس قسم')) {
          userRole = 'department_head';
        }

        if (prev.length === 0) {
          return [{ id: `vis-${Date.now()}-1`, name: currentUser.name, role: userRole }];
        }
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          name: currentUser.name,
          role: userRole,
          roleTitle: currentUser.specialization || ''
        };
        return updated;
      });
    }
  }, [currentUser, editingVisit]);

  // Handle total / attended changes with auto-calc of absentees
  const handleTotalStudentsChange = (val: string) => {
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setTotalStudents(num);
    if (typeof num === 'number' && typeof attendedStudents === 'number') {
      setAbsentStudents(Math.max(0, num - attendedStudents));
    }
    triggerAutoSave();
  };

  const handleAttendedStudentsChange = (val: string) => {
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setAttendedStudents(num);
    if (typeof totalStudents === 'number' && typeof num === 'number') {
      setAbsentStudents(Math.max(0, totalStudents - num));
    }
    triggerAutoSave();
  };

  const handleAbsentStudentsChange = (val: string) => {
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setAbsentStudents(num);
    triggerAutoSave();
  };

  // Add / remove / update visitors
  const handleAddVisitor = () => {
    const newVisitor: VisitVisitor = {
      id: `vis-${Date.now()}-${visitors.length + 1}`,
      name: '',
      role: 'academic_supervisor'
    };
    setVisitors(prev => [...prev, newVisitor]);
    triggerAutoSave();
  };

  const handleRemoveVisitor = (id: string) => {
    if (visitors.length <= 1) return; // Keep at least one visitor
    setVisitors(prev => prev.filter(v => v.id !== id));
    triggerAutoSave();
  };

  const handleVisitorChange = (id: string, field: 'name' | 'role', value: string) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    triggerAutoSave();
  };

  // Quick visit selected indicator IDs (in quick visit, observer chooses 4-8 indicators)
  const [selectedQuickIndicatorIds, setSelectedQuickIndicatorIds] = useState<number[]>(() => {
    if (editingVisit?.visitType === 'quick') {
      return editingVisit.indicators.map(i => i.indicatorId);
    }
    return POTENTIAL_VISIT_GOALS[0]?.suggestedIndicatorIds || [2, 4, 7, 9, 14, 19, 21];
  });

  // Indicators Results
  const [indicatorResults, setIndicatorResults] = useState<Record<number, { rating: IndicatorRating; notes: string }>>(() => {
    const initial: Record<number, { rating: IndicatorRating; notes: string }> = {};
    if (editingVisit && editingVisit.indicators.length > 0) {
      editingVisit.indicators.forEach(res => {
        const migratedRating: IndicatorRating = res.rating === 'yes' ? 'outstanding'
          : res.rating === 'needs_improvement' ? 'acceptable'
          : res.rating === 'no' ? 'weak' : res.rating;
        initial[res.indicatorId] = { rating: migratedRating, notes: res.notes || '' };
      });
    } else {
      OFFICIAL_INDICATORS.forEach(ind => {
        initial[ind.id] = { rating: 'not_observed', notes: '' };
      });
    }
    return initial;
  });

  // General Domains Ratings (10 domains)
  const [domainRatings, setDomainRatings] = useState<Record<string, DomainPerformanceLevel>>(() => {
    const initial: Record<string, DomainPerformanceLevel> = {};
    if (editingVisit && editingVisit.domains.length > 0) {
      editingVisit.domains.forEach(d => { initial[d.domainId] = d.rating; });
    } else {
      GENERAL_DOMAINS.forEach(d => { initial[d.id] = 'good'; });
    }
    return initial;
  });
  const [domainCustomText, setDomainCustomText] = useState(() => {
    const other = editingVisit?.domains.find(d => d.domainId === 'other')?.domainName || '';
    return other.startsWith('أخرى - ') ? other.slice('أخرى - '.length) : '';
  });

  // e-Learning Maturity
  const [eLearningMaturity, setELearningMaturity] = useState<ELearningMaturityLevel>(
    editingVisit?.eLearningMaturity || 'good'
  );

  // Recommendations & Strengths Banks (Multi-choice selectable banks)
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>(() => {
    if (editingVisit?.strengths && editingVisit.strengths.length > 0) {
      return editingVisit.strengths;
    }
    return [
      isEn 
        ? PRESET_RECOMMENDATION_BANKS.strengths[0].textEn 
        : PRESET_RECOMMENDATION_BANKS.strengths[0].textAr,
      isEn 
        ? PRESET_RECOMMENDATION_BANKS.strengths[1].textEn 
        : PRESET_RECOMMENDATION_BANKS.strengths[1].textAr
    ];
  });

  const [selectedGrowth, setSelectedGrowth] = useState<string[]>(() => {
    if (editingVisit?.improvementAreas && editingVisit.improvementAreas.length > 0) {
      return editingVisit.improvementAreas;
    }
    return [
      isEn 
        ? PRESET_RECOMMENDATION_BANKS.improvementAreas[0].textEn 
        : PRESET_RECOMMENDATION_BANKS.improvementAreas[0].textAr
    ];
  });

  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>(() => {
    if (editingVisit?.practicalRecommendations) {
      return editingVisit.practicalRecommendations.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return [
      isEn 
        ? PRESET_RECOMMENDATION_BANKS.practicalRecommendations[0].textEn 
        : PRESET_RECOMMENDATION_BANKS.practicalRecommendations[0].textAr
    ];
  });

  const [selectedFollowUps, setSelectedFollowUps] = useState<string[]>(() => {
    if (editingVisit?.suggestedFollowUpPlan) return editingVisit.suggestedFollowUpPlan.split('\n').map(s => s.trim()).filter(Boolean);
    return [isEn ? PRESET_RECOMMENDATION_BANKS.followUpPlans[0].textEn : PRESET_RECOMMENDATION_BANKS.followUpPlans[0].textAr];
  });
  const [customStrength, setCustomStrength] = useState('');
  const [customGrowth, setCustomGrowth] = useState('');
  const [customRecommendation, setCustomRecommendation] = useState('');
  const [customFollowUp, setCustomFollowUp] = useState('');

  const [strengthsText, setStrengthsText] = useState<string>(() => selectedStrengths.join('\n'));
  const [improvementAreasText, setImprovementAreasText] = useState<string>(() => selectedGrowth.join('\n'));
  const [practicalRecommendations, setPracticalRecommendations] = useState<string>(() => selectedRecommendations.join('\n'));
  const [suggestedFollowUpPlan, setSuggestedFollowUpPlan] = useState<string>(() => selectedFollowUps.join('\n'));

  // Sync state helper functions for banks
  const handleToggleStrength = (text: string) => {
    setSelectedStrengths(prev => {
      const exists = prev.includes(text);
      const next = exists ? prev.filter(t => t !== text) : [...prev, text];
      setStrengthsText(next.join('\n'));
      return next;
    });
    triggerAutoSave();
  };

  const handleToggleGrowth = (text: string) => {
    setSelectedGrowth(prev => {
      const exists = prev.includes(text);
      const next = exists ? prev.filter(t => t !== text) : [...prev, text];
      setImprovementAreasText(next.join('\n'));
      return next;
    });
    triggerAutoSave();
  };

  const handleToggleRecommendation = (text: string) => {
    setSelectedRecommendations(prev => {
      const exists = prev.includes(text);
      const next = exists ? prev.filter(t => t !== text) : [...prev, text];
      setPracticalRecommendations(next.join('\n'));
      return next;
    });
    triggerAutoSave();
  };

  const handleToggleFollowUp = (text: string) => {
    setSelectedFollowUps(prev => {
      const exists = prev.includes(text);
      const next = exists ? prev.filter(t => t !== text) : [...prev, text];
      setSuggestedFollowUpPlan(next.join('\n'));
      return next;
    });
    triggerAutoSave();
  };

  // Add evaluator-defined entries to each qualitative bank
  const handleAddCustomStrength = () => { const value = customStrength.trim(); if (!value) return; const next = [...selectedStrengths, value]; setSelectedStrengths(next); setStrengthsText(next.join('\n')); setCustomStrength(''); triggerAutoSave(); };
  const handleAddCustomGrowth = () => { const value = customGrowth.trim(); if (!value) return; const next = [...selectedGrowth, value]; setSelectedGrowth(next); setImprovementAreasText(next.join('\n')); setCustomGrowth(''); triggerAutoSave(); };
  const handleAddCustomRecommendation = () => { const value = customRecommendation.trim(); if (!value) return; const next = [...selectedRecommendations, value]; setSelectedRecommendations(next); setPracticalRecommendations(next.join('\n')); setCustomRecommendation(''); triggerAutoSave(); };
  const handleAddCustomFollowUp = () => { const value = customFollowUp.trim(); if (!value) return; const next = [...selectedFollowUps, value]; setSelectedFollowUps(next); setSuggestedFollowUpPlan(next.join('\n')); setCustomFollowUp(''); triggerAutoSave(); };

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const autoSaveTimerRef = useRef<any>(null);

  const resolveTeacherSubject = (specialization: string): string => {
    const normalized = (specialization || '').trim().toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[\sـ_-]/g, '');
    const aliases: Record<string, string[]> = {
      'العلوم العامة': ['علوم', 'العلوم', 'science', 'generalscience'],
      'الرياضيات': ['رياضيات', 'math', 'mathematics'],
      'اللغة العربية': ['عربي', 'اللغةالعربية', 'arabic'],
      'اللغة الإنجليزية': ['انجليزي', 'اللغةالانجليزية', 'english'],
      'التربية الإسلامية': ['اسلامية', 'التربيةالاسلامية', 'islamic'],
      'الدراسات الاجتماعية والتربية الأخلاقية': ['اجتماعيات', 'دراساتاجتماعية', 'socialstudies'],
      'الحوسبة والتصميم الابتكاري': ['حوسبة', 'تصميمابتكاري', 'computing'],
      'الفنون البصرية والموسيقية': ['فنون', 'فنونبصرية', 'arts'],
      'التربية البدنية والصحية': ['رياضة', 'تربيةبدنية', 'physicaleducation']
    };
    const exact = academicSettings.subjects.find(s => s.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[\sـ_-]/g, '') === normalized);
    if (exact) return exact;
    for (const [canonical, variants] of Object.entries(aliases)) {
      if (variants.some(v => v.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[\sـ_-]/g, '') === normalized)) {
        return academicSettings.subjects.find(s => s === canonical) || '';
      }
    }
    return '';
  };

  // Populate all teacher details from the selected directory record; visit-specific class/attendance stay blank.
  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    const tch = teachers.find(t => t.id === teacherId);
    setTeacherName(tch?.fullName || '');
    setTeacherJobNumber(tch?.jobNumber || '');
    setTeacherSpecialization(tch?.specialization || '');
    setSubject(tch ? resolveTeacherSubject(tch.specialization || '') : '');
    setGrade(''); setSection('');
    setTotalStudents(''); setAttendedStudents(''); setAbsentStudents('');
  };

  // Group potential visit goals by category for the dropdown
  const groupedPotentialGoals = POTENTIAL_VISIT_GOALS.reduce((acc, goal) => {
    if (!acc[goal.category]) acc[goal.category] = [];
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, typeof POTENTIAL_VISIT_GOALS>);

  // Goal preset change handler
  const handleGoalPresetChange = (presetId: string) => {
    setSelectedGoalPresetId(presetId);
    if (presetId === 'custom') {
      setVisitGoal('');
      triggerAutoSave();
      return;
    }
    const preset = POTENTIAL_VISIT_GOALS.find(g => g.id === presetId);
    if (preset) {
      setVisitGoal(preset.text);
      if (visitType === 'quick') {
        setSelectedQuickIndicatorIds(preset.suggestedIndicatorIds);
      }
      triggerAutoSave();
    }
  };

  const handleReapplySuggestedIndicators = () => {
    const preset = POTENTIAL_VISIT_GOALS.find(g => g.id === selectedGoalPresetId);
    if (preset && preset.suggestedIndicatorIds.length > 0) {
      setSelectedQuickIndicatorIds(preset.suggestedIndicatorIds);
      triggerAutoSave();
    }
  };

  // Active indicators list (full = all 22, quick = selected subset)
  const activeIndicatorsList = visitType === 'full' 
    ? OFFICIAL_INDICATORS 
    : OFFICIAL_INDICATORS.filter(ind => selectedQuickIndicatorIds.includes(ind.id));

  // Compute live achievement percentage
  const computeLiveAchievement = () => {
    const currentResults: VisitIndicatorResult[] = activeIndicatorsList.map(ind => ({
      indicatorId: ind.id,
      indicatorText: isEn ? (ind.textEn || ind.text) : ind.text,
      indicatorGroup: isEn ? (ind.groupEn || ind.group) : ind.group,
      rating: indicatorResults[ind.id]?.rating || 'not_observed',
      notes: indicatorResults[ind.id]?.notes || ''
    }));

    return AtharStorageService.calculateAchievement(currentResults);
  };

  const liveAchievement = computeLiveAchievement();

  // Debounced auto-save
  const triggerAutoSave = () => {
    setAutoSaveStatus('saving');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveVisitToStorage('draft', false);
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // Indicator rating change
  const handleRatingChange = (id: number, rating: IndicatorRating) => {
    setIndicatorResults(prev => ({
      ...prev,
      [id]: {
        rating,
        notes: prev[id]?.notes || ''
      }
    }));
    triggerAutoSave();
  };

  // Indicator note change
  const handleNoteChange = (id: number, notes: string) => {
    setIndicatorResults(prev => ({
      ...prev,
      [id]: {
        rating: prev[id]?.rating || 'not_observed',
        notes
      }
    }));
    triggerAutoSave();
  };

  // Build complete visit object
  const buildVisitObject = (finalStatus: ClassroomVisit['status']): ClassroomVisit => {
    const activeResultsArray: VisitIndicatorResult[] = activeIndicatorsList.map(ind => ({
      indicatorId: ind.id,
      indicatorText: isEn ? (ind.textEn || ind.text) : ind.text,
      indicatorGroup: isEn ? (ind.groupEn || ind.group) : ind.group,
      rating: indicatorResults[ind.id]?.rating || 'not_observed',
      notes: indicatorResults[ind.id]?.notes || ''
    }));

    const formattedDomains: DomainEvaluation[] = GENERAL_DOMAINS.map(d => ({
      domainId: d.id,
      domainName: d.id === 'other' && domainCustomText.trim() ? `${d.name} - ${domainCustomText.trim()}` : (isEn ? (d.nameEn || d.name) : d.name),
      rating: domainRatings[d.id] || 'good'
    }));

    const strengths = strengthsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const improvementAreas = improvementAreasText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    return {
      id: visitId,
      schoolId: 'sch_alsadara_01',
      academicYear,
      term,
      visitType,
      teacherId: selectedTeacherId,
      teacherName,
      teacherJobNumber,
      teacherSpecialization,
      grade,
      section,
      subject,
      evaluatorId: currentUser.id,
      evaluatorName: currentUser.name,
      date,
      time,
      visitGoal,
      status: finalStatus,

      // New Student Demographics & Attendance
      totalStudents: totalStudents === '' ? undefined : Number(totalStudents),
      attendedStudents: attendedStudents === '' ? undefined : Number(attendedStudents),
      absentStudents: absentStudents === '' ? undefined : Number(absentStudents),
      studentGender,

      // Multiple Visitors support
      visitorRole: visitors[0]?.role || 'evaluator',
      visitors,

      indicators: activeResultsArray,
      domains: formattedDomains,
      eLearningMaturity,
      strengths,
      improvementAreas,
      practicalRecommendations,
      suggestedFollowUpPlan: suggestedFollowUpPlan.trim() || undefined,
      achievementPercentage: liveAchievement.percentage,
      observedIndicatorsCount: liveAchievement.observedCount,
      totalIndicatorsCount: liveAchievement.totalCount,
      createdAt: editingVisit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Save handler
  const saveVisitToStorage = (finalStatus: ClassroomVisit['status'], isExplicitFinish: boolean) => {
    const visitObj = buildVisitObject(finalStatus);
    const res = AtharStorageService.saveVisit(visitObj);

    if (res.success) {
      setAutoSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString(isEn ? 'en-US' : 'ar-AE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (isExplicitFinish && res.visit) {
        onSaveSuccess(res.visit);
      }
    } else {
      setAutoSaveStatus('error');
      if (isExplicitFinish) {
        alert(res.error || (isEn ? 'An error occurred while saving the visit.' : 'حدث خطأ أثناء حفظ الزيارة.'));
      }
    }
  };

  // Group indicators by categories
  const groupedIndicators = activeIndicatorsList.reduce((acc, ind) => {
    const grp = isEn ? (ind.groupEn || ind.group) : ind.group;
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(ind);
    return acc;
  }, {} as Record<string, typeof OFFICIAL_INDICATORS>);

  // Attendance rate display
  const attendanceRate = (typeof totalStudents === 'number' && totalStudents > 0 && typeof attendedStudents === 'number')
    ? Math.round((attendedStudents / totalStudents) * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Wizard Header Bar & Auto-Save Indicator */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#668575] font-semibold mb-1">
            <span>{editingVisit ? (isEn ? 'Edit & Complete Visit' : 'تعديل واستكمال زيارة') : (isEn ? 'Conduct New Classroom Visit' : 'إجراء زيارة صفية جديدة')}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[#172C40]">{visitId}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#C6A66A] font-bold">
              {visitType === 'full' 
                ? (isEn ? 'Full Visit (Complete Lesson)' : 'الزيارة الكاملة (الحصة كاملة)') 
                : (isEn ? 'Quick Walkthrough (10-15 min)' : 'الزيارة السريعة (10-15 دقيقة)')}
            </span>
          </div>
          <h2 className="text-xl font-black text-[#172C40] font-['Tajawal']">
            {isEn ? 'Classroom Observation & Qualitative Evaluation Form' : 'نموذج الملاحظة الصفية والتقييم النوعي'}
          </h2>
        </div>

        {/* Live Auto-Save & Achievement Meter */}
        <div className="flex items-center gap-4 bg-[#F8FAFC] border border-slate-200 px-4 py-2 rounded-lg text-xs">
          <div className={`${isEn ? 'text-left pr-3 border-r' : 'text-right pl-3 border-l'} border-slate-200`}>
            <span className="text-[10px] text-slate-500 block">{isEn ? 'Live Achievement %' : 'نسبة الإنجاز الحالية'}</span>
            <span className="text-base font-extrabold text-[#172C40] tabular-nums">
              {liveAchievement.percentage}%
            </span>
            <span className="text-[10px] text-slate-400 block">
              {isEn 
                ? `(${liveAchievement.observedCount} of ${liveAchievement.totalCount} observed)` 
                : `(${liveAchievement.observedCount} من ${liveAchievement.totalCount} مؤشرات رُصدت)`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {autoSaveStatus === 'saving' ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                {t.visits.autoSaving}
              </span>
            ) : autoSaveStatus === 'saved' ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.visits.autoSaveSaved} {lastSavedTime ? `(${lastSavedTime})` : ''}
              </span>
            ) : (
              <span className="text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {isEn ? 'Save Failed' : 'تعذر الحفظ'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-200/60 p-1.5 rounded-xl text-xs font-bold text-center">
        <button
          onClick={() => setCurrentStep(1)}
          className={`py-2 px-3 rounded-lg transition-all ${
            currentStep === 1 ? 'bg-[#172C40] text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          {t.visits.step1}
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          className={`py-2 px-3 rounded-lg transition-all ${
            currentStep === 2 ? 'bg-[#172C40] text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          {t.visits.step2}
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className={`py-2 px-3 rounded-lg transition-all ${
            currentStep === 3 ? 'bg-[#172C40] text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          {t.visits.step3}
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className={`py-2 px-3 rounded-lg transition-all ${
            currentStep === 4 ? 'bg-[#172C40] text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          {isEn ? '4. e-Learning & Strengths' : '4. نضج التعلم الإلكتروني والتوصيات'}
        </button>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: Basic Information, Student Attendance & Multi-Visitors */}
      {/* ============================================================== */}
      {currentStep === 1 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6 text-xs">
          
          {/* Visit Type Selector */}
          <div>
            <label className="block font-bold text-[#172C40] mb-2">{t.visits.visitTypePrompt}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label 
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                  visitType === 'full' 
                    ? 'border-[#172C40] bg-[#172C40]/5' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="visitType"
                  value="full"
                  checked={visitType === 'full'}
                  onChange={() => { setVisitType('full'); setVisitGoal(isEn ? 'Official Visit' : 'زيارة رسمية'); setSelectedGoalPresetId('official'); triggerAutoSave(); }}
                  className="mt-1"
                />
                <div>
                  <div className="font-extrabold text-[#172C40] text-sm font-['Tajawal']">{t.visits.fullVisitLabel}</div>
                  <p className="text-slate-500 text-[11px] mt-1">{t.visits.fullVisitDesc}</p>
                </div>
              </label>

              <label 
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                  visitType === 'quick' 
                    ? 'border-[#172C40] bg-[#172C40]/5' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="visitType"
                  value="quick"
                  checked={visitType === 'quick'}
                  onChange={() => { setVisitType('quick'); setVisitGoal(POTENTIAL_VISIT_GOALS[0]?.text || ''); setSelectedGoalPresetId(POTENTIAL_VISIT_GOALS[0]?.id || 'custom'); triggerAutoSave(); }}
                  className="mt-1"
                />
                <div>
                  <div className="font-extrabold text-[#172C40] text-sm font-['Tajawal']">{t.visits.quickVisitLabel}</div>
                  <p className="text-slate-500 text-[11px] mt-1">{t.visits.quickVisitDesc}</p>
                </div>
              </label>
            </div>
          </div>

          {/* Teacher Selection with Job ID & Specialization Autofill */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.visits.teacherLabel} *</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => { handleTeacherChange(e.target.value); triggerAutoSave(); }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-[#172C40] focus:outline-none focus:border-[#172C40]"
              >
                <option value="">{isEn ? 'Choose a teacher' : 'اختر اسم المعلم'}</option>
                {teachers.map(tch => (
                  <option key={tch.id} value={tch.id}>
                    {tch.fullName} ({tch.jobNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.teachers.jobNumberLabel}</label>
              <input
                type="text"
                readOnly
                value={teacherJobNumber}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.teachers.specLabel}</label>
              <input
                type="text"
                readOnly
                value={teacherSpecialization}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Academic Session Details (Grade, Section, Subject) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.visits.grade} *</label>
              <select
                value={grade}
                onChange={(e) => { setGrade(e.target.value); triggerAutoSave(); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="">{isEn ? 'Choose grade' : 'اختر الصف'}</option>
                {academicSettings.grades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.visits.section} *</label>
              <select
                value={section}
                onChange={(e) => { setSection(e.target.value); triggerAutoSave(); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="">{isEn ? 'Choose section' : 'اختر الشعبة'}</option>
                {Array.from({ length: academicSettings.sectionsCount || 4 }).map((_, i) => (
                  <option key={i} value={isEn ? `Section ${i + 1}` : `الشعبة ${i + 1}`}>
                    {isEn ? `Section ${i + 1}` : `الشعبة ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.visits.subject} *</label>
              <select
                value={subject}
                disabled={!selectedTeacherId || !subject}
                onChange={(e) => { setSubject(e.target.value); triggerAutoSave(); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">{!selectedTeacherId ? (isEn ? 'Select teacher first' : 'اختر المعلم أولاً') : (isEn ? 'No matching subject in teacher record' : 'لا يوجد تخصص مطابق في بيانات المعلم')}</option>
                {academicSettings.subjects.filter(s => s === subject).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time, Term, Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.visits.academicYear}</label>
              <input
                type="text"
                readOnly
                value={academicYear}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.visits.term} *</label>
              <select
                value={term}
                onChange={(e) => { setTerm(e.target.value); triggerAutoSave(); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="">{isEn ? 'Choose academic term' : 'اختر الفصل الدراسي'}</option>
                {academicSettings.terms.map(tm => (
                  <option key={tm} value={tm}>{tm}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.visits.visitDate} *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); triggerAutoSave(); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#172C40] mb-1">{t.visits.visitTime} *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => { setTime(e.target.value); triggerAutoSave(); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* NEW SECTION 1: Student Demographics & Attendance (الطلبة والحضور) */}
          {/* ============================================================== */}
          <div className="p-5 rounded-xl bg-[#F8FAFC] border-2 border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#C6A66A]" />
                <div>
                  <h4 className="font-extrabold text-[#172C40] text-sm font-['Tajawal']">
                    {t.attendance.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{t.attendance.subtitle}</p>
                </div>
              </div>

              {attendanceRate !== null && (
                <div className="bg-[#668575]/10 border border-[#668575]/30 text-[#668575] font-bold px-3 py-1 rounded-lg text-xs self-start sm:self-auto">
                  {t.attendance.attendanceRate}: <span className="font-mono font-black">{attendanceRate}%</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Student Gender (نوع الطلاب: ذكور - إناث - مختلط) */}
              <div>
                <label className="block font-bold text-[#172C40] mb-1">
                  {t.attendance.studentGender} *
                </label>
                <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-300">
                  <button
                    type="button"
                    onClick={() => { setStudentGender('boys'); triggerAutoSave(); }}
                    className={`py-1.5 px-1 rounded text-center font-bold text-[11px] transition-all cursor-pointer ${
                      studentGender === 'boys' 
                        ? 'bg-[#172C40] text-white shadow-2xs' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.studentGender.boys}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStudentGender('girls'); triggerAutoSave(); }}
                    className={`py-1.5 px-1 rounded text-center font-bold text-[11px] transition-all cursor-pointer ${
                      studentGender === 'girls' 
                        ? 'bg-[#172C40] text-white shadow-2xs' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.studentGender.girls}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStudentGender('mixed'); triggerAutoSave(); }}
                    className={`py-1.5 px-1 rounded text-center font-bold text-[11px] transition-all cursor-pointer ${
                      studentGender === 'mixed' 
                        ? 'bg-[#172C40] text-white shadow-2xs' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.studentGender.mixed}
                  </button>
                </div>
              </div>

              {/* Total Students (عدد الطلاب الإجمالي) */}
              <div>
                <label className="block font-bold text-[#172C40] mb-1">
                  {t.attendance.totalStudents} *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={totalStudents}
                  onChange={(e) => handleTotalStudentsChange(e.target.value)}
                  placeholder={t.attendance.enterTotal}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-[#172C40] focus:outline-none focus:border-[#172C40]"
                />
              </div>

              {/* Attended Students (عدد الحضور) */}
              <div>
                <label className="block font-bold text-[#172C40] mb-1">
                  {t.attendance.attendedStudents} *
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalStudents !== '' ? totalStudents : 100}
                  value={attendedStudents}
                  onChange={(e) => handleAttendedStudentsChange(e.target.value)}
                  placeholder={t.attendance.enterAttended}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Absent Students (عدد الغياب) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#172C40]">
                    {t.attendance.absentStudents}
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">{t.attendance.autoCalcHint}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={totalStudents !== '' ? totalStudents : 100}
                  value={absentStudents}
                  onChange={(e) => handleAbsentStudentsChange(e.target.value)}
                  placeholder={t.attendance.enterAbsent}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-rose-700 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* NEW SECTION 2: Multiple Visitors Team (تعدد الزائرين ووظائفهم) */}
          {/* ============================================================== */}
          <div className="p-5 rounded-xl bg-[#F2EBDD]/25 border-2 border-[#C6A66A]/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C6A66A]/30 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#172C40]" />
                <div>
                  <h4 className="font-extrabold text-[#172C40] text-sm font-['Tajawal']">
                    {t.visitorsSection.title}
                  </h4>
                  <p className="text-[11px] text-slate-600">{t.visitorsSection.subtitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddVisitor}
                className="px-3 py-1.5 bg-[#172C40] text-white hover:bg-[#101F2D] rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#C6A66A]" />
                <span>{t.visitorsSection.addVisitor}</span>
              </button>
            </div>

            {/* List of visitors */}
            <div className="space-y-3">
              {visitors.map((visitor, idx) => (
                <div 
                  key={visitor.id} 
                  className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-6 h-6 rounded-full bg-[#172C40] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {idx === 0 ? t.visitorsSection.primaryVisitor : `${t.visitorsSection.additionalVisitors} #${idx + 1}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    {/* Visitor Name with Quick-Pick */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-[#172C40]" />
                          <span>
                            {idx === 0 
                              ? (isEn ? 'Primary Evaluator / Submitter:' : 'الزائر الأساسي / مدخل التقييم:') 
                              : (isEn ? `Additional Visitor #${idx + 1}:` : `اسم الزائر الإضافي #${idx + 1}:`)}
                          </span>
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                            {isEn ? 'Logged-in Account' : 'الحساب المسجل حالياً'}
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        value={visitor.name}
                        onChange={(e) => handleVisitorChange(visitor.id, 'name', e.target.value)}
                        readOnly={idx === 0}
                        placeholder={t.visitorsSection.visitorName}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md font-bold text-[#172C40] focus:bg-white focus:outline-none focus:border-[#172C40]"
                      />
                    </div>

                    {/* Visitor Role with Icon and New Role Options */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <Briefcase className="w-4 h-4 text-[#C6A66A]" />
                        <span>{isEn ? 'Visitor / Evaluator Role:' : 'وظيفة الزائر / المقيم:'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={visitor.role}
                          disabled={idx === 0}
                          onChange={(e) => handleVisitorChange(visitor.id, 'role', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md font-bold text-[#172C40] focus:bg-white focus:outline-none focus:border-[#172C40]"
                        >
                          <option value="evaluator">{t.visitorRoles.evaluator}</option>
                          <option value="head_of_arabic">{t.visitorRoles.head_of_arabic || 'رئيس هيئة تدريس المواد العربية'}</option>
                          <option value="department_head">{t.visitorRoles.department_head || 'رئيس قسم'}</option>
                          <option value="cluster_director">{t.visitorRoles.cluster_director}</option>
                          <option value="principal">{t.visitorRoles.principal}</option>
                          <option value="vice_principal">{t.visitorRoles.vice_principal}</option>
                          <option value="academic_supervisor">{t.visitorRoles.academic_supervisor}</option>
                          <option value="admin">{t.visitorRoles.admin}</option>
                          <option value="teacher">{t.visitorRoles.teacher}</option>
                          <option value="other">{t.visitorRoles.other}</option>
                        </select>

                        {visitors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVisitor(visitor.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title={t.visitorsSection.removeVisitor}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {idx === 0 && currentUser.specialization && (
                        <p className="text-[11px] font-semibold text-[#668575]">{currentUser.specialization}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visit Goal Dropdown & Editor */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 font-bold text-[#172C40] text-xs">
                <Target className="w-4 h-4 text-[#C6A66A]" />
                <span>{t.visits.visitGoal} *</span>
              </label>

              {visitType === 'quick' && (
                <span className="text-[11px] text-[#668575] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 self-start sm:self-auto">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Quick visit (10-15 min) requires a focused goal' : 'الزيارة السريعة (10-15 دقيقة) تتطلب هدفاً نوعياً مركزاً'}</span>
                </span>
              )}
            </div>

            {/* Dropdown containing all potential visit goals */}
            <div className="relative">
              {visitType === 'full' ? (
                <div className="rounded-lg border-2 border-[#C6A66A] bg-[#F2EBDD] px-4 py-3 font-extrabold text-[#172C40]">
                  {isEn ? 'Official Visit' : 'زيارة رسمية'}
                </div>
              ) : (
                <select
                  value={selectedGoalPresetId}
                  onChange={(e) => handleGoalPresetChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#172C40]/20 hover:border-[#172C40]/40 rounded-lg text-xs font-bold text-[#172C40] focus:outline-none focus:border-[#172C40]"
                >
                  <option value="" disabled>{t.visits.choosePresetGoal}</option>
                  {Object.entries(groupedPotentialGoals).map(([categoryName, goals]) => (
                    <optgroup key={categoryName} label={`📌 ${categoryName}`}>
                      {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.text}</option>)}
                    </optgroup>
                  ))}
                  <option value="custom">{isEn ? 'Other – write a custom goal' : 'أخرى – كتابة هدف غير مدرج'}</option>
                </select>
              )}
            </div>

            {/* Editable goal text */}
            {visitType === 'quick' && (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={visitGoal}
                  onChange={(e) => { setVisitGoal(e.target.value); setSelectedGoalPresetId('custom'); triggerAutoSave(); }}
                  placeholder={isEn ? 'Write one or more targeted goals...' : 'اكتب هدف الزيارة السريعة، ويمكنك إضافة أكثر من هدف...'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-[#172C40] focus:outline-none focus:border-[#172C40]"
                />
                <button type="button" onClick={() => { setVisitGoal(prev => prev ? `${prev}\n` : ''); setSelectedGoalPresetId('custom'); triggerAutoSave(); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#172C40] text-white font-bold text-xs hover:bg-[#101F2D]">
                  <Plus className="w-4 h-4 text-[#C6A66A]" /> {isEn ? 'Add another goal' : 'إضافة هدف آخر'}
                </button>
              </div>
            )}

            {/* Re-apply indicators button for quick visits */}
            {visitType === 'quick' && selectedGoalPresetId !== 'custom' && (
              <div className="flex items-center justify-between pt-1 text-[11px] text-[#668575]">
                <span>
                  {isEn 
                    ? `Suggested indicators for this goal: (${POTENTIAL_VISIT_GOALS.find(g => g.id === selectedGoalPresetId)?.suggestedIndicatorIds.length || 0}) indicators` 
                    : `يرتبط هذا الهدف المقترح بـ (${POTENTIAL_VISIT_GOALS.find(g => g.id === selectedGoalPresetId)?.suggestedIndicatorIds.length || 0}) مؤشرات محددة.`}
                </span>
                <button
                  type="button"
                  onClick={handleReapplySuggestedIndicators}
                  className="font-bold underline text-[#172C40] hover:text-[#C6A66A] cursor-pointer"
                >
                  {isEn ? 'Re-apply Suggested Indicators' : 'تطبيق المؤشرات المقترحة لهذا الهدف'}
                </button>
              </div>
            )}
          </div>

          {/* Quick visit indicator selector */}
          {visitType === 'quick' && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-amber-900">{t.visits.selectIndicatorsForQuick}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleReapplySuggestedIndicators}
                    className="text-[#172C40] hover:text-[#C6A66A] font-bold underline cursor-pointer"
                  >
                    {isEn ? 'Apply Goal Preset' : 'تطبيق مقترح الهدف'}
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedQuickIndicatorIds(OFFICIAL_INDICATORS.map(i => i.id)); triggerAutoSave(); }}
                    className="text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {t.common.all}
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedQuickIndicatorIds([]); triggerAutoSave(); }}
                    className="text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {isEn ? 'Clear' : 'مسح'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                {OFFICIAL_INDICATORS.map(ind => {
                  const currentPreset = POTENTIAL_VISIT_GOALS.find(g => g.id === selectedGoalPresetId);
                  const isSuggested = currentPreset?.suggestedIndicatorIds.includes(ind.id);
                  const isChecked = selectedQuickIndicatorIds.includes(ind.id);
                  const indText = isEn ? (ind.textEn || ind.text) : ind.text;

                  return (
                    <label 
                      key={ind.id} 
                      className={`flex items-start justify-between gap-2 p-2.5 rounded-lg border cursor-pointer text-[11px] transition-all ${
                        isChecked 
                          ? 'bg-white border-[#172C40] shadow-2xs' 
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQuickIndicatorIds(prev => [...prev, ind.id]);
                            } else {
                              setSelectedQuickIndicatorIds(prev => prev.filter(x => x !== ind.id));
                            }
                            triggerAutoSave();
                          }}
                          className="mt-0.5 cursor-pointer"
                        />
                        <span className="text-[#172C40] leading-snug">
                          <strong>{ind.id}.</strong> {indText}
                        </span>
                      </div>
                      {isSuggested && (
                        <span className="shrink-0 text-[9px] font-bold text-[#668575] bg-[#F2EBDD] border border-[#C6A66A]/40 px-1.5 py-0.5 rounded">
                          {isEn ? 'Suggested' : 'مقترح للهدف'}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-800 pt-1 border-t border-amber-200/60">
                <span>{isEn ? `Selected Indicators: (${selectedQuickIndicatorIds.length}) of 22.` : `المؤشرات المختارة حالياً: (${selectedQuickIndicatorIds.length}) مؤشراً من أصل 22.`}</span>
                <span className="text-slate-500">{isEn ? 'Recommended: 4 to 8 indicators for 10-15 min walkthrough.' : 'الحد الموصى به: من 4 إلى 8 مؤشرات لزيارة الـ 10-15 دقيقة.'}</span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] flex items-center gap-2 cursor-pointer"
            >
              <span>{isEn ? 'Proceed to Indicators Matrix' : 'متابعة إلى مصفوفة المؤشرات'}</span>
              {isEn ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: 22 Core Indicators Matrix */}
      {/* ============================================================== */}
      {currentStep === 2 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-8 text-xs">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
                {isEn ? `2. Classroom Indicators Matrix (${activeIndicatorsList.length} indicators)` : `2. مصفوفة الملاحظة الصفية (${activeIndicatorsList.length} مؤشراً)`}
              </h3>
              <p className="text-slate-500 mt-0.5">
                {isEn ? 'Verbal ratings: Excellent · Very Good · Good · Acceptable · Weak · Not Observed.' : 'التقديرات اللفظية: ممتاز · جيد جداً · جيد · مقبول · ضعيف · لم يُشاهد.'}
              </p>
            </div>
            <div className="text-xs bg-[#F2EBDD] text-[#172C40] font-bold px-3 py-1.5 rounded-lg border border-[#C6A66A]/30 self-start">
              {isEn ? 'Current Achievement:' : 'نسبة الإنجاز الحالية:'} {liveAchievement.percentage}%
            </div>
          </div>

          {/* Grouped indicators view */}
          <div className="space-y-8">
            {Object.entries(groupedIndicators).map(([groupName, indicators]) => (
              <div key={groupName} className="space-y-3">
                <div className={`flex items-center gap-2 bg-[#F8FAFC] ${isEn ? 'border-l-4' : 'border-r-4'} border-[#172C40] px-3 py-2 rounded`}>
                  <span className="font-extrabold text-[#172C40] text-sm font-['Tajawal']">{groupName}</span>
                  <span className="text-slate-400 text-[11px]">({indicators.length} {isEn ? 'indicators' : 'مؤشرات'})</span>
                </div>

                <div className="space-y-3">
                  {indicators.map((ind) => {
                    const currentRating = indicatorResults[ind.id]?.rating || 'not_observed';
                    const currentNote = indicatorResults[ind.id]?.notes || '';
                    const indText = isEn ? (ind.textEn || ind.text) : ind.text;
                    const indDesc = isEn ? (ind.descriptionEn || ind.description) : ind.description;

                    return (
                      <div 
                        key={ind.id} 
                        className={`p-4 rounded-xl border transition-all ${
                          currentRating === 'outstanding' || currentRating === 'very_good' ? 'bg-emerald-50/30 border-emerald-200' :
                          currentRating === 'good' ? 'bg-sky-50/30 border-sky-200' :
                          currentRating === 'acceptable' ? 'bg-amber-50/30 border-amber-200' :
                          currentRating === 'weak' ? 'bg-rose-50/30 border-rose-200' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2">
                          <div className="space-y-0.5 max-w-2xl">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {ind.code}
                              </span>
                              <span className="font-bold text-sm text-[#172C40]">
                                {indText}
                              </span>
                            </div>
                            {indDesc && (
                              <p className="text-[11px] text-slate-500 pr-1">
                                {indDesc}
                              </p>
                            )}
                          </div>

                          {/* Verbal Rating Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            {([
                              { value: 'outstanding', ar: 'ممتاز', en: 'Excellent', active: 'bg-emerald-700 text-white', idle: 'bg-white text-emerald-800 border border-emerald-300' },
                              { value: 'very_good', ar: 'جيد جداً', en: 'Very Good', active: 'bg-emerald-600 text-white', idle: 'bg-white text-emerald-800 border border-emerald-300' },
                              { value: 'good', ar: 'جيد', en: 'Good', active: 'bg-sky-700 text-white', idle: 'bg-white text-sky-800 border border-sky-300' },
                              { value: 'acceptable', ar: 'مقبول', en: 'Acceptable', active: 'bg-amber-600 text-white', idle: 'bg-white text-amber-800 border border-amber-300' },
                              { value: 'weak', ar: 'ضعيف', en: 'Weak', active: 'bg-rose-700 text-white', idle: 'bg-white text-rose-800 border border-rose-300' },
                              { value: 'not_observed', ar: 'لم يُشاهد', en: 'Not Observed', active: 'bg-slate-700 text-white', idle: 'bg-white text-slate-600 border border-slate-300' }
                            ] as const).map(option => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleRatingChange(ind.id, option.value)}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${currentRating === option.value ? option.active + ' shadow-xs' : option.idle + ' hover:brightness-95'}`}
                                title={option.value === 'not_observed' ? (isEn ? 'Excluded from calculation' : 'يُستبعد من احتساب النسبة') : option.ar}
                              >
                                {isEn ? option.en : option.ar}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Direct Qualitative Observation Note */}
                        <div className="pt-2 border-t border-slate-100">
                          <input
                            type="text"
                            placeholder={isEn ? 'Direct qualitative observation for this indicator (evidence / notes)...' : 'الملاحظة النوعية والشواهد المباشرة لهذا المؤشر تحديداً (اختياري)...'}
                            value={currentNote}
                            onChange={(e) => handleNoteChange(ind.id, e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50/60 border border-slate-200 rounded-md text-[11px] focus:bg-white focus:outline-none focus:border-[#172C40]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              {t.visits.btnPrevious}: {t.visits.step1}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] flex items-center gap-2 cursor-pointer"
            >
              <span>{isEn ? 'Proceed to 10 Domains' : 'متابعة إلى المجالات العامة العشرة'}</span>
              {isEn ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: 10 General Domains */}
      {/* ============================================================== */}
      {currentStep === 3 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
              {isEn ? '3. 10 General Performance Domains Assessment' : '3. تقييم المجالات العامة العشرة'}
            </h3>
            <p className="text-slate-500 mt-0.5">
              {t.visits.domainsMatrixNote}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GENERAL_DOMAINS.map((domain) => {
              const currentRating = domainRatings[domain.id] || 'good';
              const domainName = isEn ? (domain.nameEn || domain.name) : domain.name;

              return (
                <div key={domain.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-extrabold text-[#172C40] block text-sm font-['Tajawal']">{domainName}</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                    {(['outstanding', 'very_good', 'good', 'acceptable', 'weak', 'very_weak'] as DomainPerformanceLevel[]).map((level) => {
                      const isSelected = currentRating === level;
                      const label = t.ratings[level] || level;

                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setDomainRatings(prev => ({ ...prev, [domain.id]: level }));
                            triggerAutoSave();
                          }}
                          className={`py-1 px-1 rounded text-center font-bold text-[10px] transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#172C40] text-white shadow-2xs' 
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {domain.id === 'other' && (
                    <input type="text" value={domainCustomText} onChange={(e) => { setDomainCustomText(e.target.value); triggerAutoSave(); }} placeholder={isEn ? 'Specify the additional evaluation domain...' : 'اكتب المجال الإضافي الذي تريد تقييمه...'} className="w-full mt-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#172C40] focus:outline-none focus:border-[#172C40]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              {t.visits.btnPrevious}: {t.visits.step2}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] flex items-center gap-2 cursor-pointer"
            >
              <span>{isEn ? 'Proceed to e-Learning & Finalization' : 'متابعة إلى نضج التعلم والتوصيات'}</span>
              {isEn ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: e-Learning Maturity, Strengths & Recommendations */}
      {/* ============================================================== */}
      {currentStep === 4 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
              {isEn ? '4. e-Learning Maturity, Strengths & Final Approval' : '4. نضج التعلم الإلكتروني والتوصيات الإجرائية والاعتماد'}
            </h3>
            <p className="text-slate-500 mt-0.5">
              {isEn 
                ? 'Document technology integration maturity, observed strengths, growth areas, and official sign-off.' 
                : 'تدوين نضج التعلم الذكي، ونقاط القوة والممارسات المتميزة، ومجالات التحسين النوعية، والتوصيات الإجرائية.'}
            </p>
          </div>

          {/* e-Learning Maturity Level */}
          <div className="p-5 rounded-xl bg-[#F2EBDD]/40 border border-[#C6A66A]/40 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C6A66A]" />
              <span className="font-bold text-[#172C40] text-sm font-['Tajawal']">
                {t.visits.eLearningTitle}:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['weak', 'acceptable', 'good', 'very_good', 'excellent'] as ELearningMaturityLevel[]).map((level) => {
                const label = t.ratings[level] || level;

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => { setELearningMaturity(level); triggerAutoSave(); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      eLearningMaturity === level
                        ? 'bg-[#172C40] text-white shadow-xs'
                        : 'bg-white text-[#172C40] border border-slate-200 hover:bg-[#F2EBDD]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 1. Multi-Select Bank: Strengths (نقاط القوة والممارسات) */}
          {/* ========================================================= */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span className="font-extrabold text-emerald-950 text-sm font-['Tajawal']">
                  {t.recommendationBanks.strengthsTitle}
                </span>
                <span className="bg-emerald-200/60 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {selectedStrengths.length} {isEn ? 'selected' : 'محددة'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-800 font-semibold hidden md:inline">
                  {t.recommendationBanks.noTypingBadge}
                </span>
                {selectedStrengths.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStrengths([]);
                      setStrengthsText('');
                      triggerAutoSave();
                    }}
                    className="text-[11px] text-emerald-800 hover:text-rose-700 underline font-semibold cursor-pointer"
                  >
                    {t.recommendationBanks.clearSelection}
                  </button>
                )}
              </div>
            </div>

            {/* Selectable Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PRESET_RECOMMENDATION_BANKS.strengths.map((opt) => {
                const optText = isEn ? opt.textEn : opt.textAr;
                const isSelected = selectedStrengths.includes(optText);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleStrength(optText)}
                    className={`p-2.5 rounded-lg border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-200 fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className="text-[11px] leading-snug font-medium">{optText}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <input value={customStrength} onChange={e => setCustomStrength(e.target.value)} placeholder={isEn ? 'Add another strength...' : 'اكتب نقطة قوة أو ممارسة متميزة إضافية...'} className="flex-1 px-3 py-2 rounded-lg border border-emerald-300 bg-white text-xs" />
              <button type="button" onClick={handleAddCustomStrength} className="px-3 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1"><Plus className="w-4 h-4" />{isEn ? 'Add' : 'إضافة أخرى'}</button>
            </div>

            {/* Selected Pills Display */}
            {selectedStrengths.length > 0 && (
              <div className="pt-2 border-t border-emerald-200/50 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-emerald-900">{t.recommendationBanks.selectedCount}</span>
                {selectedStrengths.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 text-[10px] font-medium"
                  >
                    <span className="truncate max-w-xs">{s}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleStrength(s)}
                      className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 2. Multi-Select Bank: Areas for Growth (مجالات التحسين) */}
          {/* ========================================================= */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span className="font-extrabold text-amber-950 text-sm font-['Tajawal']">
                  {t.recommendationBanks.growthTitle}
                </span>
                <span className="bg-amber-200/60 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {selectedGrowth.length} {isEn ? 'selected' : 'محددة'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-800 font-semibold hidden md:inline">
                  {t.recommendationBanks.noTypingBadge}
                </span>
                {selectedGrowth.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGrowth([]);
                      setImprovementAreasText('');
                      triggerAutoSave();
                    }}
                    className="text-[11px] text-amber-800 hover:text-rose-700 underline font-semibold cursor-pointer"
                  >
                    {t.recommendationBanks.clearSelection}
                  </button>
                )}
              </div>
            </div>

            {/* Selectable Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PRESET_RECOMMENDATION_BANKS.improvementAreas.map((opt) => {
                const optText = isEn ? opt.textEn : opt.textAr;
                const isSelected = selectedGrowth.includes(optText);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleGrowth(optText)}
                    className={`p-2.5 rounded-lg border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-200 fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className="text-[11px] leading-snug font-medium">{optText}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <input value={customGrowth} onChange={e => setCustomGrowth(e.target.value)} placeholder={isEn ? 'Add another improvement area...' : 'اكتب مجال تحسين وتطوير إضافيًا...'} className="flex-1 px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs" />
              <button type="button" onClick={handleAddCustomGrowth} className="px-3 py-2 rounded-lg bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1"><Plus className="w-4 h-4" />{isEn ? 'Add' : 'إضافة أخرى'}</button>
            </div>

            {/* Selected Pills Display */}
            {selectedGrowth.length > 0 && (
              <div className="pt-2 border-t border-amber-200/50 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-amber-900">{t.recommendationBanks.selectedCount}</span>
                {selectedGrowth.map((g, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900 text-[10px] font-medium"
                  >
                    <span className="truncate max-w-xs">{g}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleGrowth(g)}
                      className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 3. Multi-Select Bank: Actionable Recommendations (التوصيات) */}
          {/* ========================================================= */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#172C40]" />
                <span className="font-extrabold text-[#172C40] text-sm font-['Tajawal']">
                  {t.recommendationBanks.recommendationsTitle}
                </span>
                <span className="bg-[#172C40] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {selectedRecommendations.length} {isEn ? 'selected' : 'محددة'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-semibold hidden md:inline">
                  {t.recommendationBanks.noTypingBadge}
                </span>
                {selectedRecommendations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecommendations([]);
                      setPracticalRecommendations('');
                      triggerAutoSave();
                    }}
                    className="text-[11px] text-slate-600 hover:text-rose-700 underline font-semibold cursor-pointer"
                  >
                    {t.recommendationBanks.clearSelection}
                  </button>
                )}
              </div>
            </div>

            {/* Selectable Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PRESET_RECOMMENDATION_BANKS.practicalRecommendations.map((opt) => {
                const optText = isEn ? opt.textEn : opt.textAr;
                const isSelected = selectedRecommendations.includes(optText);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleRecommendation(optText)}
                    className={`p-2.5 rounded-lg border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#172C40] text-white border-[#172C40] shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-[#172C40] hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#C6A66A] fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className="text-[11px] leading-snug font-medium">{optText}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <input value={customRecommendation} onChange={e => setCustomRecommendation(e.target.value)} placeholder={isEn ? 'Add another recommendation...' : 'اكتب توصية إجرائية إضافية...'} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs" />
              <button type="button" onClick={handleAddCustomRecommendation} className="px-3 py-2 rounded-lg bg-[#172C40] text-white font-bold text-xs inline-flex items-center gap-1"><Plus className="w-4 h-4 text-[#C6A66A]" />{isEn ? 'Add' : 'إضافة أخرى'}</button>
            </div>

            {/* Selected Pills Display */}
            {selectedRecommendations.length > 0 && (
              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-slate-700">{t.recommendationBanks.selectedCount}</span>
                {selectedRecommendations.map((r, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-300 text-[#172C40] text-[10px] font-medium"
                  >
                    <span className="truncate max-w-xs">{r}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleRecommendation(r)}
                      className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 4. Multi-Select Bank: Suggested Follow-up Plan (المتابعة) */}
          {/* ========================================================= */}
          <div className="p-4 rounded-xl bg-[#F2EBDD]/40 border border-[#C6A66A]/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C6A66A]/30 pb-2.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C6A66A]" />
                <span className="font-extrabold text-[#172C40] text-sm font-['Tajawal']">
                  {t.recommendationBanks.followUpTitle}
                </span>
                <span className="bg-[#C6A66A] text-[#172C40] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {selectedFollowUps.length} {isEn ? 'selected' : 'محددة'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-600 font-semibold hidden md:inline">
                  {t.recommendationBanks.noTypingBadge}
                </span>
                {selectedFollowUps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFollowUps([]);
                      setSuggestedFollowUpPlan('');
                      triggerAutoSave();
                    }}
                    className="text-[11px] text-[#172C40] hover:text-rose-700 underline font-semibold cursor-pointer"
                  >
                    {t.recommendationBanks.clearSelection}
                  </button>
                )}
              </div>
            </div>

            {/* Selectable Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PRESET_RECOMMENDATION_BANKS.followUpPlans.map((opt) => {
                const optText = isEn ? opt.textEn : opt.textAr;
                const isSelected = selectedFollowUps.includes(optText);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleFollowUp(optText)}
                    className={`p-2.5 rounded-lg border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#172C40] text-[#F2EBDD] border-[#172C40] shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-[#C6A66A] hover:bg-[#F2EBDD]/30'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#C6A66A] fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className="text-[11px] leading-snug font-medium">{optText}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <input value={customFollowUp} onChange={e => setCustomFollowUp(e.target.value)} placeholder={isEn ? 'Add another follow-up action...' : 'اكتب إجراء متابعة إضافيًا...'} className="flex-1 px-3 py-2 rounded-lg border border-[#C6A66A] bg-white text-xs" />
              <button type="button" onClick={handleAddCustomFollowUp} className="px-3 py-2 rounded-lg bg-[#172C40] text-white font-bold text-xs inline-flex items-center gap-1"><Plus className="w-4 h-4 text-[#C6A66A]" />{isEn ? 'Add' : 'إضافة أخرى'}</button>
            </div>

            {/* Selected Pills Display */}
            {selectedFollowUps.length > 0 && (
              <div className="pt-2 border-t border-[#C6A66A]/30 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-slate-700">{t.recommendationBanks.selectedCount}</span>
                {selectedFollowUps.map((f, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-[#C6A66A]/40 text-[#172C40] text-[10px] font-medium"
                  >
                    <span className="truncate max-w-xs">{f}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleFollowUp(f)}
                      className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Final Status Chooser */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-[#172C40]">{isEn ? 'Final Visit Status:' : 'حالة إنهاء الزيارة:'}</span>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="finalStatus"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                />
                <span className="font-semibold text-slate-800">
                  {isEn ? 'Completed (Ready for Review & Approval)' : 'مكتملة (جاهزة للمراجعة والاعتماد)'}
                </span>
              </label>

              {['school_admin', 'vice_principal'].includes(currentUser.role) && (
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="finalStatus"
                    value="approved"
                    checked={status === 'approved'}
                    onChange={() => setStatus('approved')}
                  />
                  <span className="font-semibold text-[#668575]">
                    {isEn ? 'Officially Approved (Final Issue)' : 'معتمدة رسمياً (إصدار نهائي)'}
                  </span>
                </label>
              )}

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="finalStatus"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                />
                <span className="font-semibold text-slate-600">
                  {isEn ? 'Draft (Temporary Save & Resume Later)' : 'مسودة (حفظ مؤقت واستكمال لاحقاً)'}
                </span>
              </label>
            </div>
          </div>

          {/* Final Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              {t.visits.btnPrevious}: {t.visits.step3}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => saveVisitToStorage('draft', true)}
                className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold hover:bg-slate-200 cursor-pointer"
              >
                {t.visits.btnSaveDraft}
              </button>

              <button
                type="button"
                onClick={() => saveVisitToStorage(status, true)}
                className="px-6 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <FileCheck className="w-4 h-4 text-[#C6A66A]" />
                <span>{isEn ? 'Complete Visit & Issue Official Report' : 'حفظ وإنهاء الزيارة وإصدار التقرير'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
