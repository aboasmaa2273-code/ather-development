import schoolLogo from '../assets/images/athar_school_emblem_1793852788755.jpg';
import { 
  IndicatorDefinition, 
  Teacher, 
  ClassroomVisit, 
  ImprovementPlan, 
  AcademicSettings, 
  PlatformSettings, 
  User,
  RegisteredVisitor 
} from '../types';

export const OFFICIAL_INDICATORS: IndicatorDefinition[] = [
  // المجموعة 1: التخطيط والاستعداد
  {
    id: 1,
    code: 'IND-01',
    group: 'التخطيط والاستعداد',
    groupEn: 'Planning & Preparation',
    text: 'مشاركة القوانين الصفية.',
    textEn: 'Sharing classroom rules and expectations.',
    description: 'إيضاح وتفعيل القواعد والتعليمات الصفية الإيجابية المتفق عليها مع الطلبة.',
    descriptionEn: 'Clarifying and activating positive agreed classroom routines and norms with students.'
  },
  {
    id: 2,
    code: 'IND-02',
    group: 'التخطيط والاستعداد',
    groupEn: 'Planning & Preparation',
    text: 'مشاركة المخرجات التعليمية مع الطلبة بوضوح.',
    textEn: 'Clearly communicating learning outcomes with students.',
    description: 'صياغة وعرض نواتج التعلم المستهدفة بلغة مناسبة ومفهومة للطلبة منذ بداية الحصة.',
    descriptionEn: 'Framing and displaying targeted learning outcomes in student-friendly language from lesson start.'
  },
  {
    id: 3,
    code: 'IND-03',
    group: 'التخطيط والاستعداد',
    groupEn: 'Planning & Preparation',
    text: 'التهيئة الحافزة.',
    textEn: 'Engaging warm-up and hook.',
    description: 'جذب انتباه الطلبة وإثارة دافعيتهم وربطهم بموضوع الدرس الجديد بأسلوب شائق.',
    descriptionEn: 'Capturing students attention, sparking motivation, and linking to the new topic effectively.'
  },
  {
    id: 5,
    code: 'IND-05',
    group: 'التخطيط والاستعداد',
    groupEn: 'Planning & Preparation',
    text: 'مشاركة المفاهيم والمفردات الأساسية في الدرس.',
    textEn: 'Introducing essential lesson terms and vocabulary.',
    description: 'تحديد المصطلحات والكلمات المفتاحية الجديدة والتركيز على استيعاب الطلبة لها.',
    descriptionEn: 'Highlighting key terminology and ensuring student comprehension and contextual application.'
  },

  // المجموعة 2: المشاركة والتفاعل
  {
    id: 4,
    code: 'IND-04',
    group: 'المشاركة والتفاعل',
    groupEn: 'Participation & Engagement',
    text: 'إعطاء جميع الطلبة فرصة للمشاركة.',
    textEn: 'Providing equitable participation opportunities for all students.',
    description: 'إتاحة فرص متكافئة وعادلة لكافة فئات الطلبة بما فيها ذوو الاحتياجات والفائقون.',
    descriptionEn: 'Ensuring fair, balanced engagement for all students including SEN and gifted learners.'
  },
  {
    id: 6,
    code: 'IND-06',
    group: 'المشاركة والتفاعل',
    groupEn: 'Participation & Engagement',
    text: 'تشجيع الطلبة على طرح الأسئلة.',
    textEn: 'Encouraging students to ask probing questions.',
    description: 'خلق مناخ تفاعلي آمن يحفز الفضول المعرفي والاستفسار وبناء التفكير الناقد.',
    descriptionEn: 'Fostering a safe, stimulating environment that sparks curiosity and inquiry.'
  },
  {
    id: 10,
    code: 'IND-10',
    group: 'المشاركة والتفاعل',
    groupEn: 'Participation & Engagement',
    text: 'تحفيز الطلبة بطرق مختلفة.',
    textEn: 'Multi-modal praise, motivation, and positive reinforcement.',
    description: 'تنويع أساليب التعزيز المادي والمعنوي واللفظي الفردي والجماعي.',
    descriptionEn: 'Diversifying verbal, tangible, individual, and group praise and reinforcement.'
  },
  {
    id: 11,
    code: 'IND-11',
    group: 'المشاركة والتفاعل',
    groupEn: 'Participation & Engagement',
    text: 'إعطاء الطلبة فرصة للقراءة خلال الحصة.',
    textEn: 'Dedicated student reading opportunities during the lesson.',
    description: 'تخصيص وقت محدد لممارسة القراءة الفردية أو الجهرية أو الصامتة المتعمقة.',
    descriptionEn: 'Allocating purposeful time for silent, choral, or deep individual reading practice.'
  },
  {
    id: 12,
    code: 'IND-12',
    group: 'المشاركة والتفاعل',
    groupEn: 'Participation & Engagement',
    text: 'إعطاء الطلبة فرصة للكتابة خلال الحصة.',
    textEn: 'Dedicated student writing opportunities during the lesson.',
    description: 'تفعيل مهارات التدوين والكتابة التفسيرية والتلخيص وصياغة الإجابات المكتوبة.',
    descriptionEn: 'Promoting note-taking, explanatory writing, summarizing, and structured responses.'
  },

  // المجموعة 3: الممارسات التدريسية
  {
    id: 7,
    code: 'IND-07',
    group: 'الممارسات التدريسية',
    groupEn: 'Teaching & Pedagogical Practices',
    text: 'طرح أسئلة مختلفة المستويات.',
    textEn: 'Asking differentiated questions (higher-order Bloom levels).',
    description: 'التدرج في صياغة الأسئلة من التذكر إلى الفهم والتحليل والتركيب والتقويم (بلوم).',
    descriptionEn: 'Scaffolding questions from recall up to analysis, synthesis, and critical evaluation.'
  },
  {
    id: 8,
    code: 'IND-08',
    group: 'الممارسات التدريسية',
    groupEn: 'Teaching & Pedagogical Practices',
    text: 'استخدام تقييم الأقران.',
    textEn: 'Facilitating structured peer assessment.',
    description: 'تمكين الطلبة من مراجعة وتقييم أعمال زملائهم وفق معايير واضحة ومعلنة.',
    descriptionEn: 'Enabling students to review peer work using clear, transparent rubrics.'
  },
  {
    id: 9,
    code: 'IND-09',
    group: 'الممارسات التدريسية',
    groupEn: 'Teaching & Pedagogical Practices',
    text: 'وجود أنشطة تلبي احتياجات الطلبة المختلفة.',
    textEn: 'Differentiated activities meeting diverse learning needs.',
    description: 'تمايز التعليم وتقديم مهام ملائمة لمستويات التحصيل المتعددة وأنماط التعلم.',
    descriptionEn: 'Differentiating tasks and learning pathways for various readiness levels.'
  },
  {
    id: 13,
    code: 'IND-13',
    group: 'الممارسات التدريسية',
    groupEn: 'Teaching & Pedagogical Practices',
    text: 'استخدام مصادر تعلم مختلفة.',
    textEn: 'Using varied learning resources and multimedia.',
    description: 'الاستعانة بالمجسمات، والوسائط الرقمية، ونصوص الدعم، والخرائط الذهنية.',
    descriptionEn: 'Leveraging digital media, manipulatives, support texts, and mind maps.'
  },
  {
    id: 14,
    code: 'IND-14',
    group: 'الممارسات التدريسية',
    groupEn: 'Teaching & Pedagogical Practices',
    text: 'توظيف التكنولوجيا من قبل المعلم.',
    textEn: 'Teacher effective integration of educational technology.',
    description: 'استخدام المنصات الرقمية والشاشات التفاعلية والبرمجيات بطريقة تخدم الدرس.',
    descriptionEn: 'Purposeful use of interactive screens, digital platforms, and subject apps.'
  },
  {
    id: 15,
    code: 'IND-15',
    group: 'الممارسات التدريسية',
    groupEn: 'Teaching & Pedagogical Practices',
    text: 'وجود خاتمة للدرس.',
    textEn: 'Structured lesson closure and consolidation.',
    description: 'غلق الدرس بشكل منظم، والتحقق من تحقق الأهداف، وربط العناصر الأساسية.',
    descriptionEn: 'Systematic closure, reviewing targeted objectives, and synthesizing takeaways.'
  },
  {
    id: 20,
    code: 'IND-20',
    group: 'الممارسات التدريسية',
    groupEn: 'Teaching & Pedagogical Practices',
    text: 'كيف كان تقدم الطلبة؟',
    textEn: 'Observable student progress in understanding and skills.',
    description: 'رصد وملاحظة مدى التطور الفعلي في فهم الطلبة واكتساب المهارات أثناء الحصة.',
    descriptionEn: 'Assessing tangible growth in student understanding and competencies during the period.'
  },
  {
    id: 21,
    code: 'IND-21',
    group: 'الممارسات التدريسية',
    groupEn: 'Teaching & Pedagogical Practices',
    text: 'كيف كانت التغذية الراجعة التي قام المعلم بتزويدها للطلبة؟',
    textEn: 'Quality, timeliness, and actionability of formative teacher feedback.',
    description: 'تقديم توجيهات نوعية وتصحيحية بناءة ومباشرة تساعد الطالب على تصويب مساره.',
    descriptionEn: 'Providing timely, constructive, diagnostic feedback that guides student improvement.'
  },

  // المجموعة 4: بيئة التعلم
  {
    id: 17,
    code: 'IND-17',
    group: 'بيئة التعلم',
    groupEn: 'Learning Environment',
    text: 'وجود روتين لإدارة البيئة الصفية.',
    textEn: 'Effective classroom routine and learning environment management.',
    description: 'سلاسة الانتقال بين الأنشطة، وتوزيع الأدوار، وانضباط حركة الطلبة في الصف.',
    descriptionEn: 'Smooth transitions between tasks, clear role distribution, and orderly movement.'
  },
  {
    id: 18,
    code: 'IND-18',
    group: 'بيئة التعلم',
    groupEn: 'Learning Environment',
    text: 'توظيف التكنولوجيا من قبل الطلبة.',
    textEn: 'Students hands-on use of technology and digital tools.',
    description: 'استخدام أجهزة الطلبة الشخصية في البحث، وحل التدريبات، والتطبيقات التفاعلية.',
    descriptionEn: 'Students utilizing devices for research, problem-solving, and interactive tasks.'
  },
  {
    id: 19,
    code: 'IND-19',
    group: 'بيئة التعلم',
    groupEn: 'Learning Environment',
    text: 'إدارة وقت الحصة بفعالية.',
    textEn: 'Efficient lesson pacing and time management.',
    description: 'الالتزام بالخطة الزمنية، والتوزيع المتوازن بين الشرح والتطبيق والمناقشة والتقييم.',
    descriptionEn: 'Pacing lesson components smoothly with balanced time for practice and inquiry.'
  },

  // المجموعة 5: الربط والتكامل
  {
    id: 16,
    code: 'IND-16',
    group: 'الربط والتكامل',
    groupEn: 'Real-world Connection & Integration',
    text: 'الربط بالحياة الواقعية للطلبة والخبرات التعليمية السابقة والمواد الأخرى.',
    textEn: 'Connecting learning to real-world experiences, cross-curricular links and prior knowledge.',
    description: 'توظيف أمثلة من واقع البيئة الإماراتية وحياة الطالب وربط المعرفة بتطبيقاتها.',
    descriptionEn: 'Using contextual UAE examples, personal student lives, and real-life relevance.'
  },
  {
    id: 22,
    code: 'IND-22',
    group: 'الربط والتكامل',
    groupEn: 'Real-world Connection & Integration',
    text: 'الربط بالهوية الوطنية.',
    textEn: 'Integration of UAE national identity, values, and heritage.',
    description: 'إبراز قيم التسامح، والتراث الإماراتي، والمواطنة الإيجابية، ورؤية القيادة الرشيدة.',
    descriptionEn: 'Highlighting values of tolerance, Emirati heritage, positive citizenship, and leadership vision.'
  }
];

