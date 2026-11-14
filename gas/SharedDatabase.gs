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
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // Verify the Apps Script HMAC byte-array implementation before creating credentials.
    atharPasswordSelfTest();
    setupCentralDatabase();
    const sh = SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);
    const rows = sh.getDataRange().getValues();
    if (rows.length > 1) throw new Error('يوجد مستخدمون بالفعل؛ لن يتم إنشاء مسؤول أول أو استبدال بيانات الدخول.');
    const salt = Utilities.getUuid() + Utilities.getUuid();
    sh.appendRow([Utilities.getUuid(),username,atharHash_(password,salt),'pbkdf2:'+salt,'مسؤول منصة أَثَر','platform_admin','sch_alsadara_01','','active',new Date().toISOString(),new Date().toISOString()]);
    props.deleteProperty('ATHAR_BOOTSTRAP_PASSWORD');
    return {success:true,message:'تم إنشاء حساب المسؤول المركزي. احتفظ ببيانات الدخول في مكان آمن.'};
  } finally {
    lock.releaseLock();
  }
}

// PBKDF2-HMAC-SHA256. The iteration count is deliberately bounded for Apps Script runtime.
const ATHAR_PASSWORD_ITERATIONS = 12000;
function atharHash_(password, salt) {
  const iterations = ATHAR_PASSWORD_ITERATIONS;
  const key = atharPbkdf2_(String(password), String(salt), iterations);
  return 'pbkdf2-sha256:' + iterations + ':' + Utilities.base64Encode(key);
}
function atharPbkdf2_(password, salt, iterations) {
  // Use the documented Byte[]/Byte[] HMAC overload for every PBKDF2 round.
  // Apps Script's String overload cannot be mixed with a Byte[] message.
  const saltBytes = Utilities.newBlob(String(salt)).getBytes();
  const block = saltBytes.concat([0, 0, 0, 1]); // INT_32_BE(1)
  const keyBytes = Utilities.newBlob(String(password)).getBytes();
  let u = Utilities.computeHmacSha256Signature(block, keyBytes);
  const result = u.slice();
  for (let i = 1; i < iterations; i++) {
    u = Utilities.computeHmacSha256Signature(u, keyBytes);
    for (let j = 0; j < result.length; j++) result[j] = result[j] ^ u[j];
  }
  return result;
}
function atharConstantTimeEquals_(a, b) {
  a = String(a || '');
  b = String(b || '');
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i % (a.length || 1)) || 0) ^ (b.charCodeAt(i % (b.length || 1)) || 0);
  }
  return diff === 0;
}
// PBKDF2-HMAC-SHA256 known-answer test using a published test vector.
// Safe to run manually in Apps Script; it does not read or modify spreadsheet data.
function atharPasswordSelfTest() {
  const actual = atharPbkdf2_('password', 'salt', 1)
    .map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
  const expected = '120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b';
  if (!atharConstantTimeEquals_(actual, expected)) {
    throw new Error('فشل اختبار PBKDF2؛ لا تنشئ حسابات مركزية قبل معالجة الخلل.');
  }
  return {success:true, test:'PBKDF2-HMAC-SHA256', vector:'RFC-compatible known-answer test'};
}
function atharVerifyPassword_(password, storedHash, storedSalt) {
  const encoded = String(storedHash || '');
  if (encoded.indexOf('pbkdf2-sha256:') === 0) {
    const parts = encoded.split(':');
    const iterations = Number(parts[1]);
    if (!Number.isInteger(iterations) || iterations < 10000 || iterations > 20000) return false;
    const candidate = Utilities.base64Encode(atharPbkdf2_(String(password), String(storedSalt), iterations));
    return atharConstantTimeEquals_(candidate, parts[2]);
  }
  // Temporary backward compatibility: successful legacy logins are upgraded immediately.
  const legacy = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(storedSalt) + String(password), Utilities.Charset.UTF_8);
  return atharConstantTimeEquals_(Utilities.base64Encode(legacy), encoded);
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
function atharFindUserById_(userId) {
  const sh = SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);
  if (!sh || sh.getLastRow() < 2) return null;
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const ix = Object.fromEntries(headers.map((h,i)=>[String(h),i]));
  for (let r=1;r<values.length;r++) if (String(values[r][ix.userId])===String(userId)) {
    const o={}; headers.forEach((h,i)=>o[h]=values[r][i]); o._row=r+1; return o;
  }
  return null;
}
function atharTeacherJobNumberInUse_(jobNumber, schoolId, excludeUserId) {
  const wanted = String(jobNumber || '').trim();
  if (!wanted) return false;
  const sh = SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);
  if (!sh || sh.getLastRow() < 2) return false;
  const rows = sh.getDataRange().getValues();
  const headers = rows[0];
  const ix = Object.fromEntries(headers.map((h,i)=>[String(h),i]));
  return rows.slice(1).some(r =>
    String(r[ix.role]) === 'teacher' &&
    String(r[ix.schoolId]) === String(schoolId) &&
    String(r[ix.jobNumber] || '').trim() === wanted &&
    String(r[ix.userId]) !== String(excludeUserId || '')
  );
}

