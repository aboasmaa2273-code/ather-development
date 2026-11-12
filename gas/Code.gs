/**
 * @file Code.gs
 * @description خادم منصة «أَثَر» - منظومة التميز والتطوير التعليمي
 * «نَرْصُدُ الأَدَاءَ... وَنَصْنَعُ الأَثَرَ»
 * Google Apps Script Web App Backend & Google Sheets Database Architecture
 */

// ==========================================
// 1. الدخول وعرض واجهة الويب (Web App Entry)
// ==========================================

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  template.platformTitle = "أَثَر | منظومة التميز والتطوير التعليمي";
  template.schoolName = "مدرسة الصدارة بنين - الحلقة الثانية";
  
  return template.evaluate()
    .setTitle('أَثَر | منظومة التميز والتطوير التعليمي')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ====================================================
// 2. تهيئة قاعدة البيانات وأوراق العمل (18 ورقة عمل)
// ====================================================

function initializeDatabase() {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000); // 30 seconds wait
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create("أَثَر - قاعدة بيانات منظومة التميز والتطوير التعليمي");
    }
    
    var sheetsSchema = {
      'Users': ['id', 'schoolId', 'name', 'email', 'role', 'jobNumber', 'specialization', 'status', 'createdAt'],
      'Schools': ['id', 'name', 'code', 'stage', 'welcomeMessage', 'primaryColor', 'secondaryColor', 'contactEmail', 'contactPhone'],
      'Teachers': ['id', 'schoolId', 'fullName', 'jobNumber', 'specialization', 'status', 'email', 'phone', 'dateAdded'],
      'Visits': ['id', 'schoolId', 'academicYear', 'term', 'visitType', 'teacherId', 'teacherName', 'teacherJobNumber', 'teacherSpecialization', 'grade', 'section', 'subject', 'evaluatorId', 'evaluatorName', 'date', 'time', 'visitGoal', 'status', 'achievementPercentage', 'observedCount', 'totalCount', 'eLearningMaturity', 'strengths', 'improvementAreas', 'recommendations', 'createdAt', 'updatedAt'],
      'VisitIndicators': ['id', 'visitId', 'indicatorId', 'indicatorText', 'group', 'rating', 'notes', 'timestamp'],
      'VisitDomains': ['id', 'visitId', 'domainId', 'domainName', 'rating'],
      'IndicatorLibrary': ['id', 'code', 'group', 'text', 'description', 'isActive'],
      'EvaluationDomains': ['id', 'code', 'name', 'description'],
      'Subjects': ['id', 'schoolId', 'name', 'isActive'],
      'Grades': ['id', 'schoolId', 'name', 'isActive'],
      'Sections': ['id', 'schoolId', 'name', 'isActive'],
      'AcademicYears': ['id', 'schoolId', 'yearLabel', 'isCurrent'],
      'Terms': ['id', 'schoolId', 'termName', 'isCurrent'],
      'ImprovementPlans': ['id', 'schoolId', 'teacherId', 'teacherName', 'teacherJobNumber', 'improvementArea', 'relatedIndicator', 'goal', 'procedure', 'responsible', 'duration', 'followUpDate', 'status', 'createdAt'],
      'PlanFollowUps': ['id', 'planId', 'followUpDate', 'evaluatorName', 'result', 'notes', 'newStatus', 'recordedAt'],
      'Settings': ['key', 'value', 'updatedAt', 'updatedBy'],
      'AuditLog': ['id', 'schoolId', 'timestamp', 'userName', 'userRole', 'action', 'details'],
      'ReportTemplates': ['id', 'templateName', 'layoutJson', 'isDefault']
    };

    var results = [];
    for (var sheetName in sheetsSchema) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        var headers = sheetsSchema[sheetName];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        // تجميد وتنسيق الصف الأول
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, headers.length)
          .setBackground('#172C40')
          .setFontColor('#FFFFFF')
          .setFontWeight('bold');
        results.push("تم إنشاء ورقة العمل: " + sheetName);
      } else {
        results.push("ورقة العمل موجودة مسبقاً: " + sheetName);
      }
    }
    
    // إدخال البيانات الأولية إذا كانت ورقة المؤشرات فارغة
    seedInitialDataIfEmpty(ss);
    
    return {
      success: true,
      message: "تمت تهيئة قاعدة البيانات بنجاح (18 ورقة عمل).",
      spreadsheetUrl: ss.getUrl(),
      details: results
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 3. بذر البيانات الأولية (Seeding)
// ==========================================

function seedInitialDataIfEmpty(ss) {
  var indSheet = ss.getSheetByName('IndicatorLibrary');
  if (indSheet && indSheet.getLastRow() <= 1) {
    var indicators = [
      ['IND-01', 'التخطيط والاستعداد', 'مشاركة القوانين الصفية.', 'إيضاح وتفعيل القواعد الإيجابية', true],
      ['IND-02', 'التخطيط والاستعداد', 'مشاركة المخرجات التعليمية مع الطلبة بوضوح.', 'صياغة وعرض نواتج التعلم', true],
      ['IND-03', 'التخطيط والاستعداد', 'التهيئة الحافزة.', 'إثارة دافعية الطلبة', true],
      ['IND-04', 'المشاركة والتفاعل', 'إعطاء جميع الطلبة فرصة للمشاركة.', 'إتاحة فرص متكافئة', true],
      ['IND-05', 'التخطيط والاستعداد', 'مشاركة المفاهيم والمفردات الأساسية في الدرس.', 'استيعاب المفردات الجديدة', true],
      ['IND-06', 'المشاركة والتفاعل', 'تشجيع الطلبة على طرح الأسئلة.', 'تحفيز الفضول والتفكير', true],
      ['IND-07', 'الممارسات التدريسية', 'طرح أسئلة مختلفة المستويات.', 'التدرج المعرفي وفق بلوم', true],
      ['IND-08', 'الممارسات التدريسية', 'استخدام تقييم الأقران.', 'مراجعة الطلبة لأعمال زملائهم', true],
      ['IND-09', 'الممارسات التدريسية', 'وجود أنشطة تلبي احتياجات الطلبة المختلفة.', 'تمايز التعليم', true],
      ['IND-10', 'المشاركة والتفاعل', 'تحفيز الطلبة بطرق مختلفة.', 'تنويع أساليب التعزيز', true],
      ['IND-11', 'المشاركة والتفاعل', 'إعطاء الطلبة فرصة للقراءة خلال الحصة.', 'ممارسة القراءة الصامتة والجهرية', true],
      ['IND-12', 'المشاركة والتفاعل', 'إعطاء الطلبة فرصة للكتابة خلال الحصة.', 'الكتابة والتدوين التفسيري', true],
      ['IND-13', 'الممارسات التدريسية', 'استخدام مصادر تعلم مختلفة.', 'وسائط ونصوص ومجسمات إثرائية', true],
      ['IND-14', 'الممارسات التدريسية', 'توظيف التكنولوجيا من قبل المعلم.', 'شاشات ومنصات تفاعلية', true],
      ['IND-15', 'الممارسات التدريسية', 'وجود خاتمة للدرس.', 'غلق الدرس وتلخيص المعرفة', true],
      ['IND-16', 'الربط والتكامل', 'الربط بالحياة الواقعية للطلبة والخبرات التعليمية السابقة والمواد الأخرى.', 'أمثلة واقعية إماراتية', true],
      ['IND-17', 'بيئة التعلم', 'وجود روتين لإدارة البيئة الصفية.', 'سلاسة الحركة والنظام', true],
      ['IND-18', 'بيئة التعلم', 'توظيف التكنولوجيا من قبل الطلبة.', 'استخدام الأجهزة اللوحية', true],
      ['IND-19', 'بيئة التعلم', 'إدارة وقت الحصة بفعالية.', 'التوازن الدقيق بين الأنشطة', true],
      ['IND-20', 'الممارسات التدريسية', 'كيف كان تقدم الطلبة؟', 'رصد التطور الفعلي للفهم', true],
      ['IND-21', 'الممارسات التدريسية', 'كيف كانت التغذية الراجعة التي قام المعلم بتزويدها للطلبة؟', 'توجيهات نوعية فورية', true],
      ['IND-22', 'الربط والتكامل', 'الربط بالهوية الوطنية.', 'ترسيخ قيم التسامح والانتماء', true]
    ];
    
    var rows = indicators.map(function(row, idx) {
      return [Utilities.getUuid(), row[0], row[1], row[2], row[3], row[4]];
    });
    indSheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
}

// ==========================================
// 4. استرجاع البيانات المبدئية (Bootstrap)
// ==========================================

function getBootstrapData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return { success: false, error: 'لم يتم العثور على جدول البيانات النشط. يُرجى تشغيل initializeDatabase().' };
    }

    var userEmail = Session.getActiveUser().getEmail();
    var userRole = determineUserRole(userEmail);
    
    return {
      success: true,
      currentUser: {
        email: userEmail,
        role: userRole,
        name: userEmail ? userEmail.split('@')[0] : 'مستخدم نظام أَثَر'
      },
      schoolName: 'مدرسة الصدارة بنين - الحلقة الثانية',
      platformName: 'أَثَر',
      slogan: '«نَرْصُدُ الأَدَاءَ... وَنَصْنَعُ الأَثَرَ»'
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function determineUserRole(email) {
  if (!email) return 'school_admin';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var usersSheet = ss.getSheetByName('Users');
  if (!usersSheet || usersSheet.getLastRow() <= 1) return 'school_admin';
  
  var data = usersSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][3] && data[i][3].toString().toLowerCase() === email.toLowerCase()) {
      return data[i][4]; // role column
    }
  }
  return 'school_admin';
}

