export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    platformName: 'أَثَر',
    platformTitle: 'منظومة التميز والتطوير التعليمي',
    slogan: '«نَرْصُدُ الأَدَاءَ... وَنَصْنَعُ الأَثَرَ»',
    schoolName: 'مدرسة الصدارة بنين - الحلقة الثانية',
    schoolStage: 'الحلقة الثانية (الصفوف 5 - 8)',
    country: 'دولة الإمارات العربية المتحدة',
    
    // Navigation
    nav: {
      dashboard: 'لوحة التحكم',
      teachers: 'المعلمون',
      visits: 'الزيارات الصفية',
      newVisit: 'زيارة جديدة',
      plans: 'خطط التطوير',
      reports: 'التقارير',
      gasHub: 'Google Apps Script',
      settings: 'الإعدادات',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      currentUser: 'المستخدم الحالي',
      switchRole: 'تبديل الدور لتجربة الصلاحيات'
    },

    // User Roles
    roles: {
      platform_admin: 'مسؤول المنصة',
      school_admin: 'مسؤول المدرسة / المدير',
      vice_principal: 'مساعد المدير / النائب الأكاديمي',
      evaluator: 'المقيم التربوي',
      teacher: 'المعلم'
    },

    // Visitor Roles (تعدد الزائرين ووظائفهم)
    visitorRoles: {
      admin: 'إداري',
      teacher: 'معلم',
      cluster_director: 'مدير / مديرة النطاق',
      principal: 'مدير مدرسة',
      vice_principal: 'مساعد مدير / نائب أكاديمي',
      head_of_arabic: 'رئيس هيئة تدريس المواد العربية',
      department_head: 'رئيس قسم',
      academic_supervisor: 'موجه تربوي / أخصائي',
      evaluator: 'مقيّم معتمد',
      other: 'أخرى'
    },

    // Student Gender
    studentGender: {
      boys: 'ذكور (بنين)',
      girls: 'إناث (بنات)',
      mixed: 'مختلط'
    },

    // Attendance & Demographics
    attendance: {
      title: 'بيانات الطلبة والحضور الصفّي',
      subtitle: 'رصد أعداد الطلبة الحاضرين والغائبين ونوع الشعبة الصفية',
      totalStudents: 'عدد الطلاب الإجمالي',
      attendedStudents: 'عدد الحضور',
      absentStudents: 'عدد الغياب',
      studentGender: 'نوع الطلاب',
      attendanceRate: 'نسبة الحضور',
      selectGender: 'اختر نوع الطلاب...',
      enterTotal: 'العدد الإجمالي',
      enterAttended: 'الحاضرون',
      enterAbsent: 'الغياب',
      autoCalcHint: 'يتم احتساب الغياب تلقائياً (الإجمالي - الحضور)'
    },

    // Visitors Team (تعدد الزائرين)
    visitorsSection: {
      title: 'فريق الزوار والمقيمين',
      subtitle: 'رصد كافة الزائرين المشاركين في الزيارة وتوثيق صفاتهم الوظيفية',
      primaryVisitor: 'الزائر الأساسي / مدخل التقييم',
      additionalVisitors: 'الزائرون الإضافيون المشاركون',
      visitorName: 'اسم الزائر',
      visitorRole: 'وظيفة الزائر',
      selectRole: 'اختر الوظيفة / الصفة...',
      addVisitor: '+ إضافة زائر آخر للزيارة',
      removeVisitor: 'حذف الزائر',
      noAdditional: 'لم يتم إضافة زائرين إضافيين (انقر لإضافة عضو آخر في فريق الملاحظة)'
    },

    // Dashboard
    dashboard: {
      welcome: 'مرحباً بك',
      leaderboard: 'لوحة القيادة والمتابعة',
      teacherPortal: 'سجل الزيارات والنمو المهني الشخصي',
      teacherSubtitle: 'تابع نتائج تقييم زياراتك الصفية المعتمدة، واطلع على خطط التطوير ومجالات التحسين المقترحة.',
      adminSubtitle: 'رصد فوري لنتائج التقييم، وتوزيع نسب الإنجاز، ومتابعة تنفيذ خطط التطوير المهني المستدامة.',
      startNewVisit: 'بدء زيارة جديدة',
      assignPlan: 'إسناد خطة تطوير',
      totalVisits: 'إجمالي الزيارات',
      completedVisits: 'الزيارات المكتملة',
      inProgressVisits: 'قيد التنفيذ / مسودات',
      teachersVisited: 'المعلمون المنفذ لهم',
      openPlans: 'خطط التطوير المفتوحة',
      completedPlans: 'خطط التطوير المنجزة',
      full: 'كاملة',
      quick: 'سريعة',
      performanceDistribution: 'توزيع مستويات الأداء في الزيارات',
      performanceDesc: 'محسوبة بناءً على نسبة الإنجاز واستبعاد المؤشرات غير المشاهدة',
      visitsByTypeAndTerm: 'أنواع الزيارات والفصول الدراسية',
      visitsByTypeDesc: 'الزيارات الكاملة (حصة كاملة) والزيارات السريعة (10-15 دقيقة)',
      term1: 'الفصل الأول',
      term2: 'الفصل الثاني (الحالي)',
      term3: 'الفصل الثالث',
      topAchieved: 'المؤشرات الأكثر تحققاً (نقاط التميز)',
      topNeedingImprovement: 'المؤشرات الأكثر احتياجاً للتطوير والتدريب',
      recentVisits: 'أحدث الزيارات الصفية المسجلة',
      recentVisitsDesc: 'انقر على أي زيارة لعرض التقرير الرسمي والطباعة',
      viewAllVisits: 'عرض كافة الزيارات',
      tableVisitId: 'رقم الزيارة',
      tableTeacher: 'المعلم',
      tableSubjectGrade: 'المادة / الصف',
      tableEvaluator: 'المقيم والزوار',
      tableType: 'نوع الزيارة',
      tableAchievement: 'نسبة الإنجاز',
      tableStatus: 'الحالة',
      tableAction: 'الإجراء',
      viewReport: 'التقرير',
      observedCount: 'مؤشرات رُصدت'
    },

    // Visits Page & Form
    visits: {
      title: 'سجل الزيارات الصفية',
      subtitle: 'إدارة وتوثيق الزيارات الكاملة والسريعة والاطلاع على النتائج المعتمدة',
      searchPlaceholder: 'بحث باسم المعلم، المادة، أو رقم الزيارة...',
      filterAllTerms: 'جميع الفصول',
      filterAllTypes: 'جميع أنواع الزيارات',
      filterAllEvaluators: 'جميع المقيمين',
      filterAllStatuses: 'جميع الحالات',
      fairComparisonNotice: 'تنبيه العدالة التقييمية: نسبة الإنجاز في كل زيارة تُحتسب حصراً من واقع المؤشرات التي شوهدت بالفعل، وتُستبعد المؤشرات غير المشاهدة تماماً من البسط والمقام.',
      noVisitsFound: 'لم يتم العثور على زيارات مطابقة لمعايير البحث الحالية.',
      formTitleNew: 'تسجيل زيارة صفية جديدة',
      formTitleEdit: 'تعديل بيانات الزيارة الصفية',
      step1: '1. البيانات الأساسية والحضور والزوار',
      step2: '2. المؤشرات الـ 22',
      step3: '3. المجالات العامة العشرة',
      step4: '4. نضج التعلم الإلكتروني',
      step5: '5. نقاط القوة والتوصيات',
      visitTypePrompt: 'حدد نوع الزيارة الصفية:',
      fullVisitLabel: 'زيارة كاملة (حصة دراسية كاملة)',
      fullVisitDesc: 'تقييم شامل يغطي جميع مؤشرات الأداء الـ 22 والمجالات العشرة.',
      quickVisitLabel: 'زيارة سريعة (10 - 15 دقيقة)',
      quickVisitDesc: 'زيارة استطلاعية مركزة تستهدف حزمة مؤشرات محددة ترتبط بهدف الزيارة.',
      teacherLabel: 'المعلم المستهدف بالزيارة',
      selectTeacher: 'اختر المعلم...',
      academicYear: 'العام الدراسي',
      term: 'الفصل الدراسي',
      grade: 'الصف',
      section: 'الشعبة',
      subject: 'المادة الدراسية',
      visitDate: 'تاريخ الزيارة',
      visitTime: 'وقت / حصة الزيارة',
      visitGoal: 'هدف الزيارة الصفية',
      choosePresetGoal: 'اختر هدفاً من الأهداف المحتملة أو اكتب هدفاً مخصصاً...',
      customGoalOption: '✏️ كتابة هدف مخصص آخر...',
      suggestedIndicatorsForGoal: 'المؤشرات المقترحة المرتبطة بهذا الهدف',
      selectIndicatorsForQuick: 'حدد المؤشرات المستهدفة في هذه الزيارة السريعة (المؤشرات المختارة):',
      autoSaveSaved: 'تم الحفظ التلقائي في المسودة',
      autoSaving: 'جارٍ الحفظ التلقائي...',
      btnPrevious: 'السابق',
      btnNext: 'التالي',
      btnSaveDraft: 'حفظ كمسودة',
      btnSaveAndComplete: 'اعتماد وإكمال الزيارة',
      indicatorsGroupedNote: 'المؤشرات مصنفة في 5 مجموعات رسمية. اختر التقييم المناسب لكل مؤشر.',
      domainsMatrixNote: 'تقييم المجالات العامة العشرة وفق التدرج المعتمد (متميز إلى ضعيف جداً).',
      eLearningTitle: 'مستوى نضج التعلم الإلكتروني وتوظيف التكنولوجيا',
      strengthsTitle: 'نقاط القوة والممارسات المتميزة المشاهدة',
      improvementTitle: 'مجالات التحسين والتطوير ذات الأولوية',
      recommendationsTitle: 'التوصيات الإجرائية والعملية للمتابعة',
      addStrength: '+ إضافة نقطة تميز',
      addImprovement: '+ إضافة مجال تحسين'
    },

    // Teachers Management
    teachers: {
      title: 'الهيئة التدريسية',
      subtitle: 'إدارة سجلات المعلمين، واستيراد البيانات، ومتابعة الأداء الفردي',
      addNewTeacher: 'إضافة معلم جديد',
      importCsv: 'استيراد من ملف Excel / CSV',
      searchPlaceholder: 'بحث بالاسم، الرقم الوظيفي، أو التخصص...',
      filterAllSpecs: 'جميع التخصصات',
      filterAllStatuses: 'جميع الحالات',
      colJobNumber: 'الرقم الوظيفي',
      colName: 'الاسم الكامل',
      colSpec: 'التخصص / المادة',
      colEmailPhone: 'البريد والهاتف',
      colStatus: 'الحالة',
      colVisitsCount: 'عدد الزيارات',
      colActions: 'الإجراءات',
      viewProfileReport: 'سجل الأداء والتقارير',
      deleteConfirm: 'هل أنت متأكد من رغبتك في حذف هذا المعلم؟',
      modalAddTitle: 'إضافة معلم جديد إلى المنصة',
      fullNameLabel: 'الاسم الكامل للمعلم',
      jobNumberLabel: 'الرقم الوظيفي (فريد)',
      specLabel: 'التخصص الأكاديمي',
      emailLabel: 'البريد الإلكتروني المؤسسي',
      phoneLabel: 'رقم الهاتف (اختياري)',
      statusLabel: 'حالة الحساب',
      duplicateJobNumberError: 'خطأ: الرقم الوظيفي مسجل مسبقاً لمعلم آخر!'
    },

    // Improvement Plans
    plans: {
      title: 'خطط التطوير المهني',
      subtitle: 'متابعة خطط التطوير الفردية الموجهة لمعالجة مجالات التحسين الناتجة عن الزيارات',
      addNewPlan: 'إسناد خطة تطوير جديدة',
      searchPlaceholder: 'بحث باسم المعلم أو الإجراء التطويري...',
      colTeacher: 'المعلم',
      colGoal: 'الهدف التطويري والمجال',
      colIndicator: 'المؤشر المرتبط',
      colProcedure: 'الإجراء التنفيذي',
      colResponsible: 'المسؤول والمتابعة',
      colFollowUpDate: 'تاريخ المتابعة',
      colStatus: 'الحالة',
      colActions: 'الإجراء',
      followUpBtn: 'تسجيل المتابعة',
      followUpModalTitle: 'تسجيل نتائج متابعة خطة التطوير',
      resultLabel: 'نتيجة المتابعة والتحقق من الأثر',
      notesLabel: 'ملاحظات وتوصيات إضافية',
      changeStatusLabel: 'تحديث حالة الخطة'
    },

    // Reports View
    reports: {
      title: 'التقارير التحليلية والقيادية',
      subtitle: 'تحليل شمولي لمستويات الأداء، والمقارنات بين المواد والمقيمين، وخطط النمو',
      tabOverview: 'نظرة عامة ومؤشرات',
      tabTeachersComparison: 'مقارنة أداء المعلمين',
      tabSubjectsAnalysis: 'تحليل المواد الدراسية',
      tabEvaluatorsMetrics: 'إحصاءات المقيمين',
      printReportBtn: 'طباعة التقرير الشامل',
      exportDataBtn: 'تصدير البيانات CSV'
    },

    // Printable Official Visit Report Modal
    visitReportModal: {
      officialTitle: 'تقرير استمارة الزيارة الصفية الرسمية',
      badgeOfficial: 'معتمد رسمياً',
      badgeDraft: 'مسودة قيد المراجعة',
      visitDetails: 'بيانات الزيارة والملاحظة الصفية',
      teacherName: 'اسم المعلم:',
      jobNumber: 'الرقم الوظيفي:',
      subjectGrade: 'المادة والصف:',
      dateTime: 'التاريخ والحصة:',
      evaluator: 'المقيّم الرئيسي:',
      visitType: 'نوع الزيارة:',
      goal: 'هدف الزيارة:',
      achievementHeader: 'نسبة الإنجاز المحققة',
      achievementSubtext: 'استبعاد كامل للمؤشرات غير المشاهدة',
      demographicsHeader: 'إحصاءات الحضور ونوع الطلبة',
      visitorsHeader: 'فريق الزوار والملاحظين المعتمدين',
      indicatorsHeader: 'نتائج تقييم المؤشرات الـ 22',
      domainsHeader: 'نتائج تقييم المجالات العشرة العامة',
      eLearningHeader: 'مستوى نضج التعلم الإلكتروني',
      strengthsHeader: 'أبرز نقاط التميز والممارسات الإيجابية',
      growthHeader: 'مجالات التحسين والتطوير المقترحة',
      recommendationsHeader: 'التوصيات الإجرائية المتفق عليها',
      signaturesBlock: 'الاعتمادات والتوقيعات الرسمية',
      teacherSig: 'توقيع المعلم المزار',
      evaluatorSig: 'توقيع الزائر / المقيّم',
      principalSig: 'اعتماد مدير المدرسة / مديرة النطاق',
      printBtn: 'طباعة التقرير الرسمي (A4 / PDF)',
      closeBtn: 'إغلاق'
    },

    // Settings
    settings: {
      title: 'إعدادات المنصة والنظام الأكاديمي',
      subtitle: 'تخصيص الهوية المؤسسية، والصفوف، والمواد، والفصول، وسجل المراجعة والأمان',
      tabPlatform: 'الهوية المؤسسية والإعدادات العامة',
      tabAcademic: 'الهيكل الأكاديمي والصفوف',
      tabVisitors: 'دليل الزائرين والمقيمين',
      tabData: 'إدارة وحذف البيانات التجريبية',
      tabAudit: 'سجل العمليات والأمان (Audit Log)',
      schoolNameLabel: 'اسم المدرسة الرسمي',
      stageLabel: 'المرحلة التعليمية',
      principalLabel: 'اسم مدير المدرسة',
      welcomeMsgLabel: 'رسالة الترحيب في الواجهة الرئيسية',
      logoUrlLabel: 'رابط الشعار المؤسسي (URL)',
      academicYearLabel: 'العام الدراسي النشط',
      currentTermLabel: 'الفصل الدراسي الحالي',
      gradesList: 'قائمة الصفوف الدراسية',
      sectionsList: 'قائمة الشعب المرقمة',
      subjectsList: 'قائمة المواد الدراسية',
      resetDefaultsBtn: 'استعادة الإعدادات الأصلية الافتراضية'
    },

    // Predefined Recommendation Banks
    recommendationBanks: {
      strengthsTitle: 'بنك نقاط القوة والممارسات المتميزة (اختيار متعدد)',
      growthTitle: 'بنك مجالات التحسين والتطوير (اختيار متعدد)',
      recommendationsTitle: 'بنك التوصيات الإجرائية المعتمدة (اختيار متعدد)',
      followUpTitle: 'خطة المتابعة المقترحة (اختيار متعدد)',
      selectPrompt: 'اختر من القائمة المنسدلة بدون كتابة...',
      selectedCount: 'محدد:',
      clearSelection: 'مسح التحديد',
      noTypingBadge: 'اختيار مباشر من البنك المعتمد دون حاجة للكتابة اليدوية',
      customItemPlaceholder: 'أو اكتب نقطة مخصصة إضافية واضغط إضافة...',
      addCustomBtn: 'إضافة',
      customBadge: 'مخصصة'
    },

    // Visitors Directory Management
    visitorsManagement: {
      title: 'دليل الزائرين والمقيمين المعتمدين',
      subtitle: 'تعديل وإضافة أسماء الزائرين، ومسؤولي النطاق، والقيادات التربوية مع صفاتهم الوظيفية لتسهيل رصدهم بالزيارات الصفية.',
      addBtn: '+ إضافة مقيّم أو زائر جديد',
      editTitle: 'تعديل بيانات مقيّم أو زائر',
      newTitle: 'إضافة مقيّم أو زائر معتمد جديد',
      nameLabel: 'اسم المقيم / الزائر الكامل *',
      roleLabel: 'الصفة / الدور الوظيفي *',
      roleTitleLabel: 'المسمى الوظيفي التفصيلي',
      deptLabel: 'القسم / الجهة / النطاق التعليمي',
      jobNumberLabel: 'الرقم الوظيفي',
      emailLabel: 'البريد الإلكتروني',
      phoneLabel: 'رقم الهاتف',
      saveBtn: 'حفظ بيانات الزائر',
      deleteConfirm: 'هل أنت متأكد من حذف هذا الزائر من الدليل؟',
      noVisitors: 'لا يوجد زائرون مسجلون حالياً. انقر على زر الإضافة لإدراج زائر جديد.',
      quickPick: 'اختيار زائر معتمد مسجل مسبقاً'
    },

    // Demo Data Management & Cleanup
    demoDataManagement: {
      title: 'إدارة السجلات والبيانات التجريبية',
      subtitle: 'حذف الزيارات التجريبية والمعلمين وخطط التطوير لبدء العمل الفعلي بسجل مدرسي رسمي خالٍ من البيانات الافتراضية.',
      clearVisitsBtn: 'حذف جميع الزيارات التجريبية',
      clearVisitsDesc: 'مسح كافة سجلات الزيارات الصفية المحفوظة حالياً والبدء بسجل زيارات جديد.',
      clearPlansBtn: 'حذف جميع خطط التطوير التجريبية',
      clearPlansDesc: 'مسح كافة خطط التطوير المهني والمتابعات التجريبية.',
      clearTeachersBtn: 'حذف جميع المعلمين التجريبيين',
      clearTeachersDesc: 'تفريغ سجل المعلمين التجريبي لتمكين استيراد الكادر التدريسي الفعلي للمدرسة عبر ملف CSV.',
      cleanStartBtn: 'تفريغ كامل البيانات والبدء بسجل رسمي نظيف',
      cleanStartDesc: 'حذف الزيارات والمعلمين وخطط التطوير دفعة واحدة وبدء السجل الأكاديمي الحقيقي للمدرسة.',
      restoreDemoBtn: 'استعادة السجلات التجريبية النموذجية',
      restoreDemoDesc: 'استرجاع البيانات التجريبية الافتراضية لأغراض التدريب والتجربة.',
      confirmModalTitle: 'تأكيد عملية حذف البيانات',
      confirmWarning: 'تنبيه أمان: هذه العملية ستقوم بحذف السجلات المحددة بشكل فوري ولن يمكن التراجع عنها.',
      confirmActionBtn: 'نعم، تابع الحذف',
      deletedSuccess: 'تم حذف السجلات بنجاح وتحديث النظام.'
    },

    // Public Home
    publicHome: {
      title: 'أَثَر | منظومة التميز والتطوير التعليمي',
      subtitle: '«نَرْصُدُ الأَدَاءَ... وَنَصْنَعُ الأَثَرَ»',
      badge: 'المنظومة الذكية للزيارات الصفية والتطوير المهني',
      loginBtn: 'تسجيل الدخول للمنظومة',
      featuresTitle: 'أركان المنظومة التربوية المتكاملة',
      feat1Title: 'رصد معياري دقيق',
      feat1Desc: 'تقييم شامل يستند إلى 22 مؤشراً صفياً و 10 مجالات رئيسية وفق معايير الجودة الإماراتية.',
      feat2Title: 'تعدد الزوار وفرق الملاحظة',
      feat2Desc: 'توثيق زيارات فرق التوجيه، مديري النطاق، والإداريين مع متابعة الحضور الصفي والغياب.',
      feat3Title: 'خطط تطوير مهني مستدامة',
      feat3Desc: 'ربط مباشر وفوري بين نقاط التحسين وخطط تدريبية إجرائية ذات مؤشرات أثر قابلة للقياس.',
      feat4Title: 'تكامل كامل مع Google Sheets',
      feat4Desc: 'تصدير تلقائي لكود Google Apps Script وهيكلية 18 ورقة عمل لقاعدة بيانات سحابية متينة.'
    },

    // Statuses
    status: {
      draft: 'مسودة',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتملة',
      approved: 'معتمدة',
      archived: 'مؤرشفة',
      active: 'نشط',
      inactive: 'معطل',
      not_started: 'لم تبدأ',
      needs_follow_up: 'تحتاج إلى متابعة'
    },

    // Ratings
    ratings: {
      yes: 'نعم',
      no: 'لا',
      needs_improvement: 'يحتاج إلى تحسين',
      not_observed: 'لم يُشاهد',
      outstanding: 'متميز',
      very_good: 'جيد جدًا',
      good: 'جيد',
      acceptable: 'مقبول',
      weak: 'ضعيف',
      very_weak: 'ضعيف جدًا',
      excellent: 'ممتاز'
    },

    // General Common
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      close: 'إغلاق',
      print: 'طباعة / حفظ كـ PDF',
      exportCsv: 'تصدير CSV',
      back: 'رجوع',
      search: 'بحث...',
      filter: 'تصفية',
      all: 'الكل',
      language: 'اللغة',
      arabic: 'العربية',
      english: 'English',
      switchLanguage: 'تغيير لغة المنصة',
      loading: 'جارٍ التحميل...',
      success: 'تمت العملية بنجاح',
      error: 'حدث خطأ، يرجى المحاولة ثانية'
    }
  },

  en: {
    platformName: 'ATHAR',
    platformTitle: 'Educational Excellence & Development System',
    slogan: '«Capturing Performance... Creating Impact»',
    schoolName: 'Al-Sadara Boys School - Cycle 2',
    schoolStage: 'Cycle 2 (Grades 5 - 8)',
    country: 'United Arab Emirates',

    // Navigation
    nav: {
      dashboard: 'Dashboard',
      teachers: 'Teachers',
      visits: 'Classroom Visits',
      newVisit: 'New Visit',
      plans: 'Development Plans',
      reports: 'Reports',
      gasHub: 'Google Apps Script',
      settings: 'Settings',
      login: 'Sign In',
      logout: 'Sign Out',
      currentUser: 'Current User',
      switchRole: 'Switch Role to Test Permissions'
    },

    // User Roles
    roles: {
      platform_admin: 'Platform Admin',
      school_admin: 'School Principal / Admin',
      vice_principal: 'Vice Principal / Academic VP',
      evaluator: 'Educational Evaluator',
      teacher: 'Teacher'
    },

    // Visitor Roles (Multiple Visitors & Roles)
    visitorRoles: {
      admin: 'Administrative Staff',
      teacher: 'Teacher / Peer',
      cluster_director: 'Cluster Director',
      principal: 'School Principal',
      vice_principal: 'Vice Principal / Academic VP',
      head_of_arabic: 'Head of Arabic Language Faculty',
      department_head: 'Department Head',
      academic_supervisor: 'Educational Supervisor / Specialist',
      evaluator: 'Certified Evaluator',
      other: 'Other'
    },

    // Student Gender
    studentGender: {
      boys: 'Boys (Male)',
      girls: 'Girls (Female)',
      mixed: 'Mixed (Co-ed)'
    },

    // Attendance & Demographics
    attendance: {
      title: 'Classroom Demographics & Student Attendance',
      subtitle: 'Record student attendance, absentees, and classroom gender type',
      totalStudents: 'Total Students',
      attendedStudents: 'Present / Attended',
      absentStudents: 'Absent Students',
      studentGender: 'Student Gender',
      attendanceRate: 'Attendance Rate',
      selectGender: 'Select Student Gender...',
      enterTotal: 'Total Count',
      enterAttended: 'Present Count',
      enterAbsent: 'Absent Count',
      autoCalcHint: 'Absentees are automatically calculated (Total - Present)'
    },

    // Visitors Team (Multiple Visitors)
    visitorsSection: {
      title: 'Observation & Visitors Team',
      subtitle: 'Document all participating visitors, supervisors, and their designations',
      primaryVisitor: 'Primary Observer / Entry Creator',
      additionalVisitors: 'Additional Visiting Observers',
      visitorName: 'Visitor Full Name',
      visitorRole: 'Visitor Designation / Role',
      selectRole: 'Select Designation...',
      addVisitor: '+ Add Another Visitor',
      removeVisitor: 'Remove',
      noAdditional: 'No additional visitors added yet (click to add team members)'
    },

    // Dashboard
    dashboard: {
      welcome: 'Welcome',
      leaderboard: 'Executive Monitoring Dashboard',
      teacherPortal: 'Teacher Performance & Growth Portal',
      teacherSubtitle: 'Review your approved classroom visit reports, feedback, and professional development plans.',
      adminSubtitle: 'Live classroom observation metrics, indicator mastery tracking, and professional growth progress.',
      startNewVisit: 'Start New Visit',
      assignPlan: 'Assign Development Plan',
      totalVisits: 'Total Visits',
      completedVisits: 'Completed Visits',
      inProgressVisits: 'In Progress / Drafts',
      teachersVisited: 'Teachers Visited',
      openPlans: 'Open Growth Plans',
      completedPlans: 'Completed Plans',
      full: 'Full Visit',
      quick: 'Quick Visit',
      performanceDistribution: 'Classroom Performance Level Distribution',
      performanceDesc: 'Calculated strictly based on observed indicators (excluding Not Observed)',
      visitsByTypeAndTerm: 'Visits by Type & Academic Term',
      visitsByTypeDesc: 'Full lesson observations (all indicators) vs. focused walkthroughs (10-15 min)',
      term1: 'Term 1',
      term2: 'Term 2 (Current)',
      term3: 'Term 3',
      topAchieved: 'Top Achieved Indicators (Pedagogical Strengths)',
      topNeedingImprovement: 'Indicators Requiring Growth & Training',
      recentVisits: 'Recent Classroom Observations',
      recentVisitsDesc: 'Click any visit record to view and print official report',
      viewAllVisits: 'View All Visits',
      tableVisitId: 'Visit ID',
      tableTeacher: 'Teacher',
      tableSubjectGrade: 'Subject / Grade',
      tableEvaluator: 'Observer & Visitors',
      tableType: 'Type',
      tableAchievement: 'Achievement %',
      tableStatus: 'Status',
      tableAction: 'Action',
      viewReport: 'Report',
      observedCount: 'observed'
    },

    // Visits Page & Form
    visits: {
      title: 'Classroom Observations Registry',
      subtitle: 'Manage and document full lesson visits, walkthroughs, and official certified evaluations',
      searchPlaceholder: 'Search by teacher name, subject, or visit ID...',
      filterAllTerms: 'All Terms',
      filterAllTypes: 'All Visit Types',
      filterAllEvaluators: 'All Observers',
      filterAllStatuses: 'All Statuses',
      fairComparisonNotice: 'Fair Evaluation Notice: Achievement percentage is calculated exclusively from observed indicators. Unobserved items are completely excluded from both numerator and denominator.',
      noVisitsFound: 'No classroom visits matched your filter criteria.',
      formTitleNew: 'Register New Classroom Visit',
      formTitleEdit: 'Edit Classroom Visit Record',
      step1: '1. Basic Info, Attendance & Visitors',
      step2: '2. 22 Core Indicators',
      step3: '3. 10 General Domains',
      step4: '4. e-Learning Maturity',
      step5: '5. Strengths & Recommendations',
      visitTypePrompt: 'Select Classroom Visit Type:',
      fullVisitLabel: 'Full Visit (Complete Lesson Observation)',
      fullVisitDesc: 'Comprehensive evaluation covering all 22 indicators and 10 quality domains.',
      quickVisitLabel: 'Quick Walkthrough (10 - 15 Minutes)',
      quickVisitDesc: 'Focused exploratory walkthrough targeting specific indicators linked to the visit objective.',
      teacherLabel: 'Target Teacher',
      selectTeacher: 'Select Teacher...',
      academicYear: 'Academic Year',
      term: 'Academic Term',
      grade: 'Grade Level',
      section: 'Section / Class',
      subject: 'Subject',
      visitDate: 'Observation Date',
      visitTime: 'Observation Time / Period',
      visitGoal: 'Classroom Visit Objective / Goal',
      choosePresetGoal: 'Select a standard goal from the presets or write a custom goal...',
      customGoalOption: '✏️ Write a custom goal...',
      suggestedIndicatorsForGoal: 'Suggested Indicators Linked to this Goal',
      selectIndicatorsForQuick: 'Select Targeted Indicators for this Quick Visit (Checked items will be evaluated):',
      autoSaveSaved: 'Auto-saved to draft',
      autoSaving: 'Auto-saving...',
      btnPrevious: 'Previous',
      btnNext: 'Next',
      btnSaveDraft: 'Save as Draft',
      btnSaveAndComplete: 'Complete & Approve Visit',
      indicatorsGroupedNote: 'Indicators are categorized in 5 standard clusters. Choose the appropriate rating for each indicator.',
      domainsMatrixNote: 'Assess the 10 general domains based on the authorized rubric (Outstanding down to Very Weak).',
      eLearningTitle: 'e-Learning Maturity & Technology Integration Level',
      strengthsTitle: 'Observed Strengths & Outstanding Pedagogical Practices',
      improvementTitle: 'Priority Growth & Development Areas',
      recommendationsTitle: 'Actionable Practical Recommendations for Follow-Up',
      addStrength: '+ Add Strength',
      addImprovement: '+ Add Growth Area'
    },

    // Teachers Management
    teachers: {
      title: 'Teaching Faculty',
      subtitle: 'Manage faculty roster, import teacher datasets, and track individual pedagogical growth',
      addNewTeacher: 'Add New Teacher',
      importCsv: 'Import from Excel / CSV',
      searchPlaceholder: 'Search by full name, job number, or specialization...',
      filterAllSpecs: 'All Specializations',
      filterAllStatuses: 'All Statuses',
      colJobNumber: 'Job ID',
      colName: 'Full Name',
      colSpec: 'Specialization / Subject',
      colEmailPhone: 'Email & Phone',
      colStatus: 'Status',
      colVisitsCount: 'Visits Count',
      colActions: 'Actions',
      viewProfileReport: 'Performance Report & History',
      deleteConfirm: 'Are you sure you want to delete this teacher?',
      modalAddTitle: 'Add New Faculty Member',
      fullNameLabel: 'Teacher Full Name',
      jobNumberLabel: 'Job ID / Number (Unique)',
      specLabel: 'Academic Specialization',
      emailLabel: 'Institutional Email',
      phoneLabel: 'Phone Number (Optional)',
      statusLabel: 'Account Status',
      duplicateJobNumberError: 'Error: Job ID is already assigned to another teacher!'
    },

    // Improvement Plans
    plans: {
      title: 'Professional Development Plans',
      subtitle: 'Track individualized teacher action plans designed to target areas identified during observations',
      addNewPlan: 'Assign New Development Plan',
      searchPlaceholder: 'Search by teacher name or action plan...',
      colTeacher: 'Teacher',
      colGoal: 'Development Goal & Area',
      colIndicator: 'Targeted Indicator',
      colProcedure: 'Action Procedure',
      colResponsible: 'Responsible & Follow-up',
      colFollowUpDate: 'Follow-Up Date',
      colStatus: 'Status',
      colActions: 'Action',
      followUpBtn: 'Record Follow-Up',
      followUpModalTitle: 'Record Development Plan Follow-Up Outcome',
      resultLabel: 'Follow-up Impact & Verification Outcome',
      notesLabel: 'Additional Notes & Feedback',
      changeStatusLabel: 'Update Plan Status'
    },

    // Reports View
    reports: {
      title: 'Executive Analytics & Reports',
      subtitle: 'Comprehensive analysis of school-wide performance, subject comparisons, and observer metrics',
      tabOverview: 'Overview & Key Metrics',
      tabTeachersComparison: 'Teacher Performance Comparison',
      tabSubjectsAnalysis: 'Subject-Level Analytics',
      tabEvaluatorsMetrics: 'Observer & Team Statistics',
      printReportBtn: 'Print Comprehensive Report',
      exportDataBtn: 'Export CSV Data'
    },

    // Printable Official Visit Report Modal
    visitReportModal: {
      officialTitle: 'Official Classroom Observation Report',
      badgeOfficial: 'Officially Certified',
      badgeDraft: 'Draft Under Review',
      visitDetails: 'Classroom Observation Details',
      teacherName: 'Teacher Name:',
      jobNumber: 'Job ID:',
      subjectGrade: 'Subject & Grade:',
      dateTime: 'Date & Period:',
      evaluator: 'Primary Observer:',
      visitType: 'Visit Type:',
      goal: 'Visit Goal:',
      achievementHeader: 'Achievement Percentage',
      achievementSubtext: 'Strictly excludes unobserved indicators',
      demographicsHeader: 'Student Attendance & Class Demographics',
      visitorsHeader: 'Authorized Observers & Visitors Team',
      indicatorsHeader: '22 Core Indicators Assessment Results',
      domainsHeader: '10 General Quality Domains Assessment',
      eLearningHeader: 'e-Learning Technology Maturity Level',
      strengthsHeader: 'Highlighted Strengths & Best Practices',
      growthHeader: 'Priority Areas for Pedagogical Growth',
      recommendationsHeader: 'Agreed Practical Recommendations',
      signaturesBlock: 'Official Signatures & Certifications',
      teacherSig: 'Observed Teacher Signature',
      evaluatorSig: 'Observer / Evaluator Signature',
      principalSig: 'School Principal / Cluster Director Approval',
      printBtn: 'Print Official Report (A4 / PDF)',
      closeBtn: 'Close'
    },

    // Settings
    settings: {
      title: 'System & Academic Settings',
      subtitle: 'Configure school identity, grade levels, sections, terms, subjects, and security audit logs',
      tabPlatform: 'School Identity & Platform Settings',
      tabAcademic: 'Academic Structure & Curriculum',
      tabVisitors: 'Visitors Directory',
      tabData: 'Demo Data Management',
      tabAudit: 'Security & Operations Audit Log',
      schoolNameLabel: 'Official School Name',
      stageLabel: 'Educational Stage',
      principalLabel: 'Principal Full Name',
      welcomeMsgLabel: 'Portal Welcome Message',
      logoUrlLabel: 'Official Logo URL',
      academicYearLabel: 'Active Academic Year',
      currentTermLabel: 'Current Academic Term',
      gradesList: 'Grade Levels',
      sectionsList: 'Numbered Sections',
      subjectsList: 'Academic Subjects',
      resetDefaultsBtn: 'Reset to Factory Defaults'
    },

    // Predefined Recommendation Banks
    recommendationBanks: {
      strengthsTitle: 'Key Strengths & Best Practices Bank (Multi-select)',
      growthTitle: 'Areas for Growth & Improvement Bank (Multi-select)',
      recommendationsTitle: 'Actionable Recommendations Bank (Multi-select)',
      followUpTitle: 'Suggested Follow-up Plan (Multi-select)',
      selectPrompt: 'Select from preset bank without typing...',
      selectedCount: 'Selected:',
      clearSelection: 'Clear Selection',
      noTypingBadge: 'Direct multi-selection from certified bank without manual typing',
      customItemPlaceholder: 'Or type an additional custom item and click Add...',
      addCustomBtn: 'Add',
      customBadge: 'Custom'
    },

    // Visitors Directory Management
    visitorsManagement: {
      title: 'Registered Evaluators & Observers Directory',
      subtitle: 'Manage and register evaluator names, cluster directors, and leadership titles for instant selection in classroom visits.',
      addBtn: '+ Add Evaluator or Visitor',
      editTitle: 'Edit Evaluator Details',
      newTitle: 'Register New Official Evaluator',
      nameLabel: 'Full Evaluator / Visitor Name *',
      roleLabel: 'Official Designation / Role *',
      roleTitleLabel: 'Detailed Job Title',
      deptLabel: 'Department / Authority / Cluster',
      jobNumberLabel: 'Job Number',
      emailLabel: 'Email Address',
      phoneLabel: 'Phone Number',
      saveBtn: 'Save Observer Details',
      deleteConfirm: 'Are you sure you want to remove this observer from the directory?',
      noVisitors: 'No registered observers found. Click the button above to add one.',
      quickPick: 'Pick from Registered Observers Directory'
    },

    // Demo Data Management & Cleanup
    demoDataManagement: {
      title: 'Demo Data & Records Management',
      subtitle: 'Clear sample visits, teachers, and improvement plans to start fresh with real institutional school records.',
      clearVisitsBtn: 'Clear All Demo Visits',
      clearVisitsDesc: 'Delete all current sample classroom observation records and start a fresh log.',
      clearPlansBtn: 'Clear All Demo Plans',
      clearPlansDesc: 'Delete all sample improvement plans and follow-up milestones.',
      clearTeachersBtn: 'Clear All Demo Teachers',
      clearTeachersDesc: 'Purge the sample teacher directory to enable clean bulk CSV import of real school faculty.',
      cleanStartBtn: 'Purge All Demo Data (Clean Slate Start)',
      cleanStartDesc: 'Delete all sample visits, teachers, and plans in one click to begin genuine institutional operations.',
      restoreDemoBtn: 'Restore Sample Demo Data',
      restoreDemoDesc: 'Re-populate the initial demonstration records for testing and training.',
      confirmModalTitle: 'Confirm Data Purge Operation',
      confirmWarning: 'Security Notice: This operation will permanently delete the selected records. This cannot be undone.',
      confirmActionBtn: 'Yes, Proceed with Purge',
      deletedSuccess: 'Records deleted successfully. System updated.'
    },

    // Public Home
    publicHome: {
      title: 'ATHAR | Educational Excellence & Growth System',
      subtitle: '«Capturing Performance... Creating Impact»',
      badge: 'Smart Classroom Observation & Professional Growth Suite',
      loginBtn: 'Sign In to Portal',
      featuresTitle: 'Pillars of the Integrated Educational Framework',
      feat1Title: 'Rigorous Standardized Rubrics',
      feat1Desc: 'Comprehensive observation framework grounded in 22 classroom indicators and 10 quality domains matching UAE excellence standards.',
      feat2Title: 'Multi-Observer Teams & Attendance',
      feat2Desc: 'Document observation visits by cluster directors, vice principals, and supervisory teams alongside real student attendance metrics.',
      feat3Title: 'Targeted Professional Development',
      feat3Desc: 'Direct linkage between observed growth areas and measurable action procedures with timely follow-up verification.',
      feat4Title: 'Native Google Sheets & GAS Suite',
      feat4Desc: 'Automated 1-click Google Apps Script generator creating an 18-sheet relational database architecture.'
    },

    // Statuses
    status: {
      draft: 'Draft',
      in_progress: 'In Progress',
      completed: 'Completed',
      approved: 'Approved',
      archived: 'Archived',
      active: 'Active',
      inactive: 'Inactive',
      not_started: 'Not Started',
      needs_follow_up: 'Needs Follow-Up'
    },

    // Ratings
    ratings: {
      yes: 'Yes',
      no: 'No',
      needs_improvement: 'Needs Improvement',
      not_observed: 'Not Observed',
      outstanding: 'Outstanding',
      very_good: 'Very Good',
      good: 'Good',
      acceptable: 'Acceptable',
      weak: 'Weak',
      very_weak: 'Very Weak',
      excellent: 'Excellent'
    },

    // General Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      print: 'Print / Save PDF',
      exportCsv: 'Export CSV',
      back: 'Back',
      search: 'Search...',
      filter: 'Filter',
      all: 'All',
      language: 'Language',
      arabic: 'العربية',
      english: 'English',
      switchLanguage: 'Switch Language',
      loading: 'Loading...',
      success: 'Operation completed successfully',
      error: 'An error occurred, please try again'
    }
  }
};