export const GENERAL_DOMAINS = [
  { id: 'achievement', name: 'التحصيل', nameEn: 'Students Achievement' },
  { id: 'progress', name: 'التقدم', nameEn: 'Students Progress' },
  { id: 'learning_skills', name: 'مهارات التعلم', nameEn: 'Learning Skills' },
  { id: 'psd_innovation', name: 'التنمية الشخصية والاجتماعية والابتكار (PSD & Innovation)', nameEn: 'Personal & Social Development and Innovation (PSD)' },
  { id: 'teaching', name: 'التدريس', nameEn: 'Teaching & Pedagogy' },
  { id: 'assessment', name: 'التقييم', nameEn: 'Assessment & Feedback' },
  { id: 'curriculum', name: 'المنهاج', nameEn: 'Curriculum Implementation' },
  { id: 'pcgs', name: 'PCGS (الحماية والرعاية والتوجيه والدعم)', nameEn: 'PCGS (Protection, Care, Guidance and Support)' },
  { id: 'leadership', name: 'القيادة والإدارة', nameEn: 'Leadership & Governance' },
  { id: 'other', name: 'أخرى', nameEn: 'Other School Criteria' }
];

export interface VisitGoalPreset {
  id: string;
  category: string;
  text: string;
  suggestedIndicatorIds: number[];
}

