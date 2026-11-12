import React, { useState, useEffect } from 'react';
import { PlatformSettings, User, AuditLogEntry, RegisteredVisitor, VisitorRole } from '../types';
import { AtharStorageService } from '../services/storageService';
import { 
  Sliders, 
  Check, 
  RotateCcw, 
  Eye, 
  ShieldAlert, 
  FileText, 
  History,
  Building,
  Image as ImageIcon,
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Database,
  AlertTriangle,
  X,
  Sparkles,
  Phone,
  Mail,
  BadgeCheck,
  KeyRound,
  Lock,
  Shield,
  ArrowUpDown,
  Filter,
  Search
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { UserProfileModal } from './UserProfileModal';

interface PlatformSettingsViewProps {
  settings: PlatformSettings;
  currentUser: User;
  auditLogs: AuditLogEntry[];
  onRefreshSettings: () => void;
  language?: Language;
}

export const PlatformSettingsView: React.FC<PlatformSettingsViewProps> = ({
  settings,
  currentUser,
  auditLogs,
  onRefreshSettings,
  language = 'ar'
}) => {
  const t = translations[language];
  const isEn = language === 'en';
  const canEdit = AtharStorageService.canEditSettings(currentUser) || currentUser?.role !== 'teacher';

  // Active Settings Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'platform' | 'visitors' | 'users' | 'data' | 'audit'>('platform');
  const [allUsersList, setAllUsersList] = useState<User[]>(() => AtharStorageService.getAllUsers());
  const [selectedUserForCredentials, setSelectedUserForCredentials] = useState<User | null>(null);

  // Platform Identity State
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [platformTitle, setPlatformTitle] = useState(settings.platformTitle);
  const [slogan, setSlogan] = useState(settings.slogan);
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [schoolStage, setSchoolStage] = useState(settings.schoolStage);
  const [principalName, setPrincipalName] = useState(settings.principalName || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [homeImageUrl, setHomeImageUrl] = useState(settings.homeImageUrl || '');
  const [welcomeMessage, setWelcomeMessage] = useState(settings.welcomeMessage);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);

  const [showLivePreview, setShowLivePreview] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Registered Visitors Directory State
  const [visitorsList, setVisitorsList] = useState<RegisteredVisitor[]>(() => AtharStorageService.getRegisteredVisitors());
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<RegisteredVisitor | null>(null);
  const [visitorFormName, setVisitorFormName] = useState('');
  const [visitorFormRole, setVisitorFormRole] = useState<VisitorRole>('evaluator');
  const [visitorFormTitle, setVisitorFormTitle] = useState('');
  const [visitorFormDept, setVisitorFormDept] = useState('');
  const [visitorFormJobNumber, setVisitorFormJobNumber] = useState('');
  const [visitorFormEmail, setVisitorFormEmail] = useState('');
  const [visitorFormPhone, setVisitorFormPhone] = useState('');
  const [visitorFormUsername, setVisitorFormUsername] = useState('');
  const [visitorFormPassword, setVisitorFormPassword] = useState('123');

  // Demo Data Management & Cleanup State
  const [purgeTarget, setPurgeTarget] = useState<'visits' | 'plans' | 'teachers' | 'all' | null>(null);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  // Audit Log Filtering & Sorting State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditUserFilter, setAuditUserFilter] = useState('ALL');
  const [auditSortAsc, setAuditSortAsc] = useState(false);
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLogEntry[]>(auditLogs);

  useEffect(() => {
    setLocalAuditLogs(auditLogs);
  }, [auditLogs]);

  // Feedback display helper
  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Upload optimized-size image assets into the platform's saved settings.
  const handleImageUpload = (file: File | undefined, target: 'logo' | 'home') => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showFeedback('error', isEn ? 'Please choose an image file.' : 'يرجى اختيار ملف صورة صالح.');
      return;
    }
    if (file.size > 1200 * 1024) {
      showFeedback('error', isEn ? 'Image must be 1.2 MB or smaller.' : 'يجب ألا يتجاوز حجم الصورة 1.2 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || '');
      if (target === 'logo') setLogoUrl(value);
      else setHomeImageUrl(value);
      showFeedback('success', isEn ? 'Image selected. Save platform settings to apply it.' : 'تم اختيار الصورة. احفظ إعدادات المنصة لتطبيقها.');
    };
    reader.onerror = () => showFeedback('error', isEn ? 'Could not read the image.' : 'تعذرت قراءة الصورة.');
    reader.readAsDataURL(file);
  };

  // Delete Evaluator Account
  const handleDeleteUser = (userId: string, userName: string) => {
    if (!confirm(isEn ? `Are you sure you want to delete evaluator "${userName}"?` : `هل أنت متأكد من رغبتك في حذف حساب المقيم "${userName}" نهائياً من المنظومة؟`)) {
      return;
    }
    const res = AtharStorageService.deleteUser(userId);
    if (res.success) {
      setAllUsersList(AtharStorageService.getAllUsers());
      setVisitorsList(AtharStorageService.getRegisteredVisitors());
      showFeedback('success', isEn ? `Evaluator ${userName} deleted successfully.` : `تم حذف حساب المقيم (${userName}) بنجاح.`);
      onRefreshSettings();
    } else {
      showFeedback('error', res.error || (isEn ? 'Failed to delete evaluator.' : 'تعذر حذف المقيم.'));
    }
  };

  // Clear Audit Log History
  const handleClearAuditLogs = () => {
    if (!confirm(isEn ? 'Are you sure you want to permanently clear the audit log history?' : 'هل أنت متأكد من رغبتك في مسح كافة سجلات العمليات والأمان نهائياً؟')) {
      return;
    }
    const res = AtharStorageService.clearAuditLogs();
    if (res.success) {
      setLocalAuditLogs([]);
      showFeedback('success', isEn ? 'Audit log cleared successfully.' : 'تم مسح كامل سجل العمليات والأمان بنجاح.');
      onRefreshSettings();
    } else {
      showFeedback('error', res.error || (isEn ? 'Failed to clear logs.' : 'تعذر مسح السجل.'));
    }
  };

  // Save Platform Identity
  const handleSavePlatform = () => {
    const updated: PlatformSettings = {
      platformName,
      platformTitle,
      slogan,
      schoolName,
      schoolStage,
      principalName,
      logoUrl,
      homeImageUrl,
      welcomeMessage,
      primaryColor,
      secondaryColor,
      contactEmail,
      contactPhone
    };

    const res = AtharStorageService.savePlatformSettings(updated);
    if (res.success) {
      showFeedback('success', isEn ? 'Platform identity and settings saved successfully.' : 'تم حفظ هوية وإعدادات المنصة بنجاح.');
      onRefreshSettings();
    } else {
      showFeedback('error', res.error || (isEn ? 'Error occurred while saving.' : 'حدث خطأ أثناء الحفظ.'));
    }
  };

  // Open Visitor Modal (New or Edit)
  const handleOpenAddVisitor = () => {
    setEditingVisitor(null);
    setVisitorFormName('');
    setVisitorFormRole('evaluator');
    setVisitorFormTitle('');
    setVisitorFormDept('');
    setVisitorFormJobNumber('');
    setVisitorFormEmail('');
    setVisitorFormPhone('');
    setVisitorFormUsername('');
    setVisitorFormPassword('123');
    setIsVisitorModalOpen(true);
  };

  const handleOpenEditVisitor = (vis: RegisteredVisitor) => {
    setEditingVisitor(vis);
    setVisitorFormName(vis.name);
    setVisitorFormRole(vis.role as VisitorRole);
    setVisitorFormTitle(vis.roleTitle || '');
    setVisitorFormDept(vis.department || '');
    setVisitorFormJobNumber(vis.jobNumber || '');
    setVisitorFormEmail(vis.email || '');
    setVisitorFormPhone(vis.phone || '');
    setVisitorFormUsername(vis.username || '');
    setVisitorFormPassword(vis.password || '123');
    setIsVisitorModalOpen(true);
  };

  const handleSaveVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorFormName.trim()) {
      showFeedback('error', isEn ? 'Visitor name is required.' : 'اسم الزائر مطلوب.');
      return;
    }

    const payload: RegisteredVisitor = {
      id: editingVisitor ? editingVisitor.id : `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: visitorFormName.trim(),
      role: visitorFormRole,
      roleTitle: visitorFormTitle.trim() || undefined,
      department: visitorFormDept.trim() || undefined,
      jobNumber: visitorFormJobNumber.trim() || undefined,
      email: visitorFormEmail.trim() || undefined,
      phone: visitorFormPhone.trim() || undefined,
      username: visitorFormUsername.trim() || undefined,
      password: visitorFormPassword.trim() || undefined
    };

    const res = AtharStorageService.saveRegisteredVisitor(payload);
    if (res.success) {
      setVisitorsList(AtharStorageService.getRegisteredVisitors());
      setAllUsersList(AtharStorageService.getAllUsers());
      setIsVisitorModalOpen(false);
      showFeedback('success', isEn ? 'Observer & credentials saved successfully.' : 'تم حفظ بيانات المقيم وبيانات الدخول (اليوزرنيم والباسوورد) بنجاح.');
      onRefreshSettings();
    } else {
      showFeedback('error', res.error || (isEn ? 'Failed to save observer.' : 'تعذر حفظ بيانات الزائر.'));
    }
  };

  const handleDeleteVisitor = (id: string) => {
    if (confirm(t.visitorsManagement.deleteConfirm)) {
      const res = AtharStorageService.deleteRegisteredVisitor(id);
      if (res.success) {
        setVisitorsList(AtharStorageService.getRegisteredVisitors());
        showFeedback('success', isEn ? 'Observer deleted successfully.' : 'تم حذف الزائر بنجاح.');
        onRefreshSettings();
      } else {
        showFeedback('error', res.error || (isEn ? 'Failed to delete.' : 'تعذر حذف الزائر.'));
      }
    }
  };

  // Demo Data Purge Execution
  const handleExecutePurge = () => {
    if (!purgeTarget) return;

    if (purgeTarget === 'visits') {
      const res = AtharStorageService.clearDemoVisits();
      showFeedback('success', isEn ? `Cleared ${res.count} visits successfully.` : `تم مسح ${res.count} زيارة صفية بنجاح.`);
    } else if (purgeTarget === 'plans') {
      const res = AtharStorageService.clearDemoPlans();
      showFeedback('success', isEn ? `Cleared ${res.count} improvement plans successfully.` : `تم مسح ${res.count} خطة تطوير مهني بنجاح.`);
    } else if (purgeTarget === 'teachers') {
      const res = AtharStorageService.clearDemoTeachers();
      showFeedback('success', isEn ? `Cleared ${res.count} teachers successfully.` : `تم مسح ${res.count} معلماً تجريبياً بنجاح.`);
    } else if (purgeTarget === 'all') {
      AtharStorageService.resetAllDataToClean();
      showFeedback('success', isEn ? 'Purged all demo records. System initialized with clean slate.' : 'تم تفريغ كامل البيانات التجريبية والبدء بسجل رسمي نظيف.');
    }

    setIsPurgeModalOpen(false);
    setPurgeTarget(null);
    onRefreshSettings();
  };

  const handleRestoreDemoData = () => {
    if (confirm(isEn ? 'Restore sample demo records for testing and training?' : 'هل تود استرجاع البيانات التجريبية النموذجية لأغراض التدريب والتجربة؟')) {
      AtharStorageService.resetToDefaults();
      setVisitorsList(AtharStorageService.getRegisteredVisitors());
      showFeedback('success', isEn ? 'Sample demo data restored successfully.' : 'تمت استعادة البيانات التجريبية النموذجية بنجاح.');
      onRefreshSettings();
    }
  };

  return (
    <div className="space-y-6 text-xs text-[#172C40]">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#172C40] font-['Tajawal']">{t.settings.title}</h2>
          <p className="text-xs text-[#64748B] mt-1">
            {t.settings.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeSubTab === 'platform' && (
            <>
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="px-3.5 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#C6A66A]" />
                <span>{showLivePreview ? (isEn ? 'Hide Preview' : 'إخفاء المعاينة') : (isEn ? 'Live Preview' : 'معاينة مباشرة')}</span>
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={handleSavePlatform}
                  className="px-5 py-2 bg-[#172C40] text-white rounded-lg text-xs font-bold hover:bg-[#101F2D] flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4 text-[#C6A66A]" />
                  <span>{isEn ? 'Save Platform Identity' : 'حفظ الهوية والإعدادات'}</span>
                </button>
              )}
            </>
          )}

          {activeSubTab === 'visitors' && canEdit && (
            <button
              type="button"
              onClick={handleOpenAddVisitor}
              className="px-4 py-2 bg-[#172C40] text-white rounded-lg text-xs font-bold hover:bg-[#101F2D] flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-[#C6A66A]" />
              <span>{t.visitorsManagement.addBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xs transition-all ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {feedbackMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-rose-600" />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Settings Sub-Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-2xs gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('platform')}
          className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'platform'
              ? 'bg-[#172C40] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#C6A66A]" />
          <span>{t.settings.tabPlatform}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('visitors')}
          className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'visitors'
              ? 'bg-[#172C40] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-[#C6A66A]" />
          <span>{t.settings.tabVisitors}</span>
          <span className="bg-white/20 text-current text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {visitorsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAllUsersList(AtharStorageService.getAllUsers());
            setActiveSubTab('users');
          }}
          className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'bg-[#172C40] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4 text-[#C6A66A]" />
          <span>{isEn ? 'Evaluators & Login Accounts' : 'حسابات المقيّمين وبيانات الدخول'}</span>
          <span className="bg-white/20 text-current text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {allUsersList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('data')}
          className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'data'
              ? 'bg-[#172C40] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4 text-[#C6A66A]" />
          <span>{t.settings.tabData}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('audit')}
          className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'audit'
              ? 'bg-[#172C40] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4 text-[#C6A66A]" />
          <span>{t.settings.tabAudit}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: Platform Identity & General Settings                */}
      {/* ============================================================== */}
      {activeSubTab === 'platform' && (
        <div className="space-y-6">
          {/* Live Preview Box */}
          {showLivePreview && (
            <div className="p-6 rounded-2xl bg-[#172C40] text-white border-2 border-[#C6A66A] shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 p-1 flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building className="w-6 h-6 text-[#C6A66A]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base font-['Tajawal']">{platformName}</h3>
                    <p className="text-xs text-[#C6A66A]">{platformTitle}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white/10 text-white font-['Tajawal']">
                  {slogan}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-white/60 block">{isEn ? 'Institution / School:' : 'المؤسسة التعليمية:'}</span>
                  <span className="font-bold text-white text-sm">{schoolName}</span>
                </div>
                <div>
                  <span className="text-white/60 block">{isEn ? 'Stage:' : 'المرحلة الدراسية:'}</span>
                  <span className="font-semibold text-white/90">{schoolStage}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-[#172C40] font-['Tajawal'] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#C6A66A]" />
              <span>{isEn ? 'Official Identity & Educational Branding' : 'الهوية الرسمية وبيانات المدرسة المعتمدة'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#172C40] mb-1">{isEn ? 'Platform Name' : 'اسم المنظومة'}</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-[#172C40]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{isEn ? 'Platform Subtitle' : 'عنوان المنظومة التوضيحي'}</label>
                <input
                  type="text"
                  value={platformTitle}
                  onChange={(e) => setPlatformTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{isEn ? 'Platform Slogan' : 'الشعار اللفظي المعتمد'}</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-['Tajawal']"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.settings.schoolNameLabel}</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.settings.stageLabel}</label>
                <input
                  type="text"
                  value={schoolStage}
                  onChange={(e) => setSchoolStage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{t.settings.principalLabel}</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder={isEn ? 'School Principal Full Name' : 'اسم مدير المدرسة'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-[#172C40] mb-1">{t.settings.welcomeMsgLabel}</label>
                <textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="md:col-span-2 p-4 rounded-xl border border-[#C6A66A]/40 bg-[#F2EBDD]/30 space-y-3">
                <div>
                  <label className="block font-bold text-[#172C40] mb-2">{isEn ? 'School Logo' : 'شعار المدرسة'}</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0], 'logo')} className="w-full text-xs file:me-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#172C40] file:text-white" />
                  <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder={isEn ? 'Or paste an image URL...' : 'أو ألصق رابط صورة الشعار...'} className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]" />
                  {logoUrl && <img src={logoUrl} alt="معاينة شعار المدرسة" className="mt-2 h-20 max-w-40 object-contain bg-white border rounded-lg p-2" />}
                </div>
                <div className="border-t border-[#C6A66A]/30 pt-3">
                  <label className="block font-bold text-[#172C40] mb-2">{isEn ? 'Homepage Hero Image' : 'صورة الصفحة الرئيسة'}</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0], 'home')} className="w-full text-xs file:me-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#172C40] file:text-white" />
                  <input type="text" value={homeImageUrl} onChange={(e) => setHomeImageUrl(e.target.value)} placeholder={isEn ? 'Or paste an image URL...' : 'أو ألصق رابط صورة الصفحة الرئيسة...'} className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]" />
                  {homeImageUrl && <img src={homeImageUrl} alt="معاينة صورة الصفحة الرئيسة" className="mt-2 w-full max-h-36 object-cover rounded-lg border" />}
                  <p className="text-[10px] text-slate-500 mt-1">{isEn ? 'Image uploads up to 1.2 MB are supported.' : 'يمكن إرفاق صور لا يتجاوز حجمها 1.2 ميجابايت.'}</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{isEn ? 'Contact Email' : 'البريد الإلكتروني الرسمي للتواصل'}</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">{isEn ? 'Contact Phone' : 'هاتف المدرسة'}</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: Registered Visitors Directory (إدارة الزائرين)       */}
      {/* ============================================================== */}
      {activeSubTab === 'visitors' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#172C40] font-['Tajawal'] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C6A66A]" />
                <span>{t.visitorsManagement.title}</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                {t.visitorsManagement.subtitle}
              </p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAddVisitor}
                className="px-4 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] flex items-center gap-2 cursor-pointer shadow-sm border border-[#C6A66A]/40 transition-all hover:scale-[1.02] text-xs shrink-0 self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4 text-[#C6A66A]" />
                <span>{t.visitorsManagement.addBtn}</span>
              </button>
            )}
          </div>

          {/* Visitors Grid */}
          {visitorsList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 space-y-3">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p>{t.visitorsManagement.noVisitors}</p>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleOpenAddVisitor}
                  className="px-4 py-2 bg-[#172C40] text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#101F2D]"
                >
                  <UserPlus className="w-4 h-4 text-[#C6A66A]" />
                  <span>{t.visitorsManagement.addBtn}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {visitorsList.map((vis) => (
                <div
                  key={vis.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#172C40]/40 transition-all shadow-2xs space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-[#172C40] text-sm font-['Tajawal'] block">
                        {vis.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#172C40] text-white shrink-0">
                        {isEn ? (translations.en.visitorRoles[vis.role as keyof typeof translations.en.visitorRoles] || vis.role) : AtharStorageService.getVisitorRoleLabel(vis.role)}
                      </span>
                    </div>

                    {vis.roleTitle && (
                      <p className="text-slate-600 font-medium text-[11px] leading-tight">
                        {vis.roleTitle}
                      </p>
                    )}

                    {vis.department && (
                      <span className="text-[#668575] font-semibold text-[10px] block">
                        {vis.department}
                      </span>
                    )}

                    {vis.jobNumber && (
                      <span className="text-slate-400 font-mono text-[10px] block">
                        ID: {vis.jobNumber}
                      </span>
                    )}

                    {vis.username && (
                      <div className="flex items-center justify-between bg-amber-50/70 border border-[#C6A66A]/30 px-2 py-1 rounded-md text-[10px] text-[#172C40] mt-1 font-semibold">
                        <span className="flex items-center gap-1 font-mono text-[#172C40]" dir="ltr">
                          <KeyRound className="w-3 h-3 text-[#C6A66A]" />
                          <span>@{vis.username}</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono" dir="ltr">
                          pass: {vis.password || '123'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] gap-2">
                    <div className="space-y-0.5 text-slate-500 text-[10px] truncate">
                      {vis.email && (
                        <div className="flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]">{vis.email}</span>
                        </div>
                      )}
                      {vis.phone && (
                        <div className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{vis.phone}</span>
                        </div>
                      )}
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditVisitor(vis)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#172C40] text-slate-700 hover:text-white rounded-lg transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer border border-slate-200"
                          title={isEn ? 'Edit Evaluator Data' : 'تعديل بيانات المقيم'}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#C6A66A]" />
                          <span>{isEn ? 'Edit' : 'تعديل البيانات'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVisitor(vis.id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer border border-rose-200"
                          title={isEn ? 'Delete Evaluator' : 'حذف المقيم أو الزائر'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Delete' : 'حذف'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: Evaluators & User Credentials Management              */}
      {/* ============================================================== */}
      {activeSubTab === 'users' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#172C40] font-['Tajawal'] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#C6A66A]" />
                <span>{isEn ? 'Evaluator Accounts & Login Credentials' : 'حسابات المقيّمين وبيانات تسجيل الدخول (يوزرنيم وباسوورد)'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isEn 
                  ? 'All evaluators have full authority to update their username and password at any time.' 
                  : 'يحق لكافة المقيّمين والمسؤولين تعديل وتحديث اسم المستخدم (اليوزرنيم) وكلمة المرور (الباسوورد) في أي وقت.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const name = prompt(isEn ? 'Enter full name for new evaluator:' : 'أدخل الاسم الكامل للمقيم الجديد:');
                if (name && name.trim()) {
                  const added = AtharStorageService.addCustomEvaluator(name.trim());
                  setAllUsersList(AtharStorageService.getAllUsers());
                  showFeedback('success', isEn ? `Evaluator ${name} created.` : `تمت إضافة المقيم: ${name}`);
                  setSelectedUserForCredentials(added);
                }
              }}
              className="px-4 py-2 bg-[#172C40] text-white rounded-lg text-xs font-bold hover:bg-[#101F2D] flex items-center gap-1.5 cursor-pointer shadow-xs self-start"
            >
              <UserPlus className="w-4 h-4 text-[#C6A66A]" />
              <span>{isEn ? 'Add New Evaluator' : '➕ إضافة مقيّم جديد'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allUsersList.map((user) => (
              <div 
                key={user.id} 
                className="p-4 rounded-xl border border-slate-200 hover:border-[#172C40] bg-slate-50/50 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#172C40] text-[#C6A66A] flex items-center justify-center font-bold text-sm shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#172C40]">{user.name}</h4>
                      <span className="text-[11px] text-[#668575] font-semibold block">
                        {isEn ? (translations.en.roles[user.role] || user.role) : AtharStorageService.getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[10px] text-slate-400 font-sans">{isEn ? 'Username:' : 'اليوزرنيم:'}</span>
                    <span className="font-bold text-[#172C40]" dir="ltr">@{user.username || 'not_set'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[10px] text-slate-400 font-sans">{isEn ? 'Password:' : 'كلمة المرور:'}</span>
                    <span className="font-bold text-slate-700" dir="ltr">{user.password || '123'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForCredentials(user)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-[#172C40] text-slate-700 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                    title={isEn ? 'Edit Credentials & Details' : 'تعديل البيانات واليوزرنيم والباسوورد'}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C6A66A]" />
                    <span>{isEn ? 'Edit Details' : 'تعديل البيانات'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="py-1.5 px-3 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer border border-rose-200"
                    title={isEn ? 'Delete Evaluator' : 'حذف المقيم'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Delete' : 'حذف'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: Demo Data & Records Management (حذف البيانات)       */}
      {/* ============================================================== */}
      {activeSubTab === 'data' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#172C40] font-['Tajawal'] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#C6A66A]" />
              <span>{t.demoDataManagement.title}</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              {t.demoDataManagement.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Clear Demo Visits */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-[#172C40] text-sm block">
                  {t.demoDataManagement.clearVisitsBtn}
                </span>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  {t.demoDataManagement.clearVisitsDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPurgeTarget('visits');
                  setIsPurgeModalOpen(true);
                }}
                className="px-4 py-2 bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs self-start"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.demoDataManagement.clearVisitsBtn}</span>
              </button>
            </div>

            {/* 2. Clear Demo Plans */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-[#172C40] text-sm block">
                  {t.demoDataManagement.clearPlansBtn}
                </span>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  {t.demoDataManagement.clearPlansDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPurgeTarget('plans');
                  setIsPurgeModalOpen(true);
                }}
                className="px-4 py-2 bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs self-start"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.demoDataManagement.clearPlansBtn}</span>
              </button>
            </div>

            {/* 3. Clear Demo Teachers */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-[#172C40] text-sm block">
                  {t.demoDataManagement.clearTeachersBtn}
                </span>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  {t.demoDataManagement.clearTeachersDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPurgeTarget('teachers');
                  setIsPurgeModalOpen(true);
                }}
                className="px-4 py-2 bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs self-start"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.demoDataManagement.clearTeachersBtn}</span>
              </button>
            </div>

            {/* 4. Complete Clean Slate Purge */}
            <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/40 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-rose-950 text-sm block">
                  {t.demoDataManagement.cleanStartBtn}
                </span>
                <p className="text-rose-900/80 text-[11px] mt-1 leading-relaxed">
                  {t.demoDataManagement.cleanStartDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPurgeTarget('all');
                  setIsPurgeModalOpen(true);
                }}
                className="px-4 py-2 bg-rose-700 text-white hover:bg-rose-800 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.demoDataManagement.cleanStartBtn}</span>
              </button>
            </div>
          </div>

          {/* Restore sample demo records */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F2EBDD]/40 p-4 rounded-xl border border-[#C6A66A]/40">
            <div>
              <span className="font-bold text-[#172C40] block">{t.demoDataManagement.restoreDemoBtn}</span>
              <p className="text-slate-600 text-[11px] mt-0.5">{t.demoDataManagement.restoreDemoDesc}</p>
            </div>
            <button
              type="button"
              onClick={handleRestoreDemoData}
              className="px-4 py-2 bg-white text-[#172C40] border border-[#C6A66A] rounded-lg font-bold hover:bg-[#F2EBDD] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C6A66A]" />
              <span>{t.demoDataManagement.restoreDemoBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 4: Security & Audit Logs (سجل العمليات والأمان)         */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* SUB-TAB 4: Security & Audit Logs (سجل العمليات والأمان)         */}
      {/* ============================================================== */}
      {activeSubTab === 'audit' && (() => {
        const uniqueAuditActions = Array.from(new Set(localAuditLogs.map(l => l.action))).filter(Boolean);
        const uniqueAuditUsers = Array.from(new Set(localAuditLogs.map(l => l.userName))).filter(Boolean);

        const filteredAuditLogs = localAuditLogs
          .filter(log => {
            const matchesSearch = !auditSearch.trim() || 
              log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
              log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
              log.details.toLowerCase().includes(auditSearch.toLowerCase());
            const matchesAction = auditActionFilter === 'ALL' || log.action === auditActionFilter;
            const matchesUser = auditUserFilter === 'ALL' || log.userName === auditUserFilter;
            return matchesSearch && matchesAction && matchesUser;
          })
          .sort((a, b) => {
            return auditSortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
          });

        return (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden space-y-0">
            {/* Header & Clear Button */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#C6A66A]" />
                <div>
                  <h3 className="font-bold text-sm text-[#172C40] font-['Tajawal']">{t.settings.tabAudit}</h3>
                  <span className="text-slate-400 text-xs block">
                    {isEn 
                      ? `Showing ${filteredAuditLogs.length} of ${localAuditLogs.length} logged operations` 
                      : `عرض ${filteredAuditLogs.length} من أصل ${localAuditLogs.length} عملية مسجلة`}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Clear Audit Log */}
              {canEdit && (
                <button
                  type="button"
                  onClick={handleClearAuditLogs}
                  disabled={localAuditLogs.length === 0}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-200 shadow-2xs self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isEn ? 'Clear Entire Audit Log' : 'مسح كامل سجل العمليات'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Clear Audit Log' : 'مسح السجل'}</span>
                </button>
              )}
            </div>

            {/* Filter and Sorting Controls Toolbar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className={`w-3.5 h-3.5 absolute ${isEn ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
                <input
                  type="text"
                  placeholder={isEn ? 'Search logs by user, action, details...' : 'بحث في السجل بالاسم، العملية، التفاصيل...'}
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className={`w-full py-1.5 ${isEn ? 'pl-8 pr-2.5' : 'pr-8 pl-2.5'} bg-white border border-slate-300 rounded-lg text-xs text-[#172C40] focus:outline-none focus:border-[#172C40]`}
                />
              </div>

              {/* Filter by Action */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2 py-1">
                <Filter className="w-3.5 h-3.5 text-[#C6A66A]" />
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#172C40] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">{isEn ? 'All Actions' : 'جميع العمليات'}</option>
                  {uniqueAuditActions.map((act) => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>

              {/* Filter by User */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2 py-1">
                <Users className="w-3.5 h-3.5 text-[#668575]" />
                <select
                  value={auditUserFilter}
                  onChange={(e) => setAuditUserFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#172C40] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">{isEn ? 'All Users' : 'جميع المستخدمين'}</option>
                  {uniqueAuditUsers.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Sorting Toggle */}
              <button
                type="button"
                onClick={() => setAuditSortAsc(!auditSortAsc)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-[#172C40] text-[#172C40] rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isEn ? 'Toggle Sort Order' : 'تغيير اتجاه الفرز'}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#C6A66A]" />
                <span>{auditSortAsc ? (isEn ? 'Sort: Oldest First' : 'الفرز: الأقدم أولاً') : (isEn ? 'Sort: Newest First' : 'الفرز: الأحدث أولاً')}</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-96">
              <table className={`w-full ${isEn ? 'text-left' : 'text-right'} border-collapse text-xs`}>
                <thead className="bg-[#F8FAFC] sticky top-0 text-[#172C40] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">{isEn ? 'Timestamp' : 'الوقت والتاريخ'}</th>
                    <th className="py-2.5 px-4 font-bold">{isEn ? 'User' : 'المستخدم'}</th>
                    <th className="py-2.5 px-4 font-bold">{isEn ? 'Role' : 'الدور'}</th>
                    <th className="py-2.5 px-4 font-bold">{isEn ? 'Action' : 'العملية'}</th>
                    <th className="py-2.5 px-4 font-bold">{isEn ? 'Details' : 'التفاصيل'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        {isEn ? 'No log entries match your filter.' : 'لا توجد عمليات مطابقة لخيارات الفرز الحالية.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-2.5 px-4 font-bold text-[#172C40] whitespace-nowrap">{log.userName}</td>
                        <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{log.userRole}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 text-[11px]">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL 1: Add or Edit Visitor Modal                             */}
      {/* ============================================================== */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#172C40]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-[#172C40] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C6A66A]" />
                <h3 className="font-bold text-sm font-['Tajawal']">
                  {editingVisitor ? t.visitorsManagement.editTitle : t.visitorsManagement.newTitle}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsVisitorModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVisitorSubmit} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-[#172C40] mb-1">
                  {t.visitorsManagement.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={visitorFormName}
                  onChange={(e) => setVisitorFormName(e.target.value)}
                  placeholder={isEn ? 'Dr. / Mr. / Ms. ...' : 'د. / أ. ...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-[#172C40]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172C40] mb-1">
                    {t.visitorsManagement.roleLabel}
                  </label>
                  <select
                    value={visitorFormRole}
                    onChange={(e) => setVisitorFormRole(e.target.value as VisitorRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-[#172C40]"
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
                </div>

                <div>
                  <label className="block font-bold text-[#172C40] mb-1">
                    {t.visitorsManagement.jobNumberLabel}
                  </label>
                  <input
                    type="text"
                    value={visitorFormJobNumber}
                    onChange={(e) => setVisitorFormJobNumber(e.target.value)}
                    placeholder="V-8801"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">
                  {t.visitorsManagement.roleTitleLabel}
                </label>
                <input
                  type="text"
                  value={visitorFormTitle}
                  onChange={(e) => setVisitorFormTitle(e.target.value)}
                  placeholder={isEn ? 'e.g. Lead Quality Evaluator' : 'مثال: خبير تقييم وملاحظة صفية'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1">
                  {t.visitorsManagement.deptLabel}
                </label>
                <input
                  type="text"
                  value={visitorFormDept}
                  onChange={(e) => setVisitorFormDept(e.target.value)}
                  placeholder={isEn ? 'e.g. Educational Inspection Team / Cycle 2' : 'مثال: فريق الرقابة والتقويم المدرسي'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172C40] mb-1">
                    {t.visitorsManagement.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={visitorFormEmail}
                    onChange={(e) => setVisitorFormEmail(e.target.value)}
                    placeholder="name@ese.gov.ae"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#172C40] mb-1">
                    {t.visitorsManagement.phoneLabel}
                  </label>
                  <input
                    type="text"
                    value={visitorFormPhone}
                    onChange={(e) => setVisitorFormPhone(e.target.value)}
                    placeholder="+971 50 ..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Credentials Configuration for the Evaluator */}
              <div className="p-3.5 bg-[#F2EBDD]/40 rounded-xl border border-[#C6A66A]/40 space-y-2">
                <div className="flex items-center gap-1.5 text-[#172C40] font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-[#C6A66A]" />
                  <span>{isEn ? 'Platform Login Account (Username & Password)' : 'بيانات تسجيل دخول المقيّم للمنصة (اليوزرنيم والباسوورد)'}</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {isEn 
                    ? 'Setting these credentials allows this evaluator to sign into ATHAR directly from the homepage.' 
                    : 'تتيح هذه البيانات للمقيّم تسجيل الدخول فورًا إلى المنصة والبدء برصد الزيارة الصفية.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#172C40] text-[11px] mb-1">
                      {isEn ? 'Username' : 'اسم المستخدم (اليوزرنيم)'}
                    </label>
                    <input
                      type="text"
                      value={visitorFormUsername}
                      onChange={(e) => setVisitorFormUsername(e.target.value)}
                      placeholder={isEn ? 'e.g. m_alali' : 'مثال: alali_evaluator'}
                      dir="ltr"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#172C40] text-[11px] mb-1">
                      {isEn ? 'Password' : 'كلمة المرور (الباسوورد)'}
                    </label>
                    <input
                      type="text"
                      value={visitorFormPassword}
                      onChange={(e) => setVisitorFormPassword(e.target.value)}
                      placeholder="123"
                      dir="ltr"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVisitorModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#172C40] text-white rounded-lg font-bold hover:bg-[#101F2D] cursor-pointer shadow-sm"
                >
                  {t.visitorsManagement.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Safety Confirm Purge Modal                            */}
      {/* ============================================================== */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#172C40]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-300 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 bg-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm font-['Tajawal']">{t.demoDataManagement.confirmModalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-700 leading-relaxed text-xs">
                {t.demoDataManagement.confirmWarning}
              </p>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-bold text-xs">
                {purgeTarget === 'visits' && (isEn ? 'All recorded classroom observation visits will be wiped.' : 'سيتم حذف كافة سجلات الزيارات الصفية المسجلة.')}
                {purgeTarget === 'plans' && (isEn ? 'All improvement plans and follow-ups will be wiped.' : 'سيتم حذف كافة خطط التطوير المهني والمتابعات.')}
                {purgeTarget === 'teachers' && (isEn ? 'All demo teachers will be deleted to allow faculty CSV import.' : 'سيتم تفريغ سجل المعلمين بالكامل لإفساح المجال للاستيراد الفعلي.')}
                {purgeTarget === 'all' && (isEn ? 'All demo visits, plans, and teachers will be wiped for a clean institutional start.' : 'سيتم تفريغ كافة البيانات التجريبية (الزيارات، المعلمين، الخطط) دفعة واحدة.')}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPurgeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleExecutePurge}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold cursor-pointer shadow-xs"
                >
                  {t.demoDataManagement.confirmActionBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Username & Password for Selected User */}
      {selectedUserForCredentials && (
        <UserProfileModal
          isOpen={!!selectedUserForCredentials}
          onClose={() => setSelectedUserForCredentials(null)}
          currentUser={selectedUserForCredentials}
          onUserUpdated={(updated) => {
            setAllUsersList(AtharStorageService.getAllUsers());
            setSelectedUserForCredentials(null);
            showFeedback('success', isEn ? `Credentials updated for ${updated.name}` : `تم تحديث اسم المستخدم وكلمة المرور للمستخدم: ${updated.name}`);
            onRefreshSettings();
          }}
          language={language}
        />
      )}

    </div>
  );
};
