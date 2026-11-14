/**
 * أَثَر — قاعدة البيانات المركزية المشتركة
 * يضاف هذا الملف إلى مشروع Apps Script المرتبط بجدول بيانات أَثَر.
 * لا يغيّر ملفات الواجهة الحالية ولا يحذف أي بيانات.
 */
const ATHAR_DB = {
  records: 'CentralRecords',
  users: 'CentralUsers',
  audit: 'CentralAudit',
  cacheSeconds: 21600,
  roles: ['platform_admin','school_admin','vice_principal','evaluator','teacher']
};

function setupCentralDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('اربط مشروع Apps Script بجدول بيانات أَثَر أولاً.');
  const schemas = {
    CentralRecords: ['recordId','entity','schoolId','payload','createdAt','updatedAt','updatedBy','deletedAt'],
    CentralUsers: ['userId','username','passwordHash','salt','name','role','schoolId','jobNumber','status','createdAt','updatedAt'],
    CentralAudit: ['eventId','schoolId','timestamp','userId','userName','userRole','action','entity','entityId','details','clientId']
  };
  Object.keys(schemas).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) sh.appendRow(schemas[name]);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,schemas[name].length).setBackground('#172C40').setFontColor('#FFFFFF').setFontWeight('bold');
  });
  return {success:true, spreadsheetUrl:ss.getUrl(), sheets:Object.keys(schemas)};
}

/** شغّل هذه الدالة مرة واحدة من محرر Apps Script لإنشاء أول مسؤول مركزي.
 * عيّن ATHAR_BOOTSTRAP_USER وATHAR_BOOTSTRAP_PASSWORD في Script Properties قبل التشغيل.
 * لا تضع كلمة المرور في ملفات المشروع أو في الواجهة.
 */
function createInitialCentralAdmin() {
  const props = PropertiesService.getScriptProperties();
  const username = String(props.getProperty('ATHAR_BOOTSTRAP_USER') || '').trim().toLowerCase();
  const password = String(props.getProperty('ATHAR_BOOTSTRAP_PASSWORD') || '');
  if (username.length < 4 || password.length < 12) throw new Error('أدخل اسم مستخدم من 4 أحرف وكلمة مرور قوية من 12 حرفاً على الأقل في Script Properties.');
  setupCentralDatabase();
  const sh = SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);
  const rows = sh.getDataRange().getValues();
  if (rows.length > 1) throw new Error('يوجد مستخدمون بالفعل؛ لن يتم إنشاء مسؤول أول أو استبدال بيانات الدخول.');
  const salt = Utilities.getUuid() + Utilities.getUuid();
  sh.appendRow([Utilities.getUuid(),username,atharHash_(password,salt),'sha256:'+salt,'مسؤول منصة أَثَر','platform_admin','sch_alsadara_01','','active',new Date().toISOString(),new Date().toISOString()]);
  props.deleteProperty('ATHAR_BOOTSTRAP_PASSWORD');
  return {success:true,message:'تم إنشاء حساب المسؤول المركزي. احتفظ ببيانات الدخول في مكان آمن.'};
}