export const POTENTIAL_VISIT_GOALS: VisitGoalPreset[] = [
  {
    id: 'goal_diff',
    category: 'التمايز وتلبية الفروق الفردية',
    text: 'متابعة تطبيق استراتيجيات التمايز وتلبية احتياجات الفروق الفردية للطلبة',
    suggestedIndicatorIds: [9, 4, 7, 20]
  },
  {
    id: 'goal_outcomes',
    category: 'التخطيط ونواتج التعلم',
    text: 'رصد مدى وضوح مشاركة المخرجات التعليمية والقوانين الصفية الإيجابية',
    suggestedIndicatorIds: [2, 1, 5, 15]
  },
  {
    id: 'goal_warmup',
    category: 'الدافعية والبيئة الصفية',
    text: 'قياس فاعلية التهيئة الحافزة وإثارة دافعية الطلبة نحو التعلم المستهدف',
    suggestedIndicatorIds: [3, 10, 6, 4]
  },
  {
    id: 'goal_tech',
    category: 'التقنيات الحديثة والابتكار',
    text: 'متابعة توظيف التكنولوجيا والمنصات الرقمية من قبل المعلم والطلبة',
    suggestedIndicatorIds: [14, 18, 13]
  },
  {
    id: 'goal_feedback',
    category: 'التقويم والتغذية الراجعة',
    text: 'متابعة جودة وفورية التغذية الراجعة التكوينية المصوبة لأداء الطلبة',
    suggestedIndicatorIds: [21, 20, 8, 7]
  },
  {
    id: 'goal_time_routine',
    category: 'الإدارة الصفية والزمن',
    text: 'تقييم كفاءة إدارة وقت الحصة وسلاسة روتين حركة ونشاط البيئة الصفية',
    suggestedIndicatorIds: [19, 17, 1]
  },
  {
    id: 'goal_participation',
    category: 'المشاركة والتفاعل',
    text: 'رصد فرص المشاركة العادلة لجميع الطلبة وتشجيعهم على طرح الأسئلة السابرة',
    suggestedIndicatorIds: [4, 6, 10]
  },
  {
    id: 'goal_reading_writing',
    category: 'المهارات اللغوية الأساسية',
    text: 'تقييم ممارسات تعزيز مهارات القراءة الصامتة والجهرية والكتابة التفسيرية',
    suggestedIndicatorIds: [11, 12, 5]
  },
  {
    id: 'goal_peer_assessment',
    category: 'التقويم والتغذية الراجعة',
    text: 'متابعة تطبيق تقييم الأقران واستخدام معايير التصحيح المصغرة (Rubrics)',
    suggestedIndicatorIds: [8, 20, 21]
  },
  {
    id: 'goal_national_identity',
    category: 'الهوية الوطنية والتكامل',
    text: 'التحقق من ربط محتوى الدرس بالهوية الوطنية والتراث الإماراتي وقيم التسامح',
    suggestedIndicatorIds: [22, 16, 3]
  },
  {
    id: 'goal_questioning_bloom',
    category: 'مهارات التفكير والأسئلة',
    text: 'متابعة جودة الأسئلة الصفية والتدرج في مستويات التفكير العليا (بلوم)',
    suggestedIndicatorIds: [7, 6, 20]
  },
  {
    id: 'goal_real_life',
    category: 'الربط الحياتي والواقع',
    text: 'قياس أثر ربط المعرفة بالخبرات الحياتية السابقة والتطبيقات الواقعية للطلبة',
    suggestedIndicatorIds: [16, 13, 22]
  },
  {
    id: 'goal_closure_progress',
    category: 'نواتج التعلم والخاتمة',
    text: 'رصد التقدم الفعلي في فهم الطلبة وإتقان خاتمة الدرس وغلق المعرفة',
    suggestedIndicatorIds: [20, 15, 2]
  },
  {
    id: 'goal_motivation',
    category: 'الدافعية والبيئة الصفية',
    text: 'تقييم تنويع أساليب التعزيز والتحفيز المادي والمعنوي الفردي والجماعي',
    suggestedIndicatorIds: [10, 4, 6]
  },
  {
    id: 'goal_learning_resources',
    category: 'مصادر التعلم',
    text: 'متابعة استخدام مصادر التعلم المتنوعة والوسائط الرقمية الإثرائية',
    suggestedIndicatorIds: [13, 14, 9]
  },
  {
    id: 'goal_plan_followup',
    category: 'متابعة أثر التطوير المهني',
    text: 'متابعة أثر تنفيذ توصيات وإجراءات خطة التطوير المهني السابقة للمعلم',
    suggestedIndicatorIds: [9, 8, 21, 14]
  },
  {
    id: 'goal_gifted_support',
    category: 'التمايز وتلبية الفروق الفردية',
    text: 'متابعة دعم الطلبة أصحاب الهمم وتمكين الطلبة الفائقين والموهوبين',
    suggestedIndicatorIds: [9, 4, 7]
  },
  {
    id: 'goal_collaborative',
    category: 'المشاركة والتفاعل',
    text: 'متابعة انتظام وسلاسة العمل في المجموعات التعاونية والتشاركية النشطة',
    suggestedIndicatorIds: [4, 8, 17, 19]
  }
];

export const DEFAULT_ACADEMIC_SETTINGS: AcademicSettings = {
  grades: ['الصف الخامس', 'الصف السادس', 'الصف السابع', 'الصف الثامن'],
  sectionsCount: 4,
  subjects: [
    'اللغة العربية',
    'الرياضيات',
    'العلوم العامة',
    'اللغة الإنجليزية',
    'التربية الإسلامية',
    'الدراسات الاجتماعية والتربية الأخلاقية',
    'الحوسبة والتصميم الابتكاري',
    'الفنون البصرية والموسيقية',
    'التربية البدنية والصحية'
  ],
  academicYears: [
    '2026 - 2027',
    '2027 - 2028',
    '2028 - 2029',
    '2029 - 2030',
    '2030 - 2031'
  ],
  currentAcademicYear: '2026 - 2027',
  terms: ['الفصل الدراسي الأول', 'الفصل الدراسي الثاني', 'الفصل الدراسي الثالث'],
  currentTerm: 'الفصل الدراسي الثاني'
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'أَثَر',
  platformTitle: 'منظومة التميز والتطوير التعليمي',
  slogan: '«نَرْصُدُ الأَدَاءَ... وَنَصْنَعُ الأَثَرَ»',
  schoolName: 'مدرسة الصدارة بنين - الحلقة الثانية',
  schoolStage: 'الحلقة الثانية (الصفوف 5 - 8)',
  logoUrl: schoolLogo,
  welcomeMessage: 'مرحباً بكم في منصة «أَثَر»، البوابة الرقمية المتطورة للرصد النوعي للممارسات التدريسية الصفية، وتحفيز التطوير المهني المستدام لمعلمي المدرسة وفق أعلى معايير الجودة والتميز المؤسسي.',
  primaryColor: '#172C40',
  secondaryColor: '#C6A66A',
  contactEmail: 'alsadara.school@athar.edu.ae',
  contactPhone: '+971 2 444 8899'
};

