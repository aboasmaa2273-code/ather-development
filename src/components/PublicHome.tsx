import React, { useState } from 'react';
import heroFallback from '../assets/images/athar_hero_command_center.jfif';
import { PlatformSettings, User } from '../types';
import { AtharStorageService } from '../services/storageService';
import { 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  UserCheck,
  PlusCircle,
  FileCheck2,
  Sparkles,
  School,
  Lock,
  Compass,
  Users,
  X,
  Check
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface PublicHomeProps {
  platformSettings: PlatformSettings;
  onLoginClick: () => void;
  onSelectEvaluator?: (user: User, navigateTo?: string) => void;
  onAddNewEvaluator?: (name: string, roleTitle?: string) => void;
  language?: Language;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ 
  platformSettings, 
  onLoginClick,
  onSelectEvaluator,
  onAddNewEvaluator,
  language = 'ar' 
}) => {
  const t = translations[language];
  const isEn = language === 'en';

  // Evaluators list from storage
  const [evaluators, setEvaluators] = useState<User[]>(() => {
    return AtharStorageService.getAllUsers();
  });

  // Modal to add a new evaluator with credentials
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvaluatorName, setNewEvaluatorName] = useState('');
  const [newEvaluatorTitle, setNewEvaluatorTitle] = useState('');
  const [newEvaluatorUsername, setNewEvaluatorUsername] = useState('');
  const [newEvaluatorPassword, setNewEvaluatorPassword] = useState('123');

  const handleCreateEvaluator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvaluatorName.trim()) return;

    const chosenUsername = newEvaluatorUsername.trim() || newEvaluatorName.trim().toLowerCase().replace(/\s+/g, '_');
    const chosenPassword = newEvaluatorPassword.trim() || '123';

    const res = AtharStorageService.registerEvaluator({
      name: newEvaluatorName.trim(),
      username: chosenUsername,
      password: chosenPassword,
      specialization: newEvaluatorTitle.trim() || 'مقيّم تربوي معتمد'
    });

    if (res.success && res.user) {
      // Also register in RegisteredVisitors directory
      AtharStorageService.saveRegisteredVisitor({
        id: `vis_${Date.now()}`,
        name: res.user.name,
        role: 'evaluator',
        roleTitle: res.user.specialization,
        username: res.user.username,
        password: res.user.password
      });

      setEvaluators(AtharStorageService.getAllUsers());
      setIsAddModalOpen(false);
      setNewEvaluatorName('');
      setNewEvaluatorTitle('');
      setNewEvaluatorUsername('');
      setNewEvaluatorPassword('123');

      if (onSelectEvaluator) {
        onSelectEvaluator(res.user, 'new-visit');
      }
    }
  };

  const handleCardClick = (_user: User, _navigateTo: string = 'new-visit') => {
    // Evaluator identity is established only after credential verification.
    onLoginClick();
  };

  return (
    <div className="min-h-screen space-y-12 pb-16">
      
      {/* ============================================================== */}
      {/* 1. GENERAL WELCOME HERO WITH ATTACHED HIGH-TECH PHOTO           */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172C40] via-[#102334] to-[#0A1622] text-white border-2 border-[#C6A66A]/40 shadow-2xl p-6 sm:p-10 lg:p-12">
        
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-32 -end-32 w-96 h-96 bg-[#C6A66A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -start-32 w-96 h-96 bg-[#668575]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Column 1: Institutional Welcome Prose */}
          <div className={`lg:col-span-6 space-y-5 ${isEn ? 'text-left' : 'text-right'}`}>
            
            {/* Header Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#C6A66A]/20 border border-[#C6A66A]/40 text-[#C6A66A] text-xs font-bold tracking-wide">
                {isEn ? 'UAE Ministry of Education' : 'دولة الإمارات العربية المتحدة · وزارة التربية والتعليم'}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold">
                {isEn ? 'Academic Year 2026 - 2027' : 'العام الأكاديمي 2026 - 2027'}
              </span>
            </div>

            {/* Platform Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Tajawal'] tracking-tight text-white leading-tight">
                {isEn ? 'Welcome to ' : 'أهلاً ومرحباً بكم في منصة '}
                <span className="text-[#C6A66A]">«{platformSettings.platformName}»</span>
              </h1>
              <p className="text-base sm:text-lg text-white/90 font-medium mt-1">
                {isEn ? 'Educational Excellence & Continuous Development System' : platformSettings.platformTitle}
              </p>
              <p className="text-xs sm:text-sm text-[#C6A66A] font-semibold mt-1">
                {platformSettings.schoolName} · {platformSettings.schoolStage}
              </p>
            </div>

            {/* School Motto */}
            <div className="p-4 rounded-2xl bg-white/5 border border-[#C6A66A]/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#C6A66A] font-['Tajawal']">
                <Sparkles className="w-5 h-5 text-[#C6A66A] shrink-0" />
                <span>{platformSettings.slogan}</span>
              </div>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                {platformSettings.welcomeMessage}
              </p>
            </div>

            {/* Fast Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#evaluators-portal"
                className="px-6 py-3.5 bg-gradient-to-r from-[#C6A66A] to-[#b89556] text-[#172C40] text-sm font-extrabold rounded-xl hover:brightness-105 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isEn ? 'Choose Evaluator & Begin Visit' : 'اختر اسم المقيّم وابدأ الزيارة فوراً'}</span>
                {isEn ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </a>

              <button
                onClick={onLoginClick}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#C6A66A]" />
                <span>{isEn ? 'Sign in with Username & Password' : 'دخول باليوزرنيم والباسوورد'}</span>
              </button>
            </div>

          </div>

          {/* Column 2: THE USER-ATTACHED COMMAND CENTER PHOTO AS HERO DISPLAY */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#C6A66A] shadow-2xl bg-[#0F1D2B] group">
              <img
                src={platformSettings.homeImageUrl || heroFallback}
                alt="منصة أثر - وحدة المشاهدة والتقييم الصفي المباشر - مدرسة الصدارة بنين"
                className="w-full h-[380px] sm:h-[430px] object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1622] via-transparent to-transparent opacity-85" />
              
              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-4 right-4 left-4 p-4 rounded-xl bg-[#172C40]/90 border border-[#C6A66A]/40 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-[#C6A66A]" />
                    <span className="text-xs font-bold text-[#C6A66A]">
                      {isEn ? 'Direct Classroom Observation & Evaluation Command Center' : 'وحدة المشاهدة والتقييم الصفي المباشر'}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/70 font-mono">
                    {isEn ? 'Cycle 2 Boys' : 'مدرسة الصدارة بنين'}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 mt-1 leading-snug">
                  {isEn 
                    ? 'Capturing pedagogical dynamics, indicator mastery, and practical development plans in real time.' 
                    : 'رصد الممارسات الصفية الحية، وقياس نسب الإنجاز للمؤشرات الـ 22، وتوثيق خطط التطوير المهني.'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ============================================================== */}
      {/* 2. DEDICATED PANEL: مقيِّم الزيارة الصفية (Evaluator Observation Panel) */}
      {/* ============================================================== */}
      <section id="evaluator-panel" className="scroll-mt-24 space-y-6">
        
        {/* Executive VIP Panel for Classroom Observation Evaluator */}
        <div className="rounded-3xl bg-gradient-to-r from-[#172C40] via-[#122434] to-[#172C40] border-2 border-[#C6A66A] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-20 -end-20 w-72 h-72 bg-[#C6A66A]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -start-20 w-72 h-72 bg-[#668575]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#C6A66A] text-[#172C40] text-xs font-black tracking-wide flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Authorized Personnel Only' : 'الصلاحيات مقيدة للمخولين فقط'}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold border border-white/20">
                  {isEn ? 'Classroom Observation Suite' : 'بوابة الملاحظة والتقييم الصفي'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-white tracking-tight">
                {isEn ? 'Classroom Observation Evaluator' : 'مقيِّم الزيارة الصفية'}
              </h2>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                {isEn 
                  ? 'Click this panel to sign in securely with your authorized username and password, access your dedicated evaluation workspace, assess the 22 indicators, and record qualitative feedback.' 
                  : 'لوحة مخصصة للقيادات الإشرافية والمقيّمين المعتمدين؛ انقر هنا لتسجيل الدخول ببياناتك الرسمية (اليوزرنيم والباسوورد) والوصول المباشر إلى صفحة التقييم واستمارة رصد الزيارة الصفية وتوثيق التوصيات.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
              <button
                onClick={onLoginClick}
                className="px-6 py-3.5 bg-gradient-to-r from-[#C6A66A] to-[#b89556] hover:from-[#d4b478] hover:to-[#c6a66a] text-[#172C40] font-black text-sm rounded-xl transition-all shadow-lg hover:shadow-[#C6A66A]/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Lock className="w-4 h-4 text-[#172C40]" />
                <span>{isEn ? 'Sign in (Username & Password)' : 'الدخول باليوزرنيم والباسوورد'}</span>
                {isEn ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </button>

              <button
                onClick={onLoginClick}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#C6A66A]" />
                <span>{isEn ? 'Authorized Evaluator Sign In' : 'دخول المقيمين المعتمدين'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Evaluator Quick Selection Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#668575] mb-1">
              <Sparkles className="w-4 h-4 text-[#C6A66A]" />
              <span>{isEn ? 'Verified Evaluators Roster' : 'دليل القيادات والمقيّمين المعتمدين'}</span>
            </div>
            <h3 className="text-xl font-black text-[#172C40] font-['Tajawal']">
              {isEn ? 'Select Evaluator Account to Access Evaluation' : 'قائمة المقيّمين المعتمدين بالمنظومة'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isEn 
                ? 'Authorized accounts for evaluating classroom observations and providing official pedagogical feedback.' 
                : 'الحسابات المخولة رسميًا بإجراء التقييم الصفي ورصد مؤشرات الأداء والاعتماد.'}
            </p>
          </div>
        </div>

        {/* Evaluators Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {evaluators.map((user) => {
            const isAisha = user.id === 'user_cluster_director_aisha' || user.name.includes('عائشة الغفلي');
            const isHeadArabic = user.id === 'user_head_arabic' || user.name.includes('المواد العربية');
            const isPrincipal = user.role === 'school_admin' || user.name.includes('مدير المدرسة');
            const isVP = user.role === 'vice_principal' || user.name.includes('مساعد المدير');

            return (
              <div
                key={user.id}
                className={`rounded-2xl p-5 border-2 transition-all hover:shadow-xl relative flex flex-col justify-between space-y-4 bg-white cursor-pointer group ${
                  isAisha 
                    ? 'border-[#C6A66A] bg-gradient-to-b from-amber-50/30 to-white shadow-md' 
                    : 'border-slate-200 hover:border-[#172C40]'
                }`}
              >
                {/* VIP Ribbon for Cluster Director */}
                {isAisha && (
                  <div className="absolute top-3 end-3 px-2 py-0.5 rounded-full bg-[#C6A66A] text-[#172C40] text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#172C40]" />
                    <span>{isEn ? 'Cluster Director' : 'مديرة النطاق 2.8'}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Evaluator Avatar / Badge */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-xs shrink-0 ${
                      isAisha
                        ? 'bg-[#172C40] text-[#C6A66A] border-2 border-[#C6A66A]'
                        : isPrincipal
                        ? 'bg-[#172C40] text-white'
                        : isHeadArabic
                        ? 'bg-[#668575] text-white'
                        : 'bg-slate-800 text-[#C6A66A]'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#172C40] leading-snug group-hover:text-[#C6A66A] transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-[11px] text-[#668575] font-semibold mt-0.5">
                        {user.specialization || (isEn ? translations.en.roles[user.role] : AtharStorageService.getRoleLabel(user.role))}
                      </p>
                    </div>
                  </div>


                </div>

                {/* Primary Button: Enter and Start Visit */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleCardClick(user, 'new-visit')}
                    className="w-full py-2.5 bg-[#172C40] hover:bg-[#101F2D] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group-hover:bg-[#C6A66A] group-hover:text-[#172C40]"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#C6A66A] group-hover:text-[#172C40]" />
                    <span>{isEn ? 'Start Classroom Visit Now' : 'دخول وبدء التقييم الصفي'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCardClick(user, 'dashboard')}
                    className="w-full py-1.5 text-[11px] text-slate-500 hover:text-[#172C40] hover:bg-slate-50 rounded-lg font-semibold transition-colors text-center cursor-pointer"
                  >
                    {isEn ? 'Or open dashboard' : 'أو تصفح لوحة المتابعة'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. MODAL: ADD NEW EVALUATOR DIRECTLY                           */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#172C40]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#172C40] text-white flex items-center justify-between border-b border-[#C6A66A]/30">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#C6A66A]" />
                <h3 className="font-bold text-sm font-['Tajawal'] text-white">
                  {isEn ? 'Add New Evaluator / Observer' : 'إضافة مقيّم جديد للمنظومة'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvaluator} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#172C40] mb-1.5">
                  {isEn ? 'Evaluator Full Name *' : 'اسم المقيّم الكامل *'}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={isEn ? 'e.g. Dr. Hessa Al Dhaheri' : 'مثال: د. مريم الشامسي'}
                  value={newEvaluatorName}
                  onChange={(e) => setNewEvaluatorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-xl font-bold text-sm text-[#172C40] focus:border-[#172C40] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172C40] mb-1.5">
                  {isEn ? 'Role / Specialization' : 'المسمى الوظيفي / التخصص التربوي'}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? 'e.g. Educational Supervisor / Senior Evaluator' : 'مثال: موجه تربوي / مقيّم جودة أول'}
                  value={newEvaluatorTitle}
                  onChange={(e) => setNewEvaluatorTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-[#172C40] focus:border-[#172C40] focus:outline-none"
                />
              </div>

              {/* Username & Password */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-[#C6A66A]/30 space-y-2">
                <div className="text-[11px] font-bold text-[#172C40] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#C6A66A]" />
                  <span>{isEn ? 'Login Credentials (Username & Password)' : 'بيانات تسجيل الدخول المعتمدة (يوزرنيم وباسوورد)'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">
                      {isEn ? 'Username' : 'اليوزرنيم'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="username"
                      value={newEvaluatorUsername}
                      onChange={(e) => setNewEvaluatorUsername(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">
                      {isEn ? 'Password' : 'الباسوورد'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="123"
                      value={newEvaluatorPassword}
                      onChange={(e) => setNewEvaluatorPassword(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  {isEn ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#172C40] text-white hover:bg-[#101F2D] rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4 text-[#C6A66A]" />
                  <span>{isEn ? 'Save & Start Evaluating' : 'حفظ والدخول الفوري للتقييم'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SYSTEM PILLARS SECTION                                      */}
      {/* ============================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#668575]">
            {isEn ? 'Observation Framework' : 'مرتكزات القياس والتطوير المعتمدة'}
          </span>
          <h2 className="text-2xl font-black text-[#172C40] mt-1 font-['Tajawal']">
            {isEn ? 'Key Pillars of Athar Educational Framework' : 'محاور التميز والتقييم في منظومة «أَثَر»'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isEn 
              ? 'An evidence-based ecosystem designed to measure 22 essential classroom indicators.' 
              : 'نموذج تربوي حديث وموثوق يربط مؤشرات الحصة الصفية بمخرجات التعلم وجودة التدريس.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-xl border border-slate-100 bg-[#F8FAFC] space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#172C40]/10 flex items-center justify-center text-[#172C40]">
              <Compass className="w-5 h-5 text-[#C6A66A]" />
            </div>
            <h3 className="font-bold text-sm text-[#172C40]">
              {isEn ? 'Direct Evidence Observation' : 'المشاهدة المباشرة الممنهجة'}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {isEn 
                ? 'Objective rubrics covering 22 ministerial indicators with clear benchmarks.' 
                : 'رصد دقيق لممارسات المعلم وتفاعل الطلبة وفق مصفوفة المؤشرات الـ 22 الرسمية.'}
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-100 bg-[#F8FAFC] space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#668575]/15 flex items-center justify-center text-[#668575]">
              <Award className="w-5 h-5 text-[#668575]" />
            </div>
            <h3 className="font-bold text-sm text-[#172C40]">
              {isEn ? 'Multi-Observer Governance' : 'حوكمة تعدد الزائرين والمقيمين'}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {isEn 
                ? 'Support for cluster directors, principals, vice principals, and subject coordinators in one visit.' 
                : 'إمكانية توثيق فريق الزيارة المشترك (مدير النطاق، مدير المدرسة، والموجهون) في سجل موحد.'}
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-100 bg-[#F8FAFC] space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#C6A66A]/20 flex items-center justify-center text-[#9c7e3f]">
              <TrendingUp className="w-5 h-5 text-[#C6A66A]" />
            </div>
            <h3 className="font-bold text-sm text-[#172C40]">
              {isEn ? 'Continuous Professional Growth' : 'خطط التطوير والأثر المستدام'}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {isEn 
                ? 'Immediate actionable recommendations and structured coaching milestones.' 
                : 'توصيات إجرائية جاهزة للاختيار السريع وجداول متابعة زمنية لضمان نمو الأداء.'}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