function atharHash_(password, salt) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + String(password), Utilities.Charset.UTF_8);
  return Utilities.base64Encode(bytes);
}
function atharJson_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function atharFindUser_(username) {
  const sh = SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);
  if (!sh || sh.getLastRow() < 2) return null;
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const ix = Object.fromEntries(headers.map((h,i)=>[String(h),i]));
  for (let r=1;r<values.length;r++) if (String(values[r][ix.username]).toLowerCase()===String(username).toLowerCase()) {
    const o={}; headers.forEach((h,i)=>o[h]=values[r][i]); o._row=r+1; return o;
  }
  return null;
}
function atharSession_(token) {
  if (!token) return null;
  const raw=CacheService.getScriptCache().get('athar_session_'+token);
  if (!raw) return null;
  return JSON.parse(raw);
}
function atharRequire_(token, roles) {
  const user=atharSession_(token);
  if (!user) throw new Error('انتهت الجلسة أو بيانات الدخول غير صالحة. يرجى تسجيل الدخول مجدداً.');
  if (roles && roles.indexOf(user.role)===-1) throw new Error('ليست لديك صلاحية لتنفيذ هذه العملية.');
  return user;
}
function atharAudit_(user, action, entity, entityId, details, clientId) {
  SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.audit).appendRow([
    Utilities.getUuid(),user.schoolId,new Date().toISOString(),user.userId,user.name,user.role,
    action,entity||'',entityId||'',String(details||''),String(clientId||'')
  ]);
}
function atharRows_(entity, schoolId, includeDeleted) {
  const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.records);
  if (!sh || sh.getLastRow()<2) return [];
  const rows=sh.getDataRange().getValues(), h=rows[0], ix=Object.fromEntries(h.map((x,i)=>[String(x),i]));
  return rows.slice(1).filter(r=>String(r[ix.entity])===entity && String(r[ix.schoolId])===String(schoolId) && (includeDeleted || !r[ix.deletedAt])).map(r=>({
    recordId:String(r[ix.recordId]), entity:String(r[ix.entity]), payload:JSON.parse(String(r[ix.payload]||'{}')),
    createdAt:r[ix.createdAt],updatedAt:r[ix.updatedAt],updatedBy:r[ix.updatedBy],deletedAt:r[ix.deletedAt]||''
  }));
}
function atharUpsert_(user, entity, record, clientId) {
  const allowed=['teachers','visits','plans','settings','visitors'];
  if (allowed.indexOf(entity)===-1) throw new Error('نوع سجل غير مدعوم.');
  if (user.role==='teacher' && entity!=='plans') throw new Error('المعلم لا يملك صلاحية تعديل هذا النوع من السجلات.');
  if (user.role==='teacher' && entity==='plans') throw new Error('تحديث خطط المعلم يتم عبر إجراءات المتابعة المعتمدة فقط.');
  const id=String(record.id||record.recordId||'');
  if (!id) throw new Error('معرّف السجل مطلوب.');
  if (entity==='visits' && !['platform_admin','school_admin','vice_principal','evaluator'].includes(user.role)) throw new Error('غير مصرح بحفظ الزيارات.');
  if (['teachers','settings','visitors'].includes(entity) && !['platform_admin','school_admin'].includes(user.role)) throw new Error('هذه العملية مقتصرة على إدارة المنصة والمدرسة.');
  const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.records);
  const rows=sh.getDataRange().getValues(), h=rows[0], ix=Object.fromEntries(h.map((x,i)=>[String(x),i]));
  let row=-1;
  for(let i=1;i<rows.length;i++) if(String(rows[i][ix.recordId])===id && String(rows[i][ix.entity])===entity && String(rows[i][ix.schoolId])===user.schoolId){row=i+1;break;}
  const now=new Date().toISOString();
  const oldCreated=row>0?rows[row-1][ix.createdAt]:now;
  const data=[id,entity,user.schoolId,JSON.stringify(record),oldCreated,now,user.userId,''];
  if(row>0) sh.getRange(row,1,1,data.length).setValues([data]); else sh.appendRow(data);
  atharAudit_(user,'حفظ/تحديث سجل',entity,id,'تم حفظ سجل مركزي.',clientId);
  return {id,updatedAt:now};
}
function atharDelete_(user, entity, id, clientId) {
  if (!['platform_admin','school_admin'].includes(user.role)) throw new Error('الحذف مقتصر على الإدارة المخولة.');
  const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.records);
  const rows=sh.getDataRange().getValues(), h=rows[0], ix=Object.fromEntries(h.map((x,i)=>[String(x),i]));
  for(let i=1;i<rows.length;i++) if(String(rows[i][ix.recordId])===String(id)&&String(rows[i][ix.entity])===entity&&String(rows[i][ix.schoolId])===user.schoolId) {
    sh.getRange(i+1,ix.deletedAt+1).setValue(new Date().toISOString());
    atharAudit_(user,'حذف منطقي',entity,id,'تم إخفاء السجل من العرض مع الاحتفاظ به في الأرشيف.',clientId);
    return {success:true};
  }
  throw new Error('السجل المطلوب غير موجود.');
}