export const DEFAULT_USERS: User[] = [
  {
    id: 'user_cluster_director_aisha',
    name: 'الأستاذة عائشة الغفلي',
    email: 'aisha.alghaflia@athar.edu.ae',
    role: 'evaluator',
    schoolId: 'sch_alsadara_01',
    specialization: 'مديرة نطاق 2.8',
    username: 'aisha',
    password: '123'
  },
  {
    id: 'user_head_arabic',
    name: 'رئيس هيئة تدريس المواد العربية',
    email: 'head.arabic@alsadara.edu.ae',
    role: 'evaluator',
    schoolId: 'sch_alsadara_01',
    specialization: 'رئيس هيئة تدريس المواد العربية',
    username: 'arabic',
    password: '123'
  },
  {
    id: 'user_principal',
    name: 'مدير المدرسة',
    email: 'principal@alsadara.edu.ae',
    role: 'school_admin',
    schoolId: 'sch_alsadara_01',
    specialization: 'الإدارة المدرسية والقيادة التعليمية',
    username: 'principal',
    password: '123'
  },
  {
    id: 'user_vice_principal',
    name: 'مساعد المدير',
    email: 'vp.academic@alsadara.edu.ae',
    role: 'vice_principal',
    schoolId: 'sch_alsadara_01',
    specialization: 'الشؤون الأكاديمية والتعليمية',
    username: 'vp',
    password: '123'
  }
];

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'tch_01',
    schoolId: 'sch_alsadara_01',
    fullName: 'راشد بن سلطان الكعبي',
    jobNumber: '10452',
    specialization: 'اللغة العربية',
    status: 'active',
    email: 'rashid.k@alsadara.edu.ae',
    phone: '0501234567',
    dateAdded: '2023-09-01'
  },
  {
    id: 'tch_02',
    schoolId: 'sch_alsadara_01',
    fullName: 'أحمد محمد الكعبي',
    jobNumber: '10488',
    specialization: 'الرياضيات',
    status: 'active',
    email: 'ahmed.m@alsadara.edu.ae',
    phone: '0502345678',
    dateAdded: '2023-09-01'
  },
  {
    id: 'tch_03',
    schoolId: 'sch_alsadara_01',
    fullName: 'سالم حمد المزروعي',
    jobNumber: '10512',
    specialization: 'العلوم العامة',
    status: 'active',
    email: 'salem.m@alsadara.edu.ae',
    phone: '0503456789',
    dateAdded: '2023-10-15'
  },
  {
    id: 'tch_04',
    schoolId: 'sch_alsadara_01',
    fullName: 'عمر طارق المنصوري',
    jobNumber: '10620',
    specialization: 'اللغة الإنجليزية',
    status: 'active',
    email: 'omar.m@alsadara.edu.ae',
    phone: '0504567890',
    dateAdded: '2024-01-10'
  },
  {
    id: 'tch_05',
    schoolId: 'sch_alsadara_01',
    fullName: 'خالد خلفان الظاهري',
    jobNumber: '10735',
    specialization: 'التربية الإسلامية',
    status: 'active',
    email: 'khalid.z@alsadara.edu.ae',
    phone: '0505678901',
    dateAdded: '2024-02-01'
  },
  {
    id: 'tch_06',
    schoolId: 'sch_alsadara_01',
    fullName: 'عبد الله سعيد الفلاسي',
    jobNumber: '10819',
    specialization: 'الدراسات الاجتماعية والتربية الأخلاقية',
    status: 'active',
    email: 'abdullah.f@alsadara.edu.ae',
    phone: '0506789012',
    dateAdded: '2024-03-12'
  },
  {
    id: 'tch_07',
    schoolId: 'sch_alsadara_01',
    fullName: 'سلطان مروان القاسمي',
    jobNumber: '10940',
    specialization: 'الحوسبة والتصميم الابتكاري',
    status: 'active',
    email: 'sultan.q@alsadara.edu.ae',
    phone: '0507890123',
    dateAdded: '2024-08-25'
  }
];

