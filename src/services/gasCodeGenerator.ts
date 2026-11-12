export interface GasFile {
  name: string;
  type: 'gs' | 'html' | 'json' | 'md';
  description: string;
  content: string;
}

export const GAS_FILES: GasFile[] = [
  {
    name: 'Code.gs',
    type: 'gs',
    description: 'الخادم البرمجي الرئيسي لـ Google Apps Script مع تهيئة 18 ورقة في Google Sheets والأمان وحساب نسبة الإنجاز واستبعاد «لم يُشاهد»',
    content: `/**
 * @file Code.gs
 * خادم منصة «أَثَر» - منظومة التميز والتطوير التعليمي
 * Google Apps Script Web App Backend & Google Sheets Database Architecture
 */

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

function initializeDatabase() {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);
  
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
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, headers.length)
          .setBackground('#172C40')
          .setFontColor('#FFFFFF')
          .setFontWeight('bold');
        results.push("تم إنشاء ورقة: " + sheetName);
      }
    }
    
    seedInitialDataIfEmpty(ss);
    
    return {
      success: true,
      message: "تمت تهيئة قاعدة البيانات بنجاح (18 ورقة عمل).",
      spreadsheetUrl: ss.getUrl()
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    lock.releaseLock();
  }
}`
  },
  {
    name: 'Index.html',
    type: 'html',
    description: 'واجهة المستخدم الرئيسية لتطبيق الويب المنشور على Google Apps Script',
    content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>أَثَر | منظومة التميز والتطوير التعليمي</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <?!= include('Styles'); ?>
</head>
<body class="bg-[#F2EBDD]/20 text-[#172C40] antialiased">
  <div id="gas-app-container">
    <header class="athar-header">
      <div class="brand-zone">
        <span class="brand-title">أَثَر</span>
        <span class="brand-subtitle">منظومة التميز والتطوير التعليمي</span>
      </div>
      <div class="school-zone">
        <span class="school-name">مدرسة الصدارة بنين - الحلقة الثانية</span>
        <span class="school-slogan">«نَرْصُدُ الأَدَاءَ... وَنَصْنَعُ الأَثَرَ»</span>
      </div>
      <div class="user-zone">
        <span id="user-display" class="user-badge">جاري التحقق...</span>
      </div>
    </header>

    <nav class="athar-nav">
      <button class="nav-btn active" onclick="switchGasTab('dashboard')">لوحة التحكم</button>
      <button class="nav-btn" onclick="switchGasTab('teachers')">إدارة المعلمين</button>
      <button class="nav-btn" onclick="switchGasTab('new-visit')">زيارة جديدة</button>
      <button class="nav-btn" onclick="switchGasTab('visits')">سجل الزيارات</button>
      <button class="nav-btn" onclick="switchGasTab('plans')">خطط التطوير</button>
      <button class="nav-btn" onclick="switchGasTab('database-init')">تهيئة Google Sheets</button>
    </nav>

    <main id="main-content" class="athar-main">
      <div id="tab-viewport"></div>
    </main>
  </div>

  <?!= include('Client'); ?>
</body>
</html>`
  },
  {
    name: 'Styles.html',
    type: 'html',
    description: 'تنسيقات CSS المتوافقة مع Google Apps Script بهوية أَثَر الرسمية (كحلي، ذهبي، بيج، أخضر)',
    content: `<style>
  :root {
    --navy: #172C40;
    --gold: #C6A66A;
    --beige: #F2EBDD;
    --green: #668575;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
  body { background-color: rgba(242, 235, 221, 0.2); color: var(--navy); direction: rtl; }
  .athar-header { background-color: var(--navy); color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--gold); }
  .brand-title { font-size: 1.75rem; font-weight: 800; color: var(--gold); }
  .athar-nav { background: #fff; padding: 0.5rem 2rem; display: flex; gap: 0.75rem; border-bottom: 1px solid #e2e8f0; }
  .nav-btn { background: transparent; border: none; padding: 0.5rem 1.25rem; font-weight: 600; cursor: pointer; border-radius: 6px; }
  .nav-btn.active { background: var(--navy); color: #fff; }
</style>`
  },
  {
    name: 'Client.html',
    type: 'html',
    description: 'نظام الاستدعاءات التفاعلي والربط بين واجهة المستخدم و google.script.run',
    content: `<script>
  function executeDatabaseInit() {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          alert(res.message);
        })
        .withFailureHandler(function(err) {
          alert("خطأ: " + err.message);
        })
        .initializeDatabase();
    }
  }
</script>`
  },
  {
    name: 'appsscript.json',
    type: 'json',
    description: 'ملف بيان إعدادات Google Apps Script وتوقيت دبي وأذونات Google Sheets',
    content: `{
  "timeZone": "Asia/Dubai",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}`
  }
];