/** POST من النموذج المخفي؛ يعيد رسالة إلى النافذة الأم بعد إتمام العملية. */
function doPost(e) {
  let result={success:false};
  try {
    const body=JSON.parse((e.parameter && e.parameter.payload)||'{}');
    result=atharApiWrite_(body);
  } catch(err) { result={success:false,error:String(err.message||err)}; }
  const safe=JSON.stringify(result).replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><script>parent.postMessage({type:"ATHAR_DB_RESULT",payload:'+safe+'},"https://aboasmaa2273-code.github.io");</script>');
}
function atharApiWrite_(b) {
  if(b.action==='login') {
    const u=atharFindUser_(String(b.username||'').trim().toLowerCase());
    if(!u || String(u.status)!=='active' || atharHash_(String(b.password||''),String(u.salt).replace(/^sha256:/,''))!==String(u.passwordHash)) throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة.');
    const token=Utilities.getUuid()+Utilities.getUuid();
    const session={userId:String(u.userId),name:String(u.name),role:String(u.role),schoolId:String(u.schoolId),jobNumber:String(u.jobNumber||'')};
    CacheService.getScriptCache().put('athar_session_'+token,JSON.stringify(session),ATHAR_DB.cacheSeconds);
    atharAudit_(session,'تسجيل دخول','session',session.userId,'تسجيل دخول ناجح.',b.clientId);
    return {success:true,token,user:session,expiresIn:ATHAR_DB.cacheSeconds};
  }
  const user=atharRequire_(b.token);
  if(b.action==='list') {
    const entity=String(b.entity||'');
    if(['platform_admin','school_admin','vice_principal'].includes(user.role)===false && ['teachers','settings','visitors'].includes(entity)) throw new Error('ليست لديك صلاحية عرض هذا السجل.');
    if(!['teachers','visits','plans','settings','visitors'].includes(entity)) throw new Error('نوع السجل غير مدعوم.');
    let records=atharRows_(entity,user.schoolId,false);
    if(user.role==='evaluator' && entity==='visits') records=records.filter(x=>String(x.payload.evaluatorId)===user.userId);
    if(user.role==='teacher') {
      if(entity==='visits') records=records.filter(x=>String(x.payload.teacherJobNumber)===String(user.jobNumber));
      else if(entity==='plans') records=records.filter(x=>String(x.payload.teacherJobNumber)===String(user.jobNumber));
      else throw new Error('ليست لديك صلاحية عرض هذا السجل.');
    }
    return {success:true,records:records};
  }
  if(b.action==='audit') {
    if(!['platform_admin','school_admin','vice_principal'].includes(user.role)) throw new Error('سجل التدقيق متاح للإدارة المخولة فقط.');
    const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.audit), rows=sh.getDataRange().getValues();
    return {success:true,records:rows.length>1?rows.slice(1).filter(r=>String(r[1])===user.schoolId).reverse().slice(0,5000):[]};
  }
  if(b.action==='adminCreateUser') {
    const admin=atharRequire_(b.token,['platform_admin','school_admin']);
    const username=String(b.username||'').trim().toLowerCase();
    const password=String(b.password||'');
    const name=String(b.name||'').trim();
    const role=String(b.role||'evaluator');
    if(username.length<4 || password.length<12 || !name || ATHAR_DB.roles.indexOf(role)<0) throw new Error('تحقق من الاسم واسم المستخدم وكلمة المرور والصلاحية.');
    if(atharFindUser_(username)) throw new Error('اسم المستخدم مستخدم بالفعل.');
    const salt=Utilities.getUuid()+Utilities.getUuid();
    SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users).appendRow([Utilities.getUuid(),username,atharHash_(password,salt),'sha256:'+salt,name,role,admin.schoolId,String(b.jobNumber||''),'active',new Date().toISOString(),new Date().toISOString()]);
    atharAudit_(admin,'إنشاء حساب', 'user',username,'إنشاء حساب جديد بصلاحية '+role,b.clientId);
    return {success:true};
  }
  if(b.action==='bulkImport') {
    if(!['platform_admin','school_admin'].includes(user.role)) throw new Error('استيراد السجلات القديمة مقتصر على مسؤول المنصة أو المدرسة.');
    const items=Array.isArray(b.items)?b.items:[];
    if(items.length>100) throw new Error('يرجى إرسال 100 سجل كحد أقصى في الدفعة الواحدة.');
    const lock=LockService.getScriptLock(); lock.waitLock(20000);
    try {
      const imported=[];
      items.forEach(item=>imported.push(atharUpsert_(user,String(item.entity),item.record||{},b.clientId)));
      atharAudit_(user,'استيراد دفعة بيانات','migration','', 'عدد السجلات المستوردة: '+imported.length,b.clientId);
      return {success:true,imported:imported.length};
    } finally { lock.releaseLock(); }
  }
  if(b.action==='upsert') {
    const lock=LockService.getScriptLock(); lock.waitLock(20000);
    try { return {success:true,record:atharUpsert_(user,String(b.entity),b.record||{},b.clientId)}; }
    finally { lock.releaseLock(); }
  }
  if(b.action==='delete') return atharDelete_(user,String(b.entity),String(b.id),b.clientId);
  if(b.action==='logout') { CacheService.getScriptCache().remove('athar_session_'+b.token); atharAudit_(user,'تسجيل خروج','session',user.userId,'تسجيل خروج.',b.clientId); return {success:true}; }
  throw new Error('طلب كتابة غير معروف.');
}