export const DEFAULT_VISITS: ClassroomVisit[] = [
  {
    id: 'VST-2024-001',
    schoolId: 'sch_alsadara_01',
    academicYear: '2026 - 2027',
    term: 'الفصل الدراسي الثاني',
    visitType: 'full',
    teacherId: 'tch_01',
    teacherName: 'راشد بن سلطان الكعبي',
    teacherJobNumber: '10452',
    teacherSpecialization: 'اللغة العربية',
    grade: 'الصف الثامن',
    section: 'الشعبة 2',
    subject: 'اللغة العربية',
    evaluatorId: 'user_head_arabic',
    evaluatorName: 'رئيس هيئة تدريس المواد العربية',
    date: '2026-10-18',
    time: '09:15',
    visitGoal: 'تقييم ممارسات تعزيز مهارات القراءة والكتابة والتحفيز الصفي ونواتج التعلم المستهدفة.',
    status: 'approved',
    // Student Demographics & Attendance
    totalStudents: 28,
    attendedStudents: 26,
    absentStudents: 2,
    studentGender: 'boys',
    // Multiple Visitors support
    visitorRole: 'evaluator',
    visitors: [
      { id: 'v-01', name: 'د. خالد خلفان المزروعي', role: 'evaluator', roleTitle: 'مقيّم معتمد' },
      { id: 'v-02', name: 'أ. مريم سعيد الشامسي', role: 'cluster_director', roleTitle: 'مديرة النطاق' }
    ],
    indicators: [
      { indicatorId: 1, indicatorText: 'مشاركة القوانين الصفية.', indicatorGroup: 'التخطيط والاستعداد', rating: 'yes', notes: 'القوانين معروضة بوضوح وملتزم بها باقتدار.' },
      { indicatorId: 2, indicatorText: 'مشاركة المخرجات التعليمية مع الطلبة بوضوح.', indicatorGroup: 'التخطيط والاستعداد', rating: 'yes', notes: 'تمت مناقشة نواتج التعلم وتفصيلها على السبورة.' },
      { indicatorId: 3, indicatorText: 'التهيئة الحافزة.', indicatorGroup: 'التخطيط والاستعداد', rating: 'yes', notes: 'مقدمة سردية وطنية جذابة ارتبطت بقيم التسامح.' },
      { indicatorId: 4, indicatorText: 'إعطاء جميع الطلبة فرصة للمشاركة.', indicatorGroup: 'المشاركة والتفاعل', rating: 'yes', notes: 'استخدام بطاقات الأسماء العشوائية لضمان شمول الجميع.' },
      { indicatorId: 5, indicatorText: 'مشاركة المفاهيم والمفردات الأساسية في الدرس.', indicatorGroup: 'التخطيط والاستعداد', rating: 'yes', notes: 'توضيح المفردات البلاغية واللغوية الجديدة.' },
      { indicatorId: 6, indicatorText: 'تشجيع الطلبة على طرح الأسئلة.', indicatorGroup: 'المشاركة والتفاعل', rating: 'yes', notes: 'تفاعل ناضج وتشجيع الأسئلة السابرة.' },
      { indicatorId: 7, indicatorText: 'طرح أسئلة مختلفة المستويات.', indicatorGroup: 'الممارسات التدريسية', rating: 'yes', notes: 'أسئلة تفكير عليا وتحليل استعاري متقدم.' },
      { indicatorId: 8, indicatorText: 'استخدام تقييم الأقران.', indicatorGroup: 'الممارسات التدريسية', rating: 'needs_improvement', notes: 'طبق تقييم الأقران بسرعة دون سلم تصحيح مكتوب للطلبة.' },
      { indicatorId: 9, indicatorText: 'وجود أنشطة تلبي احتياجات الطلبة المختلفة.', indicatorGroup: 'الممارسات التدريسية', rating: 'yes', notes: 'ثلاثة مستويات متمايزة من بطاقات المهام.' },
      { indicatorId: 10, indicatorText: 'تحفيز الطلبة بطرق مختلفة.', indicatorGroup: 'المشاركة والتفاعل', rating: 'yes', notes: 'تعزيز لفظي وشارات تميز فردية وجماعية.' },
      { indicatorId: 11, indicatorText: 'إعطاء الطلبة فرصة للقراءة خلال الحصة.', indicatorGroup: 'المشاركة والتفاعل', rating: 'yes', notes: 'قراءة جهرية معبرة لنصوص أدبية مختارة.' },
      { indicatorId: 12, indicatorText: 'إعطاء الطلبة فرصة للكتابة خلال الحصة.', indicatorGroup: 'المشاركة والتفاعل', rating: 'yes', notes: 'تدوين فقرة تحليلية في دفاتر التعلم الفردية.' },
      { indicatorId: 13, indicatorText: 'استخدام مصادر تعلم مختلفة.', indicatorGroup: 'الممارسات التدريسية', rating: 'yes', notes: 'نصوص إثرائية ومنصة القراءة الإلكترونية.' },
      { indicatorId: 14, indicatorText: 'توظيف التكنولوجيا من قبل المعلم.', indicatorGroup: 'الممارسات التدريسية', rating: 'yes', notes: 'شاشة تفاعلية وعرض رقمي منظم للمفردات.' },
      { indicatorId: 15, indicatorText: 'وجود خاتمة للدرس.', indicatorGroup: 'الممارسات التدريسية', rating: 'yes', notes: 'غلق ختامي وتلخيص نواتج التعلم المتحققة.' },
      { indicatorId: 16, indicatorText: 'الربط بالحياة الواقعية للطلبة والخبرات التعليمية السابقة والمواد الأخرى.', indicatorGroup: 'الربط والتكامل', rating: 'yes', notes: 'ربط المعنى بالتراث الشفهي الإماراتي الأصيل.' },
      { indicatorId: 17, indicatorText: 'وجود روتين لإدارة البيئة الصفية.', indicatorGroup: 'بيئة التعلم', rating: 'yes', notes: 'بيئة منظمة وسريعة الاستجابة للإشارات المتفق عليها.' },
      { indicatorId: 18, indicatorText: 'توظيف التكنولوجيا من قبل الطلبة.', indicatorGroup: 'بيئة التعلم', rating: 'needs_improvement', notes: 'اقتصر استخدام الأجهزة على فئة محددة من المجموعات.' },
      { indicatorId: 19, indicatorText: 'إدارة وقت الحصة بفعالية.', indicatorGroup: 'بيئة التعلم', rating: 'yes', notes: 'توزيع دقيق ومحكم لزمن الأنشطة الصفية.' },
      { indicatorId: 20, indicatorText: 'كيف كان تقدم الطلبة؟', indicatorGroup: 'الممارسات التدريسية', rating: 'yes', notes: 'تقدم ملموس وموثق في إتقان صياغة الفكرة الرئيسة.' },
      { indicatorId: 21, indicatorText: 'كيف كانت التغذية الراجعة التي قام المعلم بتزويدها للطلبة؟', indicatorGroup: 'الممارسات التدريسية', rating: 'yes', notes: 'تغذية راجعة فورية ونوعية وموجهة لكل طالب.' },
      { indicatorId: 22, indicatorText: 'الربط بالهوية الوطنية.', indicatorGroup: 'الربط والتكامل', rating: 'yes', notes: 'توظيف قصائد وطنية تعبر عن قيم الانتماء والفخر.' }
    ],
    domains: [
      { domainId: 'achievement', domainName: 'التحصيل', rating: 'very_good' },
      { domainId: 'progress', domainName: 'التقدم', rating: 'outstanding' },
      { domainId: 'learning_skills', domainName: 'مهارات التعلم', rating: 'very_good' },
      { domainId: 'psd_innovation', domainName: 'التنمية الشخصية والاجتماعية والابتكار (PSD & Innovation)', rating: 'outstanding' },
      { domainId: 'teaching', domainName: 'التدريس', rating: 'very_good' },
      { domainId: 'assessment', domainName: 'التقييم', rating: 'good' },
      { domainId: 'curriculum', domainName: 'المنهاج', rating: 'very_good' },
      { domainId: 'pcgs', domainName: 'PCGS', rating: 'very_good' },
      { domainId: 'leadership', domainName: 'القيادة والإدارة', rating: 'outstanding' },
      { domainId: 'other', domainName: 'أخرى', rating: 'good' }
    ],
    eLearningMaturity: 'very_good',
    strengths: [
      'حضور ذهني عالي وإدارة صفية ملهمة ومحفزة للطلبة.',
      'تطبيق متميز لمهارات القراءة المتعمقة والربط بالهوية الوطنية الإماراتية.',
      'تنوع رائع في أساليب طرح الأسئلة السابرة ومستويات بلوم المعرفية.'
    ],
    improvementAreas: [
      'بناء نماذج وسلالم تصحيح واضحة ومسبقة (Rubrics) لتقييم الأقران.',
      'توسيع نطاق تفاعل جميع الطلبة بالأجهزة اللوحية الخاصة بهم في الأنشطة الكتابية.'
    ],
    practicalRecommendations: 'تطبيق بطاقة تقييم الأقران السريعة في بداية الحصة القادمة، وتفعيل منصة التعلم التشاركي لجميع المجموعات.',
    achievementPercentage: 95.5,
    observedIndicatorsCount: 22,
    totalIndicatorsCount: 22,
    createdAt: '2025-02-18T09:15:00Z',
    updatedAt: '2025-02-18T10:45:00Z'
  },
  {
    id: 'VST-2024-002',
    schoolId: 'sch_alsadara_01',
    academicYear: '2026 - 2027',
    term: 'الفصل الدراسي الثاني',
    visitType: 'quick',
    teacherId: 'tch_02',
    teacherName: 'أحمد محمد الكعبي',
    teacherJobNumber: '10488',
    teacherSpecialization: 'الرياضيات',
    grade: 'الصف السابع',
    section: 'الشعبة 3',
    subject: 'الرياضيات',
    evaluatorId: 'user_principal',
    evaluatorName: 'مدير المدرسة',
    date: '2026-11-02',
    time: '11:00',
    visitGoal: 'زيارة سريعة (15 دقيقة) لمتابعة استراتيجيات التمايز في حل المعادلات الخطية.',
    status: 'completed',
    // Student Demographics & Attendance
    totalStudents: 25,
    attendedStudents: 24,
    absentStudents: 1,
    studentGender: 'boys',
    // Multiple Visitors support
    visitorRole: 'evaluator',
    visitors: [
      { id: 'v-03', name: 'د. خالد خلفان المزروعي', role: 'evaluator', roleTitle: 'مقيّم معتمد' },
      { id: 'v-04', name: 'أ. طارق عبد الرحمن', role: 'academic_supervisor', roleTitle: 'موجه تربوي' }
    ],
    indicators: [
      { indicatorId: 2, indicatorText: 'مشاركة المخرجات التعليمية مع الطلبة بوضوح.', indicatorGroup: 'التخطيط والاستعداد', rating: 'yes', notes: 'الهدف محدد ومكتوب بدقة.' },
      { indicatorId: 4, indicatorText: 'إعطاء جميع الطلبة فرصة للمشاركة.', indicatorGroup: 'المشاركة والتفاعل', rating: 'yes', notes: 'مشاركة نشطة واستجابة متوازنة.' },
      { indicatorId: 9, indicatorText: 'وجود أنشطة تلبي احتياجات الطلبة المختلفة.', indicatorGroup: 'الممارسات التدريسية', rating: 'yes', notes: 'تطبيق مهام متدرجة حسب قدرات الطلبة.' },
      { indicatorId: 14, indicatorText: 'توظيف التكنولوجيا من قبل المعلم.', indicatorGroup: 'الممارسات التدريسية', rating: 'yes', notes: 'استخدام برمجية جيوجيبرا الهندسية في التوضيح.' },
      { indicatorId: 21, indicatorText: 'كيف كانت التغذية الراجعة التي قام المعلم بتزويدها للطلبة؟', indicatorGroup: 'الممارسات التدريسية', rating: 'needs_improvement', notes: 'التركيز كان أكبر على إعطاء الجواب النهائي دون تفكيك أخطاء الحل.' },
      { indicatorId: 19, indicatorText: 'إدارة وقت الحصة بفعالية.', indicatorGroup: 'بيئة التعلم', rating: 'yes', notes: 'استغلال أمثل للـ 15 دقيقة المخصصة للنشاط.' }
    ],
    domains: [
      { domainId: 'achievement', domainName: 'التحصيل', rating: 'good' },
      { domainId: 'progress', domainName: 'التقدم', rating: 'very_good' },
      { domainId: 'learning_skills', domainName: 'مهارات التعلم', rating: 'good' },
      { domainId: 'psd_innovation', domainName: 'التنمية الشخصية والاجتماعية والابتكار (PSD & Innovation)', rating: 'good' },
      { domainId: 'teaching', domainName: 'التدريس', rating: 'very_good' },
      { domainId: 'assessment', domainName: 'التقييم', rating: 'acceptable' },
      { domainId: 'curriculum', domainName: 'المنهاج', rating: 'good' },
      { domainId: 'pcgs', domainName: 'PCGS', rating: 'good' },
      { domainId: 'leadership', domainName: 'القيادة والإدارة', rating: 'very_good' },
      { domainId: 'other', domainName: 'أخرى', rating: 'good' }
    ],
    eLearningMaturity: 'good',
    strengths: [
      'توظيف ذكي وسريع لبرمجيات النمذجة الرياضية الحية.',
      'التمايز الواضح في بطاقات التحدي الرياضي بين مستويات الطلبة.'
    ],
    improvementAreas: [
      'تعزيز التغذية الراجعة الكيفية التفسيرية أثناء تصحيح خطوات المسألة.'
    ],
    practicalRecommendations: 'استخدام بطاقات "خطأ شائع وكيف نتجنبه" لتقديم تغذية راجعة جماعية سريعة.',
    achievementPercentage: 91.7,
    observedIndicatorsCount: 6,
    totalIndicatorsCount: 6,
    createdAt: '2025-02-24T11:00:00Z',
    updatedAt: '2025-02-24T11:30:00Z'
  }
];

