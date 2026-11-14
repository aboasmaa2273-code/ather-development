import React, { useState } from 'react';
import { User, PlatformSettings } from '../types';
import { AtharStorageService } from '../services/storageService';
import { 
  UserCheck, 
  BookOpen, 
  Database, 
  LogOut, 
  Globe, 
  Sliders,
  ChartNoAxesCombined
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  platformSettings: PlatformSettings;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  activeTab,
  onTabChange,
  platformSettings,
  isLoggedIn,
  onLoginClick,
  onLogoutClick,
  language,
  onLanguageChange
}) => {
  const t = translations[language];
  const isEn = language === 'en';

  const [logoError, setLogoError] = useState(false);

  return (
    <header className="bg-[#172C40] text-white border-b-2 border-[#C6A66A] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-6">
            
            {/* Zone 1: Brand Wordmark & Identity */}
            <div 
              className="flex items-center gap-3.5 cursor-pointer shrink-0" 
              onClick={() => onTabChange(isLoggedIn ? 'dashboard' : 'home')}
            >
              <div className="w-12 h-12 rounded-lg bg-[#F2EBDD]/10 border border-[#C6A66A]/40 flex items-center justify-center p-1.5 overflow-hidden">
                {platformSettings.logoUrl && !logoError ? (
                  <img 
                    src={platformSettings.logoUrl} 
                    alt="شعار مدرسة الصدارة بنين" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <BookOpen className="w-7 h-7 text-[#C6A66A]" />
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black tracking-tight text-[#C6A66A] font-['Tajawal']">
                    {platformSettings.platformName}
                  </span>
                  <span className="text-xs text-white/70 hidden sm:inline font-medium">
                    {isEn ? 'Excellence & Growth Suite' : 'منظومة التميز والتطوير التعليمي'}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 truncate max-w-[220px] sm:max-w-xs">
                  {platformSettings.schoolName}
                </p>
              </div>
            </div>

            {/* Zone 2: Navigation Links (When Logged In) */}
            {isLoggedIn ? (
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'dashboard' 
                      ? 'bg-[#C6A66A] text-[#172C40]' 
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.nav.dashboard}
                </button>

                {['school_admin', 'platform_admin', 'vice_principal'].includes(currentUser.role) && (
                  <button
                    onClick={() => onTabChange('analytics')}
                    className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'analytics' ? 'bg-[#C6A66A] text-[#172C40]' : 'text-white/85 hover:text-white hover:bg-white/10'}`}
                  >
                    <ChartNoAxesCombined className="w-3.5 h-3.5" />
                    <span>لوحة المتابعة</span>
                  </button>
                )}

                <button
                  onClick={() => onTabChange('teachers')}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'teachers' 
                      ? 'bg-[#C6A66A] text-[#172C40]' 
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.nav.teachers}
                </button>

                <button
                  onClick={() => onTabChange('visits')}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'visits' || activeTab === 'new-visit'
                      ? 'bg-[#C6A66A] text-[#172C40]' 
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.nav.visits}
                </button>

                <button
                  onClick={() => onTabChange('plans')}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'plans' 
                      ? 'bg-[#C6A66A] text-[#172C40]' 
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.nav.plans}
                </button>

                <button
                  onClick={() => onTabChange('reports')}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'reports' 
                      ? 'bg-[#C6A66A] text-[#172C40]' 
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.nav.reports}
                </button>

                <button
                  onClick={() => onTabChange('gas-hub')}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'gas-hub' 
                      ? 'bg-[#668575] text-white' 
                      : 'text-[#C6A66A] hover:bg-white/10 border border-[#C6A66A]/30'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{t.nav.gasHub}</span>
                </button>

                {/* Settings Tab - Always visible */}
                <button
                  onClick={() => onTabChange('settings')}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'settings' 
                      ? 'bg-[#C6A66A] text-[#172C40]' 
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                  title={isEn ? 'Settings & Data Management' : 'الإعدادات وإدارة الزائرين وحذف البيانات'}
                >
                  <Sliders className="w-3.5 h-3.5 text-[#C6A66A]" />
                  <span>{t.nav.settings}</span>
                </button>
              </nav>
            ) : (
              <div className="hidden sm:block text-xs text-[#C6A66A] font-semibold">
                {isEn ? platformSettings.slogan : platformSettings.slogan}
              </div>
            )}

            {/* Zone 3: Settings Icon, Language Switcher, Authenticated User & Logout */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Quick Access Settings Icon Button (Always visible when logged in) */}
              {isLoggedIn && (
                <button
                  onClick={() => onTabChange('settings')}
                  className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                    activeTab === 'settings'
                      ? 'bg-[#C6A66A] text-[#172C40] border-[#C6A66A]'
                      : 'bg-[#101F2D] border-white/20 text-white hover:bg-white/10'
                  }`}
                  title={isEn ? 'Settings (Add, Edit, Delete Observers & Data)' : 'أيقونة الإعدادات (إضافة وتعديل وحذف الزائرين والبيانات)'}
                  aria-label="Settings"
                >
                  <Sliders className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#172C40]' : 'text-[#C6A66A]'}`} />
                </button>
              )}

              {/* Language Switcher Button */}
              <button
                onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
                className="px-2.5 py-1.5 rounded-lg bg-[#101F2D] hover:bg-white/10 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title={language === 'ar' ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
                aria-label={t.common.switchLanguage}
              >
                <Globe className="w-4 h-4 text-[#C6A66A]" />
                <span className="font-sans font-bold">{language === 'ar' ? 'English' : 'عربي'}</span>
              </button>

              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  {/* Logout button */}
                  <button
                    onClick={onLogoutClick}
                    title={t.nav.logout}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/90 hover:text-red-300 transition-colors cursor-pointer border border-white/20 hover:border-red-500/40 flex items-center gap-1.5 text-xs font-bold"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4 text-red-300" />
                    <span className="hidden sm:inline">{t.nav.logout}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 text-xs sm:text-sm font-bold bg-[#C6A66A] text-[#172C40] rounded-lg hover:bg-[#b5955a] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t.nav.login}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Subnav when logged in */}
        {isLoggedIn && (
          <div className="md:hidden bg-[#101F2D] px-4 py-2 flex items-center gap-2 overflow-x-auto border-t border-white/10 text-xs">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${activeTab === 'dashboard' ? 'bg-[#C6A66A] text-[#172C40]' : 'text-white/80'}`}
            >
              {t.nav.dashboard}
            </button>
            {['school_admin', 'platform_admin', 'vice_principal'].includes(currentUser.role) && (
              <button
                onClick={() => onTabChange('analytics')}
                className={`px-3 py-1.5 rounded whitespace-nowrap font-medium flex items-center gap-1 ${activeTab === 'analytics' ? 'bg-[#C6A66A] text-[#172C40]' : 'text-white/80'}`}
              >
                <ChartNoAxesCombined className="w-3.5 h-3.5" />
                <span>لوحة المتابعة</span>
              </button>
            )}
            <button
              onClick={() => onTabChange('teachers')}
              className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${activeTab === 'teachers' ? 'bg-[#C6A66A] text-[#172C40]' : 'text-white/80'}`}
            >
              {t.nav.teachers}
            </button>
            <button
              onClick={() => onTabChange('visits')}
              className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${activeTab === 'visits' ? 'bg-[#C6A66A] text-[#172C40]' : 'text-white/80'}`}
            >
              {t.nav.visits}
            </button>
            <button
              onClick={() => onTabChange('plans')}
              className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${activeTab === 'plans' ? 'bg-[#C6A66A] text-[#172C40]' : 'text-white/80'}`}
            >
              {t.nav.plans}
            </button>
            <button
              onClick={() => onTabChange('reports')}
              className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${activeTab === 'reports' ? 'bg-[#C6A66A] text-[#172C40]' : 'text-white/80'}`}
            >
              {t.nav.reports}
            </button>
            <button
              onClick={() => onTabChange('gas-hub')}
              className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${activeTab === 'gas-hub' ? 'bg-[#668575] text-white' : 'text-[#C6A66A]'}`}
            >
              {t.nav.gasHub}
            </button>
            <button
              onClick={() => onTabChange('settings')}
              className={`px-3 py-1.5 rounded whitespace-nowrap font-medium flex items-center gap-1 ${activeTab === 'settings' ? 'bg-[#C6A66A] text-[#172C40]' : 'text-white/80'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.nav.settings}</span>
            </button>
          </div>
        )}
      </header>
  );
};