// ====================================================
// 5. حفظ واسترجاع الزيارات (Visits Management)
// ====================================================

function saveClassroomVisit(visitData) {
  var lock = LockService.getScriptLock();
  lock.tryLock(20000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var visitsSheet = ss.getSheetByName('Visits');
    var indSheet = ss.getSheetByName('VisitIndicators');
    
    if (!visitsSheet || !indSheet) {
      initializeDatabase();
      visitsSheet = ss.getSheetByName('Visits');
      indSheet = ss.getSheetByName('VisitIndicators');
    }

    // حساب نسبة الإنجاز مع استبعاد "لم يُشاهد" تماماً
    var indicators = visitData.indicators || [];
    var yesCount = 0;
    var needsImpCount = 0;
    var noCount = 0;
    var notObservedCount = 0;

    for (var i = 0; i < indicators.length; i++) {
      var r = indicators[i].rating;
      if (r === 'yes') yesCount++;
      else if (r === 'needs_improvement') needsImpCount++;
      else if (r === 'no') noCount++;
      else if (r === 'not_observed') notObservedCount++;
    }

    var observedCount = yesCount + needsImpCount + noCount;
    var achPct = 0;
    if (observedCount > 0) {
      achPct = Math.round(((yesCount * 1.0 + needsImpCount * 0.5) / observedCount) * 1000) / 10;
    }

    var visitId = visitData.id || ('VST-' + new Date().getFullYear() + '-' + Utilities.getUuid().substring(0, 5).toUpperCase());
    var timestamp = new Date().toISOString();

    var visitRow = [
      visitId,
      visitData.schoolId || 'sch_alsadara_01',
      visitData.academicYear,
      visitData.term,
      visitData.visitType,
      visitData.teacherId,
      visitData.teacherName,
      visitData.teacherJobNumber,
      visitData.teacherSpecialization,
      visitData.grade,
      visitData.section,
      visitData.subject,
      visitData.evaluatorId,
      visitData.evaluatorName,
      visitData.date,
      visitData.time,
      visitData.visitGoal,
      visitData.status || 'completed',
      achPct,
      observedCount,
      indicators.length,
      visitData.eLearningMaturity || 'good',
      JSON.stringify(visitData.strengths || []),
      JSON.stringify(visitData.improvementAreas || []),
      visitData.practicalRecommendations || '',
      timestamp,
      timestamp
    ];

    // التحقق هل الزيارة موجودة للتعديل
    var data = visitsSheet.getDataRange().getValues();
    var existingRowIndex = -1;
    for (var r = 1; r < data.length; r++) {
      if (data[r][0] === visitId) {
        existingRowIndex = r + 1;
        break;
      }
    }

    if (existingRowIndex > 0) {
      visitRow[25] = data[existingRowIndex - 1][25]; // keep original createdAt
      visitsSheet.getRange(existingRowIndex, 1, 1, visitRow.length).setValues([visitRow]);
    } else {
      visitsSheet.appendRow(visitRow);
    }

    // حفظ تفاصيل المؤشرات
    for (var k = 0; k < indicators.length; k++) {
      var ind = indicators[k];
      var indRow = [
        Utilities.getUuid(),
        visitId,
        ind.indicatorId,
        ind.indicatorText,
        ind.indicatorGroup,
        ind.rating,
        ind.notes || '',
        timestamp
      ];
      indSheet.appendRow(indRow);
    }

    // تسجيل العملية في AuditLog
    logAuditAction(visitData.schoolId || 'sch_alsadara_01', visitData.evaluatorName, 'حفظ زيارة صفية', 'حفظ زيارة للمعلم: ' + visitData.teacherName + ' بنسبة إنجاز ' + achPct + '%');

    return {
      success: true,
      visitId: visitId,
      achievementPercentage: achPct,
      message: 'تم حفظ الزيارة بنجاح في Google Sheets.'
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 6. إضافة المعلم والتحقق من التكرار
// ==========================================

function saveTeacher(teacherData) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Teachers');
    if (!sheet) {
      initializeDatabase();
      sheet = ss.getSheetByName('Teachers');
    }

    var jobNumber = teacherData.jobNumber.toString().trim();
    var fullName = teacherData.fullName.trim();
    var specialization = teacherData.specialization.trim();

    if (!jobNumber || !fullName || !specialization) {
      return { success: false, error: 'الاسم والرقم الوظيفي والتخصص حقول إلزامية.' };
    }

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][3] && data[i][3].toString().trim() === jobNumber) {
        if (!teacherData.id || data[i][0] !== teacherData.id) {
          return { success: false, error: 'الرقم الوظيفي (' + jobNumber + ') مستخدم مسبقاً لمعلم آخر.' };
        }
      }
    }

    var teacherId = teacherData.id || ('tch_' + Utilities.getUuid().substring(0, 8));
    var dateAdded = teacherData.dateAdded || new Date().toISOString().split('T')[0];

    var newRow = [
      teacherId,
      teacherData.schoolId || 'sch_alsadara_01',
      fullName,
      jobNumber,
      specialization,
      teacherData.status || 'active',
      teacherData.email || '',
      teacherData.phone || '',
      dateAdded
    ];

    if (teacherData.id) {
      for (var r = 1; r < data.length; r++) {
        if (data[r][0] === teacherData.id) {
          sheet.getRange(r + 1, 1, 1, newRow.length).setValues([newRow]);
          break;
        }
      }
    } else {
      sheet.appendRow(newRow);
    }

    logAuditAction(teacherData.schoolId || 'sch_alsadara_01', 'مسؤول النظام', 'حفظ بيانات معلم', 'تم حفظ المعلم: ' + fullName + ' (' + jobNumber + ')');

    return {
      success: true,
      teacherId: teacherId,
      message: 'تم حفظ بيانات المعلم بنجاح.'
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 7. سجل التدقيق والأمان
// ==========================================

function logAuditAction(schoolId, userName, action, details) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('AuditLog');
    if (sheet) {
      var row = [
        Utilities.getUuid(),
        schoolId,
        new Date().toLocaleString('ar-AE'),
        userName,
        'نظام أَثَر',
        action,
        details
      ];
      sheet.appendRow(row);
    }
  } catch (e) {
    console.error("Audit log error:", e);
  }
}