export const DEFAULT_PLANS: ImprovementPlan[] = [
  {
    id: 'PLN-2025-001',
    schoolId: 'sch_alsadara_01',
    teacherId: 'tch_01',
    teacherName: 'راشد بن سلطان الكعبي',
    teacherJobNumber: '10452',
    improvementArea: 'الممارسات التدريسية والتقييم الصفي',
    relatedIndicatorText: 'استخدام تقييم الأقران (مؤشر 8)',
    developmentalGoal: 'تمكين الطلبة من تطبيق تقييم الأقران الموضوعي بنسبة 100% باستخدام معايير مصغرة محددة.',
    actionProcedure: 'إعداد استمارة تقييم أقران ميسرة من 3 بنود فقط ومشاركتها في بداية كل حصة تعبير كتابي.',
    responsiblePerson: 'أ. راشد الكعبي بالتنسيق مع منسق المادة د. خالد',
    duration: '3 أسابيع',
    followUpDate: '2025-03-15',
    status: 'in_progress',
    followUpResult: 'تم إعداد النموذج الأولي وتجربته على الشعبة 2 بنجاح ملحوظ.',
    followUpNotes: 'ملاحظة تحسن في ثقة الطلبة عند تصويب أعمال زملائهم.',
    createdAt: '2025-02-19T10:00:00Z'
  },
  {
    id: 'PLN-2025-002',
    schoolId: 'sch_alsadara_01',
    teacherId: 'tch_02',
    teacherName: 'أحمد محمد الكعبي',
    teacherJobNumber: '10488',
    improvementArea: 'التغذية الراجعة والتقويم التكويني',
    relatedIndicatorText: 'كيف كانت التغذية الراجعة التي قام المعلم بتزويدها للطلبة؟ (مؤشر 21)',
    developmentalGoal: 'تطوير أساليب التغذية الراجعة الفورية المعتمدة على تفكيك خطوات التفكير الرياضي.',
    actionProcedure: 'حضور ورشة عمل تخصصية عن "التغذية الراجعة النوعية في حصص الرياضيات" وتنفيذ حصة مشاهدة متبادلة.',
    responsiblePerson: 'أ. أحمد الكعبي بالتعاون مع معلم أول الرياضيات',
    duration: 'أسبوعان',
    followUpDate: '2025-03-10',
    status: 'needs_follow_up',
    followUpResult: 'حضر الورشة ويستعد لتطبيق الحصة التوضيحية.',
    followUpNotes: 'مطلوب زيارة صفية سريعة ثانية للتحقق من الأثر.',
    createdAt: '2025-02-25T08:30:00Z'
  }
];

export const DEFAULT_AUDIT_LOGS = [
  {
    id: 'aud_1',
    schoolId: 'sch_alsadara_01',
    timestamp: '2025-02-18 10:45:12',
    userName: 'د. خالد خلفان المزروعي',
    userRole: 'المقيم',
    action: 'اعتماد زيارة صفية',
    details: 'تم اعتماد وإصدار تقرير الزيارة الكاملة للمعلم راشد بن سلطان الكعبي (معرف VST-2024-001)'
  },
  {
    id: 'aud_2',
    schoolId: 'sch_alsadara_01',
    timestamp: '2025-02-19 10:05:00',
    userName: 'سعادة الأستاذ / محمد بن راشد النعيمي',
    userRole: 'مسؤول المدرسة',
    action: 'إسناد خطة تطوير مهني',
    details: 'إسناد خطة تطوير (PLN-2025-001) للمعلم راشد الكعبي في مؤشر تقييم الأقران'
  },
  {
    id: 'aud_3',
    schoolId: 'sch_alsadara_01',
    timestamp: '2025-02-24 11:30:25',
    userName: 'د. خالد خلفان المزروعي',
    userRole: 'المقيم',
    action: 'إتمام زيارة سريعة',
    details: 'إتمام رصد نتائج الزيارة السريعة للمعلم أحمد الكعبي (معرف VST-2024-002)'
  }
];

