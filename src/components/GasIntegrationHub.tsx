import React, { useState } from 'react';
import { CentralDatabaseClient } from '../services/centralDatabaseClient';
import { AtharStorageService } from '../services/storageService';
import { GAS_FILES, GasFile } from '../services/gasCodeGenerator';
import { 
  Database, 
  Copy, 
  Download, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  BookOpen,
  Terminal,
  HelpCircle,
  Check
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface GasIntegrationHubProps {
  language?: Language;
}

export const GasIntegrationHub: React.FC<GasIntegrationHubProps> = ({ language = 'ar' }) => {
  const [selectedFile, setSelectedFile] = useState<GasFile>(GAS_FILES[0]);
  const [copiedFileName, setCopiedFileName] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string>(() => CentralDatabaseClient.getEndpoint());
  const [connectionMessage, setConnectionMessage] = useState<string>('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [centralUsername, setCentralUsername] = useState('');
  const [centralPassword, setCentralPassword] = useState('');
  const [centralUserName, setCentralUserName] = useState(() => CentralDatabaseClient.getSession()?.user.name || '');
  const [centralBusy, setCentralBusy] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState('');
  const [migrationProgress, setMigrationProgress] = useState(0);
  

  const localMigrationRecords = () => ([
    ...AtharStorageService.getTeachers().map(record => ({ entity: 'teachers' as const, record: record as unknown as Record<string, unknown> })),
    ...AtharStorageService.getVisits().map(record => ({ entity: 'visits' as const, record: record as unknown as Record<string, unknown> })),
    ...AtharStorageService.getPlans().map(record => ({ entity: 'plans' as const, record: record as unknown as Record<string, unknown> }))
  ]);

  const handleCentralLogin = async () => {
    setCentralBusy(true);
    setMigrationMessage('');
    const result = await CentralDatabaseClient.login(centralUsername, centralPassword);
    setCentralPassword('');
    setCentralBusy(false);
    if (!result.success) {
      setMigrationMessage(result.error || (isAr ? 'تعذر تسجيل الدخول المركزي.' : 'Central sign-in failed.'));
      return;
    }
    const session = CentralDatabaseClient.getSession();
    if (!session || !['platform_admin', 'school_admin'].includes(session.user.role)) {
      await CentralDatabaseClient.logout();
      setCentralUserName('');
      setMigrationMessage(isAr ? 'الاستيراد متاح لمسؤول المنصة أو مسؤول المدرسة فقط.' : 'Migration requires a platform or school administrator.');
      return;
    }
    setCentralUserName(session.user.name);
    setMigrationMessage(isAr ? 'تم التحقق من حساب المسؤول المركزي. يمكنك الآن مراجعة عدد السجلات قبل الاستيراد.' : 'Central administrator verified. Review the record count before migration.');
  };

  const handleCentralLogout = async () => {
    setCentralBusy(true);
    await CentralDatabaseClient.logout();
    setCentralUserName('');
    setCentralBusy(false);
    setMigrationMessage(isAr ? 'تم إنهاء الجلسة المركزية.' : 'Central session ended.');
  };

  const handleMigrateLocalData = async () => {
    const session = CentralDatabaseClient.getSession();
    if (!session || !['platform_admin', 'school_admin'].includes(session.user.role)) {
      setMigrationMessage(isAr ? 'سجّل الدخول بحساب مسؤول مركزي أولاً.' : 'Sign in as a central administrator first.');
      return;
    }
    const records = localMigrationRecords();
    if (!records.length) {
      setMigrationMessage(isAr ? 'لا توجد سجلات محلية لاستيرادها.' : 'No local records to migrate.');
      return;
    }
    const confirmed = window.confirm(isAr
      ? `سيتم إرسال ${records.length} سجلًا محليًا (معلمون وزيارات وخطط) إلى قاعدة البيانات المركزية. لن تُحذف البيانات المحلية. قد يؤدي تكرار الاستيراد إلى تحديث السجلات ذات المعرّفات نفسها. هل تريد المتابعة؟`
      : `This will copy ${records.length} local teacher, visit, and plan records to the central database. Local data will not be deleted. Repeating migration updates records with matching IDs. Continue?`);
    if (!confirmed) return;
    setCentralBusy(true);
    setMigrationProgress(0);
    setMigrationMessage('');
    let imported = 0;
    for (let i = 0; i < records.length; i += 100) {
      const result = await CentralDatabaseClient.bulkImport(records.slice(i, i + 100));
      if (!result.success) {
        setMigrationMessage((isAr ? 'توقف الاستيراد بعد ' : 'Migration stopped after ') + imported + (isAr ? ' سجلًا. السبب: ' : ' records. Reason: ') + (result.error || 'Unknown error'));
        setCentralBusy(false);
        setMigrationProgress(imported);
        return;
      }
      imported += Number(result.imported || 0);
      setMigrationProgress(imported);
    }
    setMigrationMessage((isAr ? 'اكتمل نسخ ' : 'Copied ') + imported + (isAr ? ' سجلًا إلى القاعدة المركزية. بقيت النسخة المحلية دون تغيير.' : ' records to the central database. Local copies remain unchanged.'));
    setCentralBusy(false);
  };

  const isAr = language === 'ar';

  // Sheets Schema (all 18 sheets) with bilingual descriptions
  const sheetsList = [
    { name: 'Users', columns: 'id, schoolId, name, email, role, jobNumber, specialization, status, createdAt', desc: isAr ? 'المستخدمون والصلاحيات' : 'Users & Access Control' },
    { name: 'Schools', columns: 'id, name, code, stage, welcomeMessage, primaryColor, secondaryColor, contactEmail, contactPhone', desc: isAr ? 'المدارس وعزل البيانات' : 'Schools & Multi-tenant Scoping' },
    { name: 'Teachers', columns: 'id, schoolId, fullName, jobNumber, specialization, status, email, phone, dateAdded', desc: isAr ? 'سجل المعلمين وأرقامهم الوظيفية' : 'Teachers Registry & Job IDs' },
    { name: 'Visits', columns: 'id, schoolId, academicYear, term, visitType, teacherId, teacherName, grade, section, subject, evaluatorName, totalStudents, attendedStudents, absentStudents, studentGender, visitors...', desc: isAr ? 'سجل الزيارات الصفية والطلبة والزائرين' : 'Classroom Observations & Observers' },
    { name: 'VisitIndicators', columns: 'id, visitId, indicatorId, indicatorText, group, rating, notes, timestamp', desc: isAr ? 'رصد تفاصيل المؤشرات لكل زيارة' : 'Scored Performance Indicators' },
    { name: 'VisitDomains', columns: 'id, visitId, domainId, domainName, rating', desc: isAr ? 'تقييم مجالات الأداء العام العشرة' : '10 Evaluation Domains Assessment' },
    { name: 'IndicatorLibrary', columns: 'id, code, group, text, description, isActive', desc: isAr ? 'بنك المؤشرات الـ 22 المعتمدة' : 'Official 22 Indicators Bank' },
    { name: 'EvaluationDomains', columns: 'id, code, name, description', desc: isAr ? 'مصفوفة مجالات التقييم' : 'Domain Evaluation Framework' },
    { name: 'Subjects', columns: 'id, schoolId, name, isActive', desc: isAr ? 'المواد الدراسية' : 'Curriculum Subjects' },
    { name: 'Grades', columns: 'id, schoolId, name, isActive', desc: isAr ? 'الصفوف الدراسية' : 'Academic Grades' },
    { name: 'Sections', columns: 'id, schoolId, name, isActive', desc: isAr ? 'الشعب المدرسية' : 'Class Sections' },
    { name: 'AcademicYears', columns: 'id, schoolId, yearLabel, isCurrent', desc: isAr ? 'الأعوام الأكاديمية' : 'Academic Years' },
    { name: 'Terms', columns: 'id, schoolId, termName, isCurrent', desc: isAr ? 'الفصول الدراسية' : 'School Terms' },
    { name: 'ImprovementPlans', columns: 'id, schoolId, teacherId, teacherName, improvementArea, relatedIndicator, goal, procedure, responsible, duration, followUpDate, status...', desc: isAr ? 'خطط التطوير المهني' : 'Professional Improvement Plans' },
    { name: 'PlanFollowUps', columns: 'id, planId, followUpDate, evaluatorName, result, notes, newStatus, recordedAt', desc: isAr ? 'متابعة أثر خطط التطوير' : 'Plan Impact Follow-ups' },
    { name: 'Settings', columns: 'key, value, updatedAt, updatedBy', desc: isAr ? 'إعدادات المنظومة وهوية المدرسة' : 'Platform & School Settings' },
    { name: 'AuditLog', columns: 'id, schoolId, timestamp, userName, userRole, action, details', desc: isAr ? 'سجل تدقيق العمليات والأمان' : 'Security & Audit Logs' },
    { name: 'ReportTemplates', columns: 'id, templateName, layoutJson, isDefault', desc: isAr ? 'قوالب التقارير المعتمدة' : 'Official Report Templates' }
  ];

  const handleCopyCode = (file: GasFile) => {
    navigator.clipboard.writeText(file.content);
    setCopiedFileName(file.name);
    setTimeout(() => setCopiedFileName(null), 2500);
  };

  const handleDownloadFile = (file: GasFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-8 text-xs text-[#172C40]">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#668575] font-bold mb-1">
            <Database className="w-4 h-4" />
            <span>{isAr ? 'البنية التقنية الرسمية المطلوبة للمنظومة' : 'Official Architecture: Google Apps Script Backend'}</span>
          </div>
          <h2 className="text-xl font-black text-[#172C40] font-['Tajawal']">
            {isAr ? 'مركز ملفات Google Apps Script وقاعدة بيانات Google Sheets' : 'Google Apps Script Code Center & Google Sheets Database'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isAr ? (
              <>ملف الخادم المركزي الفعلي <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">SharedDatabase.gs</code> وملف إعدادات النشر. انسخ الملفين إلى مشروع Apps Script المرتبط بجدول بيانات أَثَر.</>
            ) : (
              <>The actual central backend file <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">SharedDatabase.gs</code> and deployment manifest. Copy both files into an Apps Script project bound to the Athar spreadsheet.</>
            )}
          </p>
        </div>

        <div className="max-w-xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-xs leading-6">
          {isAr
            ? 'تنبيه: ملفات قاعدة البيانات المركزية جاهزة ضمن المشروع، لكن الاتصال الفعلي لا يعمل بعد. لن نعرض نتيجة نجاح وهمية؛ يلزم نشر خادم Apps Script وربط عنوانه واختبار الاتصال قبل اعتماد المزامنة.'
            : 'Notice: the central database source is prepared, but the live connection is not active yet. No simulated success is shown; deploy the Apps Script backend, configure its URL, and verify connectivity before relying on synchronization.'}
        </div>
      </div>

      {/* Central database connection configuration */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-3" dir={isAr ? 'rtl' : 'ltr'}>
        <div>
          <h3 className="text-base font-black text-[#172C40]">{isAr ? 'إعداد اتصال قاعدة البيانات المركزية' : 'Central Database Connection'}</h3>
          <p className="text-xs text-slate-500 mt-1">{isAr ? 'بعد نشر SharedDatabase.gs كتطبيق ويب، ألصق رابط /exec هنا ثم اختبر الاتصال. لا تضع أي كلمة مرور في هذا الحقل.' : 'After deploying SharedDatabase.gs as a Web App, paste its /exec URL here and test the connection. Never enter a password here.'}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <input value={endpoint} onChange={e => setEndpoint(e.target.value)} dir="ltr" placeholder="https://script.google.com/macros/s/.../exec" className="flex-1 min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C6A66A]" />
          <button type="button" onClick={() => { const r=CentralDatabaseClient.setEndpoint(endpoint); setConnectionMessage(r.success ? (isAr ? 'حُفظ رابط الخادم في هذا المتصفح. اختبر الاتصال للتحقق من عمله.' : 'Endpoint saved in this browser. Test the connection to verify it.') : (r.error || 'Invalid URL')); }} className="rounded-lg bg-[#172C40] text-white px-4 py-2 text-xs font-bold">{isAr ? 'حفظ الرابط' : 'Save URL'}</button>
          <button type="button" disabled={testingConnection || !CentralDatabaseClient.getEndpoint()} onClick={async () => { setTestingConnection(true); setConnectionMessage(''); const r=await CentralDatabaseClient.testConnection(); setTestingConnection(false); setConnectionMessage(r.success ? (isAr ? 'نجح الاتصال بالخادم المركزي. لم تُنقل أو تُعدّل أي بيانات.' : 'Central server connected. No data was migrated or changed.') : (r.error || 'Connection failed')); }} className="rounded-lg border border-[#C6A66A] bg-[#F2EBDD] text-[#172C40] px-4 py-2 text-xs font-bold disabled:opacity-50">{testingConnection ? (isAr ? 'جارٍ الاختبار...' : 'Testing...') : (isAr ? 'اختبار الاتصال' : 'Test connection')}</button>
        </div>
        {connectionMessage && <p role="status" className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">{connectionMessage}</p>}
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">{isAr ? 'تنبيه: اختبار الاتصال يثبت استجابة الخادم فقط. لم يتم بعد تحويل تسجيل الدخول أو مزامنة السجلات تلقائيًا؛ ستبقى البيانات المحلية كما هي حتى إتمام ترحيل واختبار آمن.' : 'Note: the health check only confirms the server responds. Login and automatic record synchronization are not switched over yet; local data remains unchanged until safe migration and testing are completed.'}</p>
      </div>


      {/* Safe one-time local data migration */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
        <div>
          <h3 className="text-base font-black text-[#172C40]">{isAr ? 'ترحيل آمن للبيانات المحلية إلى القاعدة المركزية' : 'Safe Local-to-Central Data Migration'}</h3>
          <p className="text-xs text-slate-500 mt-1">{isAr ? 'هذه خطوة نسخ اختيارية لا تحذف البيانات من هذا الجهاز. تتطلب حساب مسؤول مركزي أُنشئ في Google Apps Script.' : 'This optional copy operation never deletes local data. It requires a central administrator account created in Apps Script.'}</p>
        </div>
        {centralUserName ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <span className="font-bold text-emerald-800">{isAr ? 'مسؤول مركزي متصل: ' : 'Central admin signed in: '}{centralUserName}</span>
            <button type="button" disabled={centralBusy} onClick={handleCentralLogout} className="rounded-lg border border-slate-300 px-3 py-2 font-bold">{isAr ? 'تسجيل الخروج المركزي' : 'Central sign out'}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={centralUsername} onChange={e => setCentralUsername(e.target.value)} dir="ltr" autoComplete="username" placeholder={isAr ? 'اسم مستخدم المسؤول' : 'Administrator username'} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" />
            <input value={centralPassword} onChange={e => setCentralPassword(e.target.value)} dir="ltr" type="password" autoComplete="current-password" placeholder={isAr ? 'كلمة مرور المسؤول' : 'Administrator password'} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" />
            <button type="button" disabled={centralBusy || !centralUsername.trim() || !centralPassword} onClick={handleCentralLogin} className="rounded-lg bg-[#172C40] text-white px-4 py-2 font-bold disabled:opacity-50">{centralBusy ? (isAr ? 'جارٍ التحقق...' : 'Verifying...') : (isAr ? 'دخول المسؤول المركزي' : 'Central admin sign in')}</button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3"><div className="text-slate-500">{isAr ? 'المعلمون' : 'Teachers'}</div><div className="text-lg font-black">{AtharStorageService.getTeachers().length}</div></div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3"><div className="text-slate-500">{isAr ? 'الزيارات' : 'Visits'}</div><div className="text-lg font-black">{AtharStorageService.getVisits().length}</div></div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3"><div className="text-slate-500">{isAr ? 'خطط التطوير' : 'Improvement plans'}</div><div className="text-lg font-black">{AtharStorageService.getPlans().length}</div></div>
        </div>
        <button type="button" disabled={centralBusy || !centralUserName} onClick={handleMigrateLocalData} className="w-full rounded-lg bg-[#C6A66A] text-[#172C40] px-4 py-3 font-black disabled:opacity-40">{centralBusy ? (isAr ? 'جارٍ نسخ البيانات...' : 'Copying records...') : (isAr ? 'نسخ السجلات المحلية إلى القاعدة المركزية' : 'Copy local records to central database')}</button>
        {centralBusy && migrationProgress > 0 && <p className="text-xs text-slate-600">{isAr ? 'تم إرسال ' : 'Sent '}{migrationProgress} {isAr ? 'سجلًا حتى الآن' : 'records so far'}</p>}
        {migrationMessage && <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-700">{migrationMessage}</p>}
        <p className="text-[11px] leading-5 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">{isAr ? 'مهم: هذه العملية تنسخ المعلمين والزيارات والخطط فقط، ولا تنقل حسابات المستخدمين أو كلمات المرور أو إعدادات المنصة. راجع الأعداد وتأكد من اتصال الخادم قبل البدء. لا تعتمد النسخة المركزية نهائيًا قبل اختبار الاسترجاع من جهاز آخر.' : 'Important: this copies teachers, visits, and plans only. It does not migrate user accounts, passwords, or platform settings. Verify the counts and connection first; do not rely on the central copy until retrieval is tested from another device.'}</p>
      </div>

      {/* Code Inspector & Copy Center */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left List of Files (4 cols) */}
        <div className="lg:col-span-4 border-l border-slate-200 p-4 bg-slate-50/50 space-y-2">
          <span className="font-bold text-[#172C40] block mb-2 font-['Tajawal']">
            {isAr ? 'ملفات مشروع Google Apps Script:' : 'Google Apps Script Project Files:'}
          </span>
          {GAS_FILES.map((file) => (
            <div
              key={file.name}
              onClick={() => setSelectedFile(file)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedFile.name === file.name
                  ? 'bg-white border-[#172C40] shadow-xs'
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#172C40]">{file.name}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {file.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                {file.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right Code Display (8 cols) */}
        <div className="lg:col-span-8 p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="font-mono font-bold text-sm text-[#172C40]">{selectedFile.name}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(selectedFile)}
                className="px-3 py-1.5 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedFileName === selectedFile.name ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'تم النسخ بنجاح!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#C6A66A]" />
                    <span>{isAr ? 'نسخ الكود بالكامل' : 'Copy Full Code'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownloadFile(selectedFile)}
                title={isAr ? "تنزيل الملف" : "Download File"}
                className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Syntax box */}
          <div className="bg-[#101F2D] text-emerald-400 font-mono text-[11px] p-4 rounded-xl overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
            <pre><code>{selectedFile.content}</code></pre>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>{isAr ? 'جاهز للصق المباشر في محرّر Google Apps Script (Ctrl+V)' : 'Ready for direct paste into Google Apps Script editor (Ctrl+V)'}</span>
            <span>{isAr ? `عدد الأسطر: ${selectedFile.content.split('\n').length} سطر` : `Lines: ${selectedFile.content.split('\n').length}`}</span>
          </div>
        </div>

      </div>

      {/* Complete 18-Sheets Database Schema */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#172C40] font-['Tajawal']">
              {isAr ? 'هيكل قاعدة بيانات Google Sheets (18 ورقة عمل معتمدة)' : 'Google Sheets Database Schema (18 Standard Sheets)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? (
                <>تُنشئها دالة <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#172C40]">initializeDatabase()</code> تلقائياً وتمنع تضارب العمليات المتزامنة بواسطة <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#172C40]">LockService</code>.</>
              ) : (
                <>Automated by <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#172C40]">initializeDatabase()</code> with concurrent write-safety managed by <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#172C40]">LockService</code>.</>
              )}
            </p>
          </div>
          <span className="text-xs font-bold text-[#172C40] bg-[#F2EBDD] px-2.5 py-1 rounded">
            {isAr ? '18 ورقة معرّفة' : '18 Defined Sheets'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sheetsList.map((s, idx) => (
            <div key={s.name} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#172C40]">{idx + 1}. {s.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">{s.desc}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate" title={s.columns}>
                {s.columns}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment Guide Steps */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#172C40] font-['Tajawal'] pb-2 border-b border-slate-100">
          {isAr ? 'دليل نشر المنظومة في نطاق مدرسة الصدارة بنين (خطوة بخطوة)' : 'Step-by-Step Google Apps Script Web App Deployment Guide'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#172C40] text-white flex items-center justify-center font-bold text-xs">1</span>
            <strong className="block text-[#172C40]">{isAr ? 'إنشاء Google Sheet' : 'Create Google Sheet'}</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isAr ? 'افتح Google Sheets وأنشئ جدولاً جديداً باسم «أَثَر - قاعدة بيانات منظومة التميز والتطوير التعليمي».' : 'Open Google Sheets and create a new sheet named "ATHAR - Educational Observation Database".'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#172C40] text-white flex items-center justify-center font-bold text-xs">2</span>
            <strong className="block text-[#172C40]">{isAr ? 'فتح Apps Script' : 'Open Apps Script'}</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isAr ? (
                <>من قائمة «ملحقات (Extensions)»، اضغط على «Apps Script». احتفظ بملف <code className="font-mono">Code.gs</code> وملفات الواجهة <code className="font-mono">Index</code> و<code className="font-mono">Styles</code> و<code className="font-mono">Client</code>. ثم أضف ملف Script جديدًا باسم <code className="font-mono">SharedDatabase.gs</code> والصق كوده منفصلًا؛ لا تستبدل به ملف <code className="font-mono">Code.gs</code>.</>
              ) : (
                <>Keep the existing <code className="font-mono">Code.gs</code> and the <code className="font-mono">Index</code>, <code className="font-mono">Styles</code>, and <code className="font-mono">Client</code> HTML files. Add <code className="font-mono">SharedDatabase.gs</code> as a separate Script file; do not replace <code className="font-mono">Code.gs</code>.</>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#172C40] text-white flex items-center justify-center font-bold text-xs">3</span>
            <strong className="block text-[#172C40]">{isAr ? 'تشغيل التهيئة' : 'Run Initialization'}</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isAr ? (
                <>شغّل <code className="font-mono">initializeDatabase</code> لتهيئة أوراق المنصة القديمة، ثم أضف في «إعدادات المشروع ← خصائص النص البرمجي» الخاصيتين <code className="font-mono">ATHAR_BOOTSTRAP_USER</code> و<code className="font-mono">ATHAR_BOOTSTRAP_PASSWORD</code>. بعد ذلك شغّل <code className="font-mono">setupCentralDatabase</code> ثم <code className="font-mono">createInitialCentralAdmin</code> لإنشاء قاعدة البيانات المركزية وحساب المسؤول الأول.</>
              ) : (
                <>Run <code className="font-mono">initializeDatabase</code> for the existing platform sheets. Then add <code className="font-mono">ATHAR_BOOTSTRAP_USER</code> and <code className="font-mono">ATHAR_BOOTSTRAP_PASSWORD</code> in Project Settings &gt; Script Properties. Run <code className="font-mono">setupCentralDatabase</code>, then <code className="font-mono">createInitialCentralAdmin</code> to create the central database and first administrator.</>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F2EBDD]/60 border border-[#C6A66A]/40 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#C6A66A] text-[#172C40] flex items-center justify-center font-bold text-xs">4</span>
            <strong className="block text-[#172C40]">{isAr ? 'النشر كتطبيق ويب' : 'Deploy as Web App'}</strong>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              {isAr ? 'اضغط على «نشر (Deploy)» ← «تطبيق ويب (Web app)»، واختر صلاحية الوصول المناسبة لمدرستك واحصل على الرابط المباشر.' : 'Click Deploy &gt; New deployment &gt; Web app. Choose access level and get your live production URL.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