function atharTeacherRegistryHasJobNumber_(jobNumber, schoolId) {
  const wanted = String(jobNumber || '').trim();
  if (!wanted) return false;
  const matches = atharRows_('teachers', schoolId, false).filter(row =>
    String(row.payload && row.payload.jobNumber || '').trim() === wanted &&
    String(row.payload && row.payload.status || 'active') === 'active'
  );
  // Ambiguous employee numbers must never grant access to multiple teachers' records.
  return matches.length === 1;
}

function atharAdminTarget_(admin, userId) {
  const target = atharFindUserById_(userId);
  if (!target || String(target.status)==='deleted') throw new Error('الحساب المطلوب غير موجود.');
  if (admin.role !== 'platform_admin' && String(target.schoolId) !== String(admin.schoolId)) {
    throw new Error('لا يمكنك إدارة حساب خارج نطاق مدرستك.');
  }
  if (admin.role !== 'platform_admin' && ['platform_admin','school_admin'].includes(String(target.role))) {
    throw new Error('لا تملك صلاحية تعديل حساب إداري أعلى.');
  }
  return target;
}

// حدّ محاولات تسجيل الدخول: خمس محاولات فاشلة لكل اسم مستخدم خلال 15 دقيقة.
function atharLoginRateKey_(username) {
  const digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(username||'').trim().toLowerCase(),Utilities.Charset.UTF_8);
  return 'athar_login_fail_'+Utilities.base64EncodeWebSafe(digest).replace(/=+$/,'');
}
function atharIsLoginBlocked_(username) {
  const raw=CacheService.getScriptCache().get(atharLoginRateKey_(username));
  return Number(raw||0)>=5;
}
function atharRecordFailedLogin_(username) {
  const lock=LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const cache=CacheService.getScriptCache();
    const key=atharLoginRateKey_(username);
    const count=Number(cache.get(key)||0)+1;
    cache.put(key,String(count),900);
    return count;
  } finally { lock.releaseLock(); }
}
function atharClearLoginFailures_(username) {
  CacheService.getScriptCache().remove(atharLoginRateKey_(username));
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
  // Re-check account state on every request so disabling/deleting a user takes effect immediately.
  const account = atharFindUserById_(user.userId);
  const teacherRegistryValid = !account || String(account.role) !== 'teacher' ||
    atharTeacherRegistryHasJobNumber_(account.jobNumber, account.schoolId);
  if (!account || String(account.status) !== 'active' || !teacherRegistryValid ||
      String(account.role) !== String(user.role) ||
      String(account.schoolId) !== String(user.schoolId) ||
      String(account.jobNumber || '') !== String(user.jobNumber || '') ||
      String(account.updatedAt || '') !== String(user.accountUpdatedAt || '')) {
    CacheService.getScriptCache().remove('athar_session_'+token);
    throw new Error('تم إيقاف الحساب أو تغيير صلاحياته. يرجى التواصل مع إدارة المنظومة.');
  }
  if (roles && roles.indexOf(user.role)===-1) throw new Error('ليست لديك صلاحية لتنفيذ هذه العملية.');
  return user;
}
function atharWithScriptLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return callback(); }
  finally { lock.releaseLock(); }
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
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('بيانات السجل غير صالحة.');
  const requestedSchoolId = String(record.schoolId || '').trim();
  if (requestedSchoolId && requestedSchoolId !== String(user.schoolId)) {
    throw new Error('لا يمكنك حفظ سجل تابع لمدرسة أخرى.');
  }
  // The authenticated account, never the browser payload, determines the school scope.
  record = Object.assign({}, record, {schoolId:String(user.schoolId)});
  if (user.role==='teacher' && entity!=='plans') throw new Error('المعلم لا يملك صلاحية تعديل هذا النوع من السجلات.');
  if (user.role==='teacher' && entity==='plans') throw new Error('تحديث خطط المعلم يتم عبر إجراءات المتابعة المعتمدة فقط.');
  const id=String(record.id||record.recordId||'');
  if (!id) throw new Error('معرّف السجل مطلوب.');
  if (entity==='visits' || entity==='plans') {
    const teacherJobNumber=String(record.teacherJobNumber||'').trim();
    if (!teacherJobNumber || !atharTeacherRegistryHasJobNumber_(teacherJobNumber,user.schoolId)) {
      throw new Error('يجب ربط الزيارة أو خطة التطوير بمعلم مسجل في سجل المدرسة ورقمه الوظيفي الصحيح.');
    }
  }
  if (entity==='teachers') {
    const jobNumber=String(record.jobNumber||'').trim();
    if (!jobNumber) throw new Error('الرقم الوظيفي للمعلم مطلوب.');
    const duplicateTeacher=atharRows_('teachers',user.schoolId,true).some(x =>
      x.recordId!==id && String(x.payload.jobNumber||'').trim()===jobNumber
    );
    if (duplicateTeacher) throw new Error('الرقم الوظيفي مسجل مسبقاً لمعلم آخر في المدرسة.');
  }
  if (entity==='visits' && !['platform_admin','school_admin','vice_principal','evaluator'].includes(user.role)) throw new Error('غير مصرح بحفظ الزيارات.');
  if (['teachers','settings','visitors'].includes(entity) && !['platform_admin','school_admin'].includes(user.role)) throw new Error('هذه العملية مقتصرة على إدارة المنصة والمدرسة.');
  const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.records);
  const rows=sh.getDataRange().getValues(), h=rows[0], ix=Object.fromEntries(h.map((x,i)=>[String(x),i]));
  let row=-1;
  for(let i=1;i<rows.length;i++) if(String(rows[i][ix.recordId])===id && String(rows[i][ix.entity])===entity && String(rows[i][ix.schoolId])===user.schoolId){row=i+1;break;}
  // المقيم لا ينشئ ولا يعدّل إلا الزيارات المنسوبة إلى حسابه؛ لا نعتمد على بيانات الواجهة وحدها.
  if (user.role==='evaluator' && entity==='visits') {
    if (String(record.evaluatorId||'') !== String(user.userId)) throw new Error('لا يمكنك حفظ زيارة باسم مقيم آخر.');
    if (row>0) {
      const existing=JSON.parse(String(rows[row-1][ix.payload]||'{}'));
      if (String(existing.evaluatorId||'') !== String(user.userId)) throw new Error('لا يمكنك تعديل زيارة لا تخص حسابك.');
    }
  }
  const now=new Date().toISOString();
  const oldCreated=row>0?rows[row-1][ix.createdAt]:now;
  const data=[id,entity,user.schoolId,JSON.stringify(record),oldCreated,now,user.userId,''];
  if(row>0) sh.getRange(row,1,1,data.length).setValues([data]); else sh.appendRow(data);
  atharAudit_(user,'حفظ/تحديث سجل',entity,id,'تم حفظ سجل مركزي.',clientId);
  return {id,updatedAt:now};
}
function atharDelete_(user, entity, id, clientId) {
  if (!['platform_admin','school_admin'].includes(user.role)) throw new Error('الحذف مقتصر على الإدارة المخولة.');
  if (!['teachers','settings','visitors'].includes(entity)) throw new Error('لا يُسمح بالحذف المباشر للزيارات أو الخطط أو السجلات التقييمية؛ استخدم إجراءات الأرشفة المعتمدة.');
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
  // Escape every value embedded in the HTML script context. In particular,
  // never interpolate an arbitrary requestId containing a literal </script>.
  const safe=JSON.stringify(result)
    .replace(/</g,'\\u003c')
    .replace(/>/g,'\\u003e')
    .replace(/&/g,'\\u0026')
    .replace(/\u2028/g,'\\u2028')
    .replace(/\u2029/g,'\\u2029');
  const rawRequestId=String((e && e.parameter && e.parameter.requestId)||'');
  const requestIdValue=/^[A-Za-z0-9-]{1,80}$/.test(rawRequestId) ? rawRequestId : '';
  const requestId=JSON.stringify(requestIdValue);
  // The client communicates through a hidden cross-origin iframe. The response
  // contains no UI or secrets and posts only to the fixed trusted Pages origin.
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><script>parent.postMessage({type:"ATHAR_DB_RESULT",requestId:'+requestId+',payload:'+safe+'},"https://aboasmaa2273-code.github.io");</script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function atharApiWrite_(b) {
  if(b.action==='ping') return {success:true,service:'ATHAR_CENTRAL_DB',version:1,serverTime:new Date().toISOString()};
  if(b.action==='login') {
    const username=String(b.username||'').trim().toLowerCase();
    if (atharIsLoginBlocked_(username)) throw new Error('تعذر تسجيل الدخول مؤقتًا بسبب تكرار المحاولات. حاول بعد 15 دقيقة.');
    const u=atharFindUser_(username);
    if(!u || String(u.status)!=='active' || !atharVerifyPassword_(String(b.password||''),String(u.passwordHash),String(u.salt).replace(/^(sha256:|pbkdf2:)/,''))) {
      const failures=atharRecordFailedLogin_(username);
      if (failures>=5) throw new Error('تعذر تسجيل الدخول مؤقتًا بسبب تكرار المحاولات. حاول بعد 15 دقيقة.');
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
    if (String(u.role)==='teacher' && !atharTeacherRegistryHasJobNumber_(u.jobNumber,u.schoolId)) {
      throw new Error('حساب المعلم غير مرتبط بسجل معلم فعال وفريد؛ يرجى مراجعة إدارة المنظومة.');
    }
    // Upgrade legacy SHA-256 hashes after successful authentication.
    if (String(u.passwordHash).indexOf('pbkdf2-sha256:') !== 0) {
      const upgradedSalt = Utilities.getUuid() + Utilities.getUuid();
      const usersSheet = SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);
      const headers = usersSheet.getRange(1,1,1,usersSheet.getLastColumn()).getValues()[0];
      const headerIndex = Object.fromEntries(headers.map((h,i)=>[String(h),i+1]));
      usersSheet.getRange(u._row,headerIndex.salt).setValue(upgradedSalt);
      usersSheet.getRange(u._row,headerIndex.passwordHash).setValue(atharHash_(String(b.password||''),upgradedSalt));
    }
    atharClearLoginFailures_(username);
    const token=Utilities.getUuid()+Utilities.getUuid();
    const refreshedUser = atharFindUserById_(u.userId) || u;
    const session={userId:String(u.userId),name:String(refreshedUser.name),role:String(refreshedUser.role),schoolId:String(refreshedUser.schoolId),jobNumber:String(refreshedUser.jobNumber||''),accountUpdatedAt:String(refreshedUser.updatedAt||'')};
    CacheService.getScriptCache().put('athar_session_'+token,JSON.stringify(session),ATHAR_DB.cacheSeconds);
    atharAudit_(session,'تسجيل دخول','session',session.userId,'تسجيل دخول ناجح.',b.clientId);
    return {success:true,token,user:session,expiresIn:ATHAR_DB.cacheSeconds};
  }
  const user=atharRequire_(b.token);
  if(b.action==='list') {
    const entity=String(b.entity||'');
    if(['platform_admin','school_admin','vice_principal'].includes(user.role)===false && ['settings','visitors'].includes(entity)) throw new Error('ليست لديك صلاحية عرض هذا السجل.');
    if(user.role==='teacher' && entity==='teachers') throw new Error('دليل المعلمين متاح للإدارة والمقيمين المخولين فقط.');
    if(!['teachers','visits','plans','settings','visitors'].includes(entity)) throw new Error('نوع السجل غير مدعوم.');
    let records=atharRows_(entity,user.schoolId,false);
    if(user.role==='evaluator' && entity==='visits') records=records.filter(x=>String(x.payload.evaluatorId)===user.userId);
    if(user.role==='teacher') {
      const jobNumber = String(user.jobNumber || '').trim();
      if (!jobNumber) throw new Error('لم يُربط الرقم الوظيفي بحساب المعلم؛ راجع إدارة المنصة قبل عرض التقارير.');
      if(entity==='visits' || entity==='plans') records=records.filter(x=>String(x.payload.teacherJobNumber || '').trim()===jobNumber);
      else throw new Error('ليست لديك صلاحية عرض هذا السجل.');
    }
    return {success:true,records:records};
  }
  if(b.action==='audit') {
    if(!['platform_admin','school_admin','vice_principal'].includes(user.role)) throw new Error('سجل التدقيق متاح للإدارة المخولة فقط.');
    const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.audit), rows=sh.getDataRange().getValues();
    return {success:true,records:rows.length>1?rows.slice(1).filter(r=>String(r[1])===user.schoolId).reverse().slice(0,5000):[]};
  }
  if(b.action==='adminListUsers') {
    const admin=atharRequire_(b.token,['platform_admin','school_admin']);
    const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);
    const rows=sh.getDataRange().getValues(), headers=rows[0], ix=Object.fromEntries(headers.map((h,i)=>[String(h),i]));
    const users=rows.slice(1).filter(r=>String(r[ix.status])!=='deleted' &&
      (admin.role==='platform_admin' || String(r[ix.schoolId])===String(admin.schoolId)))
      .map(r=>({userId:String(r[ix.userId]),username:String(r[ix.username]),name:String(r[ix.name]),
        role:String(r[ix.role]),schoolId:String(r[ix.schoolId]),jobNumber:String(r[ix.jobNumber]||''),
        status:String(r[ix.status]),createdAt:r[ix.createdAt],updatedAt:r[ix.updatedAt]}));
    return {success:true,users};
  }
  if(b.action==='adminUpdateUser') {
    return atharWithScriptLock_(function() {
    const admin=atharRequire_(b.token,['platform_admin','school_admin']);
    const target=atharAdminTarget_(admin,String(b.userId||''));
    const username=String(b.username||target.username).trim().toLowerCase();
    const name=String(b.name||target.name).trim();
    const role=String(b.role||target.role);
    const jobNumber=String(b.jobNumber===undefined?target.jobNumber||'':b.jobNumber).trim();
    const allowedRoles=admin.role==='platform_admin'?ATHAR_DB.roles:['vice_principal','evaluator','teacher'];
    if(username.length<4 || !name || allowedRoles.indexOf(role)<0) throw new Error('تحقق من الاسم واسم المستخدم والصلاحية.');
    if (role==='teacher' && !jobNumber) throw new Error('يجب ربط حساب المعلم برقمه الوظيفي.');
    if (role==='teacher' && !atharTeacherRegistryHasJobNumber_(jobNumber,target.schoolId)) throw new Error('الرقم الوظيفي غير موجود في سجل المعلمين بالمدرسة؛ أضف المعلم أو استورد بياناته أولاً.');
    if (role==='teacher' && atharTeacherJobNumberInUse_(jobNumber,target.schoolId,target.userId)) throw new Error('الرقم الوظيفي مرتبط بحساب معلم آخر في المدرسة.');
    const duplicate=atharFindUser_(username);
    if(duplicate && String(duplicate.userId)!==String(target.userId)) throw new Error('اسم المستخدم مستخدم بالفعل.');
    if(String(target.userId)===String(admin.userId) && role!==String(target.role)) throw new Error('لا يمكنك تغيير صلاحية حسابك النشط بنفسك.');
    const password=String(b.password||'');
    if(password && password.length<12) throw new Error('كلمة المرور الجديدة يجب ألا تقل عن 12 حرفاً.');
    const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);
    const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
    const ix=Object.fromEntries(headers.map((h,i)=>[String(h),i+1]));
    sh.getRange(target._row,ix.username).setValue(username);
    sh.getRange(target._row,ix.name).setValue(name);
    sh.getRange(target._row,ix.role).setValue(role);
    sh.getRange(target._row,ix.jobNumber).setValue(jobNumber);
    if(password) {
      const salt=Utilities.getUuid()+Utilities.getUuid();
      sh.getRange(target._row,ix.salt).setValue('pbkdf2:'+salt);
      sh.getRange(target._row,ix.passwordHash).setValue(atharHash_(password,salt));
    }
    sh.getRange(target._row,ix.updatedAt).setValue(new Date().toISOString());
    atharAudit_(admin,'تعديل حساب مستخدم','user',target.userId,'تحديث بيانات الحساب والصلاحيات.',b.clientId);
    return {success:true};
    });
  }
  if(b.action==='adminSetUserStatus') {
    return atharWithScriptLock_(function() {
    const admin=atharRequire_(b.token,['platform_admin','school_admin']);
    const target=atharAdminTarget_(admin,String(b.userId||''));
    const status=String(b.status||'');
    if(!['active','disabled','deleted'].includes(status)) throw new Error('حالة الحساب غير معتمدة.');
    if(String(target.userId)===String(admin.userId) && status!=='active') throw new Error('لا يمكنك إيقاف حسابك النشط.');
    const sh=SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users);
    const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
    const ix=Object.fromEntries(headers.map((h,i)=>[String(h),i+1]));
    sh.getRange(target._row,ix.status).setValue(status);
    sh.getRange(target._row,ix.updatedAt).setValue(new Date().toISOString());
    atharAudit_(admin,status==='deleted'?'حذف منطقي لحساب':'تغيير حالة حساب','user',target.userId,'الحالة الجديدة: '+status,b.clientId);
    return {success:true};
    });
  }
  if(b.action==='adminCreateUser') {
    return atharWithScriptLock_(function() {
    const admin=atharRequire_(b.token,['platform_admin','school_admin']);
    const username=String(b.username||'').trim().toLowerCase();
    const password=String(b.password||'');
    const name=String(b.name||'').trim();
    const role=String(b.role||'evaluator');
    const jobNumber=String(b.jobNumber||'').trim();
    const allowedRoles = admin.role==='platform_admin' ? ATHAR_DB.roles : ['vice_principal','evaluator','teacher'];
    if(username.length<4 || password.length<12 || !name || allowedRoles.indexOf(role)<0) throw new Error('تحقق من الاسم واسم المستخدم وكلمة المرور والصلاحية. لا يحق لمسؤول المدرسة إنشاء حساب مسؤول منصة أو مسؤول مدرسة.');
    if (role==='teacher' && !jobNumber) throw new Error('يجب ربط حساب المعلم برقمه الوظيفي.');
    if (role==='teacher' && !atharTeacherRegistryHasJobNumber_(jobNumber,admin.schoolId)) throw new Error('الرقم الوظيفي غير موجود في سجل المعلمين بالمدرسة؛ أضف المعلم أو استورد بياناته أولاً.');
    if (role==='teacher' && atharTeacherJobNumberInUse_(jobNumber,admin.schoolId,'')) throw new Error('الرقم الوظيفي مرتبط بحساب معلم آخر في المدرسة.');
    if(atharFindUser_(username)) throw new Error('اسم المستخدم مستخدم بالفعل.');
    const salt=Utilities.getUuid()+Utilities.getUuid();
    SpreadsheetApp.getActive().getSheetByName(ATHAR_DB.users).appendRow([Utilities.getUuid(),username,atharHash_(password,salt),'pbkdf2:'+salt,name,role,admin.schoolId,jobNumber,'active',new Date().toISOString(),new Date().toISOString()]);
    atharAudit_(admin,'إنشاء حساب', 'user',username,'إنشاء حساب جديد بصلاحية '+role,b.clientId);
    return {success:true};
    });
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
  if(b.action==='delete') return atharWithScriptLock_(function() { return atharDelete_(user,String(b.entity),String(b.id),b.clientId); });
  if(b.action==='logout') { CacheService.getScriptCache().remove('athar_session_'+b.token); atharAudit_(user,'تسجيل خروج','session',user.userId,'تسجيل خروج.',b.clientId); return {success:true}; }
  throw new Error('طلب كتابة غير معروف.');
}