export const DEFAULT_REGISTERED_VISITORS: RegisteredVisitor[] = [
  {
    id: 'vis_00_aisha',
    name: 'الأستاذة عائشة الغفلي',
    role: 'cluster_director',
    roleTitle: 'مديرة نطاق 2.8',
    jobNumber: 'V-9901',
    email: 'aisha.alghaflia@athar.edu.ae',
    phone: '+971 50 999 8877',
    department: 'إدارة النطاق التعليمي 2.8 - وزارة التربية والتعليم',
    username: 'aisha',
    password: '123'
  },
  {
    id: 'vis_01',
    name: 'رئيس هيئة تدريس المواد العربية',
    role: 'head_of_arabic',
    roleTitle: 'رئيس هيئة تدريس المواد العربية والملاحظة الصفية',
    jobNumber: 'V-8801',
    email: 'head.arabic@alsadara.edu.ae',
    phone: '+971 50 112 3456',
    department: 'قسم المواد العربية والممارسات التدريسية',
    username: 'arabic',
    password: '123'
  },
  {
    id: 'vis_02',
    name: 'مدير المدرسة',
    role: 'principal',
    roleTitle: 'مدير المدرسة',
    jobNumber: 'V-1001',
    email: 'principal@alsadara.edu.ae',
    phone: '+971 50 223 4567',
    department: 'القيادة المدرسية العليا',
    username: 'principal',
    password: '123'
  },
  {
    id: 'vis_03',
    name: 'مساعد المدير',
    role: 'vice_principal',
    roleTitle: 'مساعد المدير للشؤون الأكاديمية والتعليمية',
    jobNumber: 'V-2002',
    email: 'vice.principal@alsadara.edu.ae',
    phone: '+971 50 445 6789',
    department: 'الشؤون الأكاديمية والتعليمية',
    username: 'vp',
    password: '123'
  },
  {
    id: 'vis_05',
    name: 'د. حصة سالم الظاهري',
    role: 'academic_supervisor',
    roleTitle: 'موجه تربوي أول',
    jobNumber: 'V-3003',
    email: 'supervisor.aldhaheri@moe.gov.ae',
    phone: '+971 50 556 7890',
    department: 'التوجيه والإشراف التربوي التخصصي - وزارة التربية والتعليم',
    username: 'hessa',
    password: '123'
  },
  {
    id: 'vis_06',
    name: 'أ. فاطمة علي الكعبي',
    role: 'teacher',
    roleTitle: 'معلم أول ومنسق مادة (زيارة تبادلية)',
    jobNumber: 'V-4004',
    email: 'fatima.alkaabi@alsadara.sch.ae',
    phone: '+971 50 667 8901',
    department: 'مجلس المواد والتعلم التشاركي'
  },
  {
    id: 'vis_07',
    name: 'أ. سلطان حميد الشحي',
    role: 'admin',
    roleTitle: 'إداري شؤون الجودة والحوكمة المدرسية',
    jobNumber: 'V-5005',
    email: 'sultan.alshamsi@alsadara.sch.ae',
    phone: '+971 50 778 9012',
    department: 'إدارة الجودة والامتثال الأكاديمي'
  }
];

export interface RecommendationOption {
  id: string;
  category: 'strength' | 'growth' | 'recommendation' | 'followup';
  textAr: string;
  textEn: string;
}

