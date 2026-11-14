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
    name: 'SharedDatabase.gs',
    type: 'gs',
    description: 'قاعدة البيانات المركزية المشتركة، حسابات الدخول الآمنة، الصلاحيات، الأرشفة وسجل التدقيق المركزي',
    content: "/**\n * أَثَر — قاعدة البيانات المركزية المشتركة\n * يضاف هذا الملف إلى مشروع Apps Script المرتبط بجدول بيانات أَثَر.\n * لا يغيّر ملفات الواجهة الحالية ولا يحذف أي بيانات.\n */\nconst ATHAR_DB = {\n  records: 'CentralRecords',\n  users: 'CentralUsers',\n  audit: 'CentralAudit',\n  cacheSeconds: 21600,\n  roles: ['platform_admin','school_admin','vice_principal','evaluator','teacher']\n};\n\nfunction setupCentralDatabase() {\n  const ss = SpreadsheetApp.getActiveSpreadsheet();\n  if (!ss) throw new Error('اربط مشروع Apps Script بجدول بيانات أَثَر أولاً.');\n  const schemas = {\n    CentralRecords: ['recordId','entity','schoolId','payload','createdAt','updatedAt','updatedBy','deletedAt'],\n    CentralUsers: ['userId','username','passwordHash','salt','name','role','schoolId','jobNumber','status','createdAt','updatedAt'],\n    CentralAudit: ['eventId','schoolId','timestamp','userId','userName','userRole','action','entity','entityId','details','clientId']\n  };\n  Object.keys(schemas).forEach(name => {\n    let sh = ss.getSheetByName(name);\n    if (!sh) sh = ss.insertSheet(name);\n    if (sh.getLastRow() === 0) sh.appendRow(schemas[name]);\n    sh.setFrozenRows(1);\n    sh.getRange(1,1,1,schemas[name].length).setBackground('#172C40').setFontColor('#FFFFFF').setFontWeight('bold');\n  });\n  return {success:true, spreadsheetUrl:ss.getUrl(), sheets:Object.keys(schemas)};\n}\n\n/** شغّل هذه الدالة مرة واحدة من محرر Apps Script لإنشاء أول مسؤول مركزي.\n * عيّن ATHAR_BOOTSTRAP_USER وATHAR_BOOTSTRAP_PASSWORD في Script Properties قبل التشغيل.\n * لا تضع كلمة المرور في ملفات المشروع أو في الواجهة.\n */\nfunction createInitialCentralAdmin() {\n  const props = PropertiesService.getScriptProperties();\n  const username = String(props.getProperty('ATHAR_BOOTSTRAP_USER') || '').trim().toLowerCase();\n  const password = String(props.getProperty('ATHAR_BOOTSTRAP_PASSWORD') || '');\n  if (username.length < 4 || password.length < 12) throw new Error('أدخل اسم مستخدم من 4 أحرف وكلمة مرور قوية من 12 حرفاً على الأقل في Script Properties.');\n  setupCentralDatabase();\n  const sh = SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);\n  const rows = sh.getDataRange().getValues();\n  if (rows.length > 1) throw new Error('يوجد مستخدمون بالفعل؛ لن يتم إنشاء مسؤول أول أو استبدال بيانات الدخول.');\n  const salt = Utilities.getUuid() + Utilities.getUuid();\n  sh.appendRow([Utilities.getUuid(),username,atharHash_(password,salt),'sha256:'+salt,'مسؤول منصة أَثَر','platform_admin','sch_alsadara_01','','active',new Date().toISOString(),new Date().toISOString()]);\n  props.deleteProperty('ATHAR_BOOTSTRAP_PASSWORD');\n  return {success:true,message:'تم إنشاء حساب المسؤول المركزي. احتفظ ببيانات الدخول في مكان آمن.'};\n}\n\nfunction atharHash_(password, salt) {\n  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + String(password), Utilities.Charset.UTF_8);\n  return Utilities.base64Encode(bytes);\n}\nfunction atharJson_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }\nfunction atharFindUser_(username) {\n  const sh = SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);\n  if (!sh || sh.getLastRow() < 2) return null;\n  const values = sh.getDataRange().getValues();\n  const headers = values[0];\n  const ix = Object.fromEntries(headers.map((h,i)=>[String(h),i]));\n  for (let r=1;r<values.length;r++) if (String(values[r][ix.username]).toLowerCase()===String(username).toLowerCase()) {\n    const o={}; headers.forEach((h,i)=>o[h]=values[r][i]); o._row=r+1; return o;\n  }\n  return null;\n}\nfunction atharSession_(token) {\n  if (!token) return null;\n  const raw=CacheService.getScriptCache().get('athar_session_'+token);\n  if (!raw) return null;\n  return JSON.parse(raw);\n}\nfunction atharRequire_(token, roles) {\n  const user=atharSession_(token);\n  if (!user) throw new Error('انتهت الجلسة أو بيانات الدخول غير صالحة. يرجى تسجيل الدخول مجدداً.');\n  if (roles && roles.indexOf(user.role)===-1) throw new Error('ليست لديك صلاحية لتنفيذ هذه العملية.');\n  return user;\n}\nfunction atharAudit_(user, action, entity, entityId, details, clientId) {\n  SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.audit).appendRow([\n    Utilities.getUuid(),user.schoolId,new Date().toISOString(),user.userId,user.name,user.role,\n    action,entity||'',entityId||'',String(details||''),String(clientId||'')\n  ]);\n}\nfunction atharRows_(entity, schoolId, includeDeleted) {\n  const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.records);\n  if (!sh || sh.getLastRow()<2) return [];\n  const rows=sh.getDataRange().getValues(), h=rows[0], ix=Object.fromEntries(h.map((x,i)=>[String(x),i]));\n  return rows.slice(1).filter(r=>String(r[ix.entity])===entity && String(r[ix.schoolId])===String(schoolId) && (includeDeleted || !r[ix.deletedAt])).map(r=>({\n    recordId:String(r[ix.recordId]), entity:String(r[ix.entity]), payload:JSON.parse(String(r[ix.payload]||'{}')),\n    createdAt:r[ix.createdAt],updatedAt:r[ix.updatedAt],updatedBy:r[ix.updatedBy],deletedAt:r[ix.deletedAt]||''\n  }));\n}\nfunction atharUpsert_(user, entity, record, clientId) {\n  const allowed=['teachers','visits','plans','settings','visitors'];\n  if (allowed.indexOf(entity)===-1) throw new Error('نوع سجل غير مدعوم.');\n  if (user.role==='teacher' && entity!=='plans') throw new Error('المعلم لا يملك صلاحية تعديل هذا النوع من السجلات.');\n  if (user.role==='teacher' && entity==='plans') throw new Error('تحديث خطط المعلم يتم عبر إجراءات المتابعة المعتمدة فقط.');\n  const id=String(record.id||record.recordId||'');\n  if (!id) throw new Error('معرّف السجل مطلوب.');\n  if (entity==='visits' && !['platform_admin','school_admin','vice_principal','evaluator'].includes(user.role)) throw new Error('غير مصرح بحفظ الزيارات.');\n  if (['teachers','settings','visitors'].includes(entity) && !['platform_admin','school_admin'].includes(user.role)) throw new Error('هذه العملية مقتصرة على إدارة المنصة والمدرسة.');\n  const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.records);\n  const rows=sh.getDataRange().getValues(), h=rows[0], ix=Object.fromEntries(h.map((x,i)=>[String(x),i]));\n  let row=-1;\n  for(let i=1;i<rows.length;i++) if(String(rows[i][ix.recordId])===id && String(rows[i][ix.entity])===entity && String(rows[i][ix.schoolId])===user.schoolId){row=i+1;break;}\n  const now=new Date().toISOString();\n  const oldCreated=row>0?rows[row-1][ix.createdAt]:now;\n  const data=[id,entity,user.schoolId,JSON.stringify(record),oldCreated,now,user.userId,''];\n  if(row>0) sh.getRange(row,1,1,data.length).setValues([data]); else sh.appendRow(data);\n  atharAudit_(user,'حفظ/تحديث سجل',entity,id,'تم حفظ سجل مركزي.',clientId);\n  return {id,updatedAt:now};\n}\nfunction atharDelete_(user, entity, id, clientId) {\n  if (!['platform_admin','school_admin'].includes(user.role)) throw new Error('الحذف مقتصر على الإدارة المخولة.');\n  const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.records);\n  const rows=sh.getDataRange().getValues(), h=rows[0], ix=Object.fromEntries(h.map((x,i)=>[String(x),i]));\n  for(let i=1;i<rows.length;i++) if(String(rows[i][ix.recordId])===String(id)&&String(rows[i][ix.entity])===entity&&String(rows[i][ix.schoolId])===user.schoolId) {\n    sh.getRange(i+1,ix.deletedAt+1).setValue(new Date().toISOString());\n    atharAudit_(user,'حذف منطقي',entity,id,'تم إخفاء السجل من العرض مع الاحتفاظ به في الأرشيف.',clientId);\n    return {success:true};\n  }\n  throw new Error('السجل المطلوب غير موجود.');\n}\n\nfunction doGet(e) {\n  const t=HtmlService.createTemplateFromFile('Index');\n  t.platformTitle='أَثَر | منظومة التميز والتطوير التعليمي';\n  t.schoolName='مدرسة الصدارة بنين - الحلقة الثانية';\n  return t.evaluate().setTitle(t.platformTitle).addMetaTag('viewport','width=device-width, initial-scale=1.0').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);\n}\n\n/** POST من النموذج المخفي؛ يعيد رسالة إلى النافذة الأم بعد إتمام العملية. */\nfunction doPost(e) {\n  let result={success:false};\n  try {\n    const body=JSON.parse((e.parameter && e.parameter.payload)||'{}');\n    result=atharApiWrite_(body);\n  } catch(err) { result={success:false,error:String(err.message||err)}; }\n  const safe=JSON.stringify(result).replace(/</g,'\\\\u003c');\n  return HtmlService.createHtmlOutput('<!doctype html><meta charset=\"utf-8\"><script>parent.postMessage({type:\"ATHAR_DB_RESULT\",payload:'+safe+'},\"https://aboasmaa2273-code.github.io\");</script>');\n}\nfunction atharApiWrite_(b) {\n  if(b.action==='login') {\n    const u=atharFindUser_(String(b.username||'').trim().toLowerCase());\n    if(!u || String(u.status)!=='active' || atharHash_(String(b.password||''),String(u.salt).replace(/^sha256:/,''))!==String(u.passwordHash)) throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة.');\n    const token=Utilities.getUuid()+Utilities.getUuid();\n    const session={userId:String(u.userId),name:String(u.name),role:String(u.role),schoolId:String(u.schoolId),jobNumber:String(u.jobNumber||'')};\n    CacheService.getScriptCache().put('athar_session_'+token,JSON.stringify(session),ATHAR_DB.cacheSeconds);\n    atharAudit_(session,'تسجيل دخول','session',session.userId,'تسجيل دخول ناجح.',b.clientId);\n    return {success:true,token,user:session,expiresIn:ATHAR_DB.cacheSeconds};\n  }\n  const user=atharRequire_(b.token);\n  if(b.action==='list') {\n    const entity=String(b.entity||'');\n    if(['platform_admin','school_admin','vice_principal'].includes(user.role)===false && ['teachers','settings','visitors'].includes(entity)) throw new Error('ليست لديك صلاحية عرض هذا السجل.');\n    if(!['teachers','visits','plans','settings','visitors'].includes(entity)) throw new Error('نوع السجل غير مدعوم.');\n    let records=atharRows_(entity,user.schoolId,false);\n    if(user.role==='evaluator' && entity==='visits') records=records.filter(x=>String(x.payload.evaluatorId)===user.userId);\n    if(user.role==='teacher') {\n      if(entity==='visits') records=records.filter(x=>String(x.payload.teacherJobNumber)===String(user.jobNumber));\n      else if(entity==='plans') records=records.filter(x=>String(x.payload.teacherJobNumber)===String(user.jobNumber));\n      else throw new Error('ليست لديك صلاحية عرض هذا السجل.');\n    }\n    return {success:true,records:records};\n  }\n  if(b.action==='audit') {\n    if(!['platform_admin','school_admin','vice_principal'].includes(user.role)) throw new Error('سجل التدقيق متاح للإدارة المخولة فقط.');\n    const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.audit), rows=sh.getDataRange().getValues();\n    return {success:true,records:rows.length>1?rows.slice(1).filter(r=>String(r[1])===user.schoolId).reverse().slice(0,5000):[]};\n  }\n  if(b.action==='adminCreateUser') {\n    const admin=atharRequire_(b.token,['platform_admin','school_admin']);\n    const username=String(b.username||'').trim().toLowerCase();\n    const password=String(b.password||'');\n    const name=String(b.name||'').trim();\n    const role=String(b.role||'evaluator');\n    if(username.length<4 || password.length<12 || !name || ATHAR_DB.roles.indexOf(role)<0) throw new Error('تحقق من الاسم واسم المستخدم وكلمة المرور والصلاحية.');\n    if(atharFindUser_(username)) throw new Error('اسم المستخدم مستخدم بالفعل.');\n    const salt=Utilities.getUuid()+Utilities.getUuid();\n    SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users).appendRow([Utilities.getUuid(),username,atharHash_(password,salt),'sha256:'+salt,name,role,admin.schoolId,String(b.jobNumber||''),'active',new Date().toISOString(),new Date().toISOString()]);\n    atharAudit_(admin,'إنشاء حساب', 'user',username,'إنشاء حساب جديد بصلاحية '+role,b.clientId);\n    return {success:true};\n  }\n  if(b.action==='bulkImport') {\n    if(!['platform_admin','school_admin'].includes(user.role)) throw new Error('استيراد السجلات القديمة مقتصر على مسؤول المنصة أو المدرسة.');\n    const items=Array.isArray(b.items)?b.items:[];\n    if(items.length>100) throw new Error('يرجى إرسال 100 سجل كحد أقصى في الدفعة الواحدة.');\n    const lock=LockService.getScriptLock(); lock.waitLock(20000);\n    try {\n      const imported=[];\n      items.forEach(item=>imported.push(atharUpsert_(user,String(item.entity),item.record||{},b.clientId)));\n      atharAudit_(user,'استيراد دفعة بيانات','migration','', 'عدد السجلات المستوردة: '+imported.length,b.clientId);\n      return {success:true,imported:imported.length};\n    } finally { lock.releaseLock(); }\n  }\n  if(b.action==='upsert') {\n    const lock=LockService.getScriptLock(); lock.waitLock(20000);\n    try { return {success:true,record:atharUpsert_(user,String(b.entity),b.record||{},b.clientId)}; }\n    finally { lock.releaseLock(); }\n  }\n  if(b.action==='delete') return atharDelete_(user,String(b.entity),String(b.id),b.clientId);\n  if(b.action==='logout') { CacheService.getScriptCache().remove('athar_session_'+b.token); atharAudit_(user,'تسجيل خروج','session',user.userId,'تسجيل خروج.',b.clientId); return {success:true}; }\n  throw new Error('طلب كتابة غير معروف.');\n}\n"
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
