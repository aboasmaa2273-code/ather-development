import { Language } from '../i18n/translations';
import { OFFICIAL_INDICATORS, PRESET_RECOMMENDATION_BANKS, POTENTIAL_VISIT_GOALS, GENERAL_DOMAINS } from '../data/defaultData';

export const SUBJECT_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  'اللغة العربية': { ar: 'اللغة العربية', en: 'Arabic Language' },
  'Arabic': { ar: 'اللغة العربية', en: 'Arabic Language' },
  'الرياضيات': { ar: 'الرياضيات', en: 'Mathematics' },
  'Mathematics': { ar: 'الرياضيات', en: 'Mathematics' },
  'العلوم العامة': { ar: 'العلوم العامة', en: 'General Science' },
  'General Science': { ar: 'العلوم العامة', en: 'General Science' },
  'العلوم': { ar: 'العلوم', en: 'Science' },
  'Science': { ar: 'العلوم', en: 'Science' },
  'اللغة الإنجليزية': { ar: 'اللغة الإنجليزية', en: 'English Language' },
  'English Language': { ar: 'اللغة الإنجليزية', en: 'English Language' },
  'التربية الإسلامية': { ar: 'التربية الإسلامية', en: 'Islamic Studies' },
  'Islamic Education': { ar: 'التربية الإسلامية', en: 'Islamic Studies' },
  'الدراسات الاجتماعية': { ar: 'الدراسات الاجتماعية والتربية الأخلاقية', en: 'Social Studies & Moral Education' },
  'Social Studies': { ar: 'الدراسات الاجتماعية', en: 'Social Studies' },
  'الحوسبة والتصميم الابتكاري': { ar: 'الحوسبة والتصميم الابتكاري', en: 'Computing & Creative Design' },
  'Computing': { ar: 'الحوسبة والتصميم', en: 'Computing & Design' },
  'الفنون البصرية': { ar: 'الفنون البصرية والموسيقية', en: 'Visual Arts & Music' },
  'Art': { ar: 'الفنون', en: 'Art' },
  'التربية البدنية والدفاع عن النفس': { ar: 'التربية البدنية والدفاع عن النفس', en: 'Physical Education' },
  'Physical Education': { ar: 'التربية البدنية', en: 'Physical Education' }
};

export const GRADE_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  'الصف الخامس': { ar: 'الصف الخامس', en: 'Grade 5' },
  'الصف السادس': { ar: 'الصف السادس', en: 'Grade 6' },
  'الصف السابع': { ar: 'الصف السابع', en: 'Grade 7' },
  'الصف الثامن': { ar: 'الصف الثامن', en: 'Grade 8' },
  'الصف التاسع': { ar: 'الصف التاسع', en: 'Grade 9' }
};

export const TERM_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  'الفصل الدراسي الأول': { ar: 'الفصل الدراسي الأول', en: 'Term 1' },
  'الفصل الدراسي الثاني': { ar: 'الفصل الدراسي الثاني (الحالي)', en: 'Term 2 (Active)' },
  'الفصل الدراسي الثالث': { ar: 'الفصل الدراسي الثالث', en: 'Term 3' }
};

export function translateSubject(subject: string, lang: Language): string {
  if (lang === 'ar') return SUBJECT_TRANSLATIONS[subject]?.ar || subject;
  return SUBJECT_TRANSLATIONS[subject]?.en || subject;
}

export function translateGrade(grade: string, lang: Language): string {
  if (lang === 'ar') return GRADE_TRANSLATIONS[grade]?.ar || grade;
  return GRADE_TRANSLATIONS[grade]?.en || grade;
}

export function translateSection(section: string, lang: Language): string {
  if (lang === 'ar') return section;
  return section.replace(/الشعبة/g, 'Section').replace(/شعبة/g, 'Section');
}

export function translateTerm(term: string, lang: Language): string {
  if (lang === 'ar') return TERM_TRANSLATIONS[term]?.ar || term;
  return TERM_TRANSLATIONS[term]?.en || term;
}

export function translateIndicatorText(indicatorId: number, fallbackText: string, lang: Language): string {
  const found = OFFICIAL_INDICATORS.find(i => i.id === indicatorId);
  if (!found) return fallbackText;
  if (lang === 'en') {
    return found.textEn || found.text;
  }
  return found.text;
}

export function translateIndicatorGroup(group: string, lang: Language): string {
  if (lang === 'ar') return group;
  const map: Record<string, string> = {
    'التخطيط والاستعداد': 'Planning & Preparation',
    'المشاركة والتفاعل': 'Participation & Engagement',
    'الممارسات التدريسية': 'Teaching Practices',
    'بيئة التعلم': 'Learning Environment',
    'الربط والتكامل': 'Integration & Connections'
  };
  return map[group] || group;
}

export function translateDomainName(domainName: string, lang: Language): string {
  if (lang === 'ar') return domainName;
  const found = GENERAL_DOMAINS.find(d => d.name === domainName);
  if (found && found.nameEn) return found.nameEn;
  
  const map: Record<string, string> = {
    'التخطيط للتعلم والتقييم': 'Planning for Learning & Assessment',
    'استراتيجيات التدريس والتمايز': 'Teaching Strategies & Differentiation',
    'بيئة التعلم وإدارة الصف': 'Learning Environment & Classroom Management',
    'إشراك الطلبة والمهارات الحياتية': 'Student Engagement & Life Skills',
    'توظيف التكنولوجيا والتعلم الذكي': 'Technology & Smart Learning Integration'
  };
  return map[domainName] || domainName;
}

export function translateRecommendationItem(text: string, lang: Language): string {
  if (lang === 'ar') return text;
  
  // Look across all banks
  const allBanks = [
    ...PRESET_RECOMMENDATION_BANKS.strengths,
    ...PRESET_RECOMMENDATION_BANKS.improvementAreas,
    ...PRESET_RECOMMENDATION_BANKS.practicalRecommendations,
    ...PRESET_RECOMMENDATION_BANKS.followUpPlans
  ];

  const matched = allBanks.find(item => item.textAr.trim() === text.trim() || item.textEn.trim() === text.trim());
  if (matched) {
    return matched.textEn;
  }
  return text;
}

export function translateGoalText(goal: string, lang: Language): string {
  if (lang === 'ar') return goal;
  const matched = POTENTIAL_VISIT_GOALS.find(g => g.text.trim() === goal.trim());
  if (matched) {
    // Generate clean English version of standard goal
    return `Classroom observation: ${matched.category} · Focus: Indicators [${matched.suggestedIndicatorIds.join(', ')}]`;
  }
  return goal;
}