export const PRESET_RECOMMENDATION_BANKS: {
  strengths: RecommendationOption[];
  improvementAreas: RecommendationOption[];
  practicalRecommendations: RecommendationOption[];
  followUpPlans: RecommendationOption[];
} = {
  strengths: [
    {
      id: 'str_1',
      category: 'strength',
      textAr: 'إدارة وقت الحصة بفعالية عالية وتوزيع دقيق ومتوازن للأنشطة والمهام التعليمية.',
      textEn: 'Exceptional lesson pacing and well-balanced allocation of tasks and learning activities.'
    },
    {
      id: 'str_2',
      category: 'strength',
      textAr: 'طرح أسئلة سابرة في مستويات التفكير العليا (التحليل والتركيب والتقويم) تثير التفكير الناقد.',
      textEn: 'Skilled use of higher-order probing questions that stimulate critical thinking and inquiry.'
    },
    {
      id: 'str_3',
      category: 'strength',
      textAr: 'ربط محتوى الدرس بالهوية الوطنية الإماراتية والتراث الإماراتي وقضايا الاستدامة المعاصرة.',
      textEn: 'Seamless contextual integration of UAE national identity, heritage, and modern sustainability values.'
    },
    {
      id: 'str_4',
      category: 'strength',
      textAr: 'توظيف تفاعلي ومثمر للتقنيات والمنصات التعليمية الذكية لتعزيز الاستيعاب المفاهيمي.',
      textEn: 'Interactive and purposeful integration of smart learning platforms and educational tech tools.'
    },
    {
      id: 'str_5',
      category: 'strength',
      textAr: 'تطبيق استراتيجيات تعلم نشط ومجموعات تعاونية متجانسة بوضوح في توزيع الأدوار.',
      textEn: 'Effective execution of cooperative group learning with clear, balanced role accountability.'
    },
    {
      id: 'str_6',
      category: 'strength',
      textAr: 'تفاعل طلابي متميز ومشاركة شاملة لجميع مستويات الطلبة باختلاف قدراتهم.',
      textEn: 'Universal student engagement and dynamic classroom dialogue across all achievement levels.'
    },
    {
      id: 'str_7',
      category: 'strength',
      textAr: 'وضوح نواتج التعلم وتذكير الطلبة بها ومتابعة مستمرة لتحققها طوال مجريات الدرس.',
      textEn: 'Explicit learning outcomes prominently framed and consistently monitored with students.'
    },
    {
      id: 'str_8',
      category: 'strength',
      textAr: 'تصميم أنشطة تمايز متدرجة تراعي الفروق الفردية واحتياجات أصحاب الهمم والموهوبين.',
      textEn: 'Differentiated activities addressing diverse learning needs, SEND students, and gifted learners.'
    },
    {
      id: 'str_9',
      category: 'strength',
      textAr: 'بيئة صفية إيجابية ومحفزة قائمة على التعزيز الفوري وترسيخ ثقافة الاحترام المتبادل.',
      textEn: 'Warm, positive learning climate built on timely verbal reinforcement and mutual respect.'
    },
    {
      id: 'str_10',
      category: 'strength',
      textAr: 'وضوح القواعد الصفية والتزام الطلبة الذاتي بالتعليمات وإدارة الحصة بسلاسة وهدوء.',
      textEn: 'Established classroom routines with self-regulated student behavior and calm management.'
    },
    {
      id: 'str_other',
      category: 'strength',
      textAr: 'أخرى (يُحدِّدها المقيِّم وفق الملاحظة الصفية).',
      textEn: 'Other (to be specified by the evaluator).'
    }
  ],
  improvementAreas: [
    {
      id: 'gro_1',
      category: 'growth',
      textAr: 'تفعيل تقييم الأقران والتقييم الذاتي بالاستناد إلى روبرك وسلالم تصحيح معلنة وواضحة للطلبة.',
      textEn: 'Incorporate structured peer and self-assessment guided by clear, student-friendly rubrics.'
    },
    {
      id: 'gro_2',
      category: 'growth',
      textAr: 'توسيع فرص التمايز لتشمل مهام متدرجة تتحدى قدرات الطلبة الموهوبين والفائقين بالصف.',
      textEn: 'Broaden differentiation to provide higher-ceiling challenge tasks for advanced and gifted learners.'
    },
    {
      id: 'gro_3',
      category: 'growth',
      textAr: 'إتاحة زمن انتظار كافٍ (Wait Time) بعد طرح الأسئلة قبل تلقي الإجابات لتعميق التفكير التأملي.',
      textEn: 'Allow sufficient deliberate wait time after prompting questions to foster reflective thinking.'
    },
    {
      id: 'gro_4',
      category: 'growth',
      textAr: 'تعميق التغذية الراجعة الفورية وتوضيح خطوات المعالجة التصحيحية للخطأ التعليمي في حينه.',
      textEn: 'Deepen immediate formative feedback, guiding students through actionable correction steps.'
    },
    {
      id: 'gro_5',
      category: 'growth',
      textAr: 'إتاحة استخدام الأجهزة والمنصات الذكية بأيدي الطلبة بدلاً من اقتصارها على العرض التقديمي للمعلم.',
      textEn: 'Empower hands-on student device usage rather than teacher-led presentation display alone.'
    },
    {
      id: 'gro_6',
      category: 'growth',
      textAr: 'تنويع مستويات الأسئلة الصفيّة لتشمل التفكير الإبداعي وربط المفاهيم بحل المشكلات الواقعية.',
      textEn: 'Diversify cognitive questioning tiers to embrace open-ended problem solving and creative synthesis.'
    },
    {
      id: 'gro_7',
      category: 'growth',
      textAr: 'ربط مخرجات الدرس بالمهارات الحياتية ووظائف المستقبل وسوق العمل الوطني بدولة الإمارات.',
      textEn: 'Explicitly anchor lesson takeaways to real-life applications and future UAE workforce skills.'
    },
    {
      id: 'gro_8',
      category: 'growth',
      textAr: 'معالجة التفاوت الزمني في سرعة إنجاز الأنشطة عبر توفير مهام إثرائية مرنة للمجموعات السريعة.',
      textEn: 'Manage varied task completion speeds with prepared extension tasks for early finishers.'
    },
    {
      id: 'gro_other',
      category: 'growth',
      textAr: 'أخرى (يُحدِّدها المقيِّم وفق الملاحظة الصفية).',
      textEn: 'Other (to be specified by the evaluator).'
    }
  ],
  practicalRecommendations: [
    {
      id: 'rec_1',
      category: 'recommendation',
      textAr: 'إعداد وتطبيق بطاقة تصحيح ذاتي وتقييم أقران واضحة ومبسطة في الأنشطة الصفية القادمة.',
      textEn: 'Develop and utilize concise self/peer-assessment checklists in upcoming instructional units.'
    },
    {
      id: 'rec_2',
      category: 'recommendation',
      textAr: 'حضور حصة معايشة ومشاهدة صفية متبادلة مع معلم متميز في تقنيات إدارة المجموعات التعاونية.',
      textEn: 'Engage in peer observation with an exemplary teacher focused on collaborative group mastery.'
    },
    {
      id: 'rec_3',
      category: 'recommendation',
      textAr: 'تصميم أنشطة متدرجة المستويات (المستوى الأساسي - المستوى المتوسط - المستوى الإثرائي المتقدم).',
      textEn: 'Design tiered three-level worksheets (Foundational, Core, and Advanced Enrichment).'
    },
    {
      id: 'rec_4',
      category: 'recommendation',
      textAr: 'توظيف استراتيجية زمن التفكير والمشاركة الثنائية (Think-Pair-Share) لرفع نسب المشاركة.',
      textEn: 'Adopt Think-Pair-Share and randomizer tools to eliminate passive student disengagement.'
    },
    {
      id: 'rec_5',
      category: 'recommendation',
      textAr: 'مراجعة وتضمين خطة التمايز وخطط دعم الطلبة في سجل التحضير اليومي بالتنسيق مع منسق المادة.',
      textEn: 'Document individualized differentiation paths inside daily lesson plans with the curriculum lead.'
    },
    {
      id: 'rec_6',
      category: 'recommendation',
      textAr: 'تقديم تغذية راجعة كتابية وشفهية نوعية توضح خطوات الانتقال إلى المستوى الإتقاني المستهدف.',
      textEn: 'Deliver constructive, step-by-step descriptive comments during independent practice.'
    },
    {
      id: 'rec_7',
      category: 'recommendation',
      textAr: 'تنظيم ورشة عمل مصغرة بالقسم لتبادل ممارسات التقويم التكويني الذكي والمنصات التعليمية.',
      textEn: 'Coordinate a brief departmental knowledge-sharing circle on digital formative assessment.'
    },
    {
      id: 'rec_other',
      category: 'recommendation',
      textAr: 'أخرى (يُحدِّدها المقيِّم وفق الملاحظة الصفية).',
      textEn: 'Other (to be specified by the evaluator).'
    }
  ],
  followUpPlans: [
    {
      id: 'fup_1',
      category: 'followup',
      textAr: 'زيارة صفية استطلاعية ثانية خلال أسبوعين للتحقق من أثر التوصيات الإجرائية الموثقة.',
      textEn: 'Conduct a second classroom observation visit in two weeks to measure implementation impact.'
    },
    {
      id: 'fup_2',
      category: 'followup',
      textAr: 'جلسة تفكّر مهني وتغذية راجعة تخصصية مع رئيس القسم الأكاديمي لمراجعة الخطط العلاجية.',
      textEn: 'Schedule a structured professional reflection and coaching session with the Head of Department.'
    },
    {
      id: 'fup_3',
      category: 'followup',
      textAr: 'حضور درس تطبيقي / نموذجي في استراتيجيات التمايز النشط والتقويم المستمر بالمدرسة.',
      textEn: 'Attend a school-wide model demonstration lesson on active differentiation and assessment.'
    },
    {
      id: 'fup_4',
      category: 'followup',
      textAr: 'إعداد خطة تطوير مهني رسمية (IP) ومتابعة تنفيذ إجراءاتها والتوثيق عبر المنظومة خلال 30 يوماً.',
      textEn: 'Formulate an official professional development plan (IP) and log milestones within 30 days.'
    },
    {
      id: 'fup_5',
      category: 'followup',
      textAr: 'مراجعة عينات من أعمال الطلبة وملفات الإنجاز وسلالم التقييم مع منسق المادة نهاية الأسبوع.',
      textEn: 'Audit samples of student workbooks and rubric grading with the department coordinator.'
    },
    {
      id: 'fup_6',
      category: 'followup',
      textAr: 'تنفيذ درس مصغر (Micro-teaching) أمام فريق المادة لتبادل الخبرات وتطوير آليات التقييم.',
      textEn: 'Host a micro-teaching exercise before subject peers to refine formative questioning rhythms.'
    },
    {
      id: 'fup_7',
      category: 'followup',
      textAr: 'متابعة أسبوعية إلكترونية من خلال منصة التعلم الذكي وسجل الأداء التدريسي للمعلم.',
      textEn: 'Weekly digital follow-up through the institutional learning platform and teacher log.'
    },
    {
      id: 'fup_other',
      category: 'followup',
      textAr: 'أخرى (يُحدِّدها المقيِّم وفق الملاحظة الصفية).',
      textEn: 'Other (to be specified by the evaluator).'
    }
  ]
};
