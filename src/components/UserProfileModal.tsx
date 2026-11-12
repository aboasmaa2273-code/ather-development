import React, { useState } from 'react';
import { User } from '../types';
import { AtharStorageService } from '../services/storageService';
import { 
  KeyRound, 
  User as UserIcon, 
  Lock, 
  Check, 
  X, 
  AlertCircle, 
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserUpdated: (updatedUser: User) => void;
  language?: Language;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  language = 'ar'
}) => {
  const isEn = language === 'en';

  const [name, setName] = useState<string>(currentUser.name || '');
  const [username, setUsername] = useState<string>(currentUser.username || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError(isEn ? 'Full name is required.' : 'الاسم الكامل مطلوب.');
      return;
    }

    if (!username.trim()) {
      setError(isEn ? 'Username is required.' : 'اسم المستخدم مطلوب.');
      return;
    }

    if (newPassword && newPassword.length < 3) {
      setError(isEn ? 'New password must be at least 3 characters.' : 'كلمة المرور الجديدة يجب أن تتكون من 3 أحرف أو أرقام على الأقل.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError(isEn ? 'Passwords do not match.' : 'كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const res = AtharStorageService.updateUserCredentials(
        currentUser.id,
        username.trim(),
        newPassword ? newPassword.trim() : undefined,
        name.trim()
      );

      setIsSaving(false);
      if (res.success && res.user) {
        onUserUpdated(res.user);
        setSuccessMessage(
          isEn 
            ? 'Account credentials updated successfully! You can now use your new username and password.' 
            : 'تم حفظ وتحديث اسم المستخدم وكلمة المرور بنجاح! يمكنك استخدامهما الآن لتسجيل الدخول في أي وقت.'
        );
        setTimeout(() => {
          onClose();
        }, 1400);
      } else {
        setError(res.error || (isEn ? 'Update failed.' : 'حدث خطأ أثناء حفظ التعديلات.'));
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#172C40]/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#C6A66A]/30 bg-[#172C40] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C6A66A]/20 border border-[#C6A66A]/40 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[#C6A66A]" />
            </div>
            <div>
              <h3 className="font-bold text-base font-['Tajawal'] text-white">
                {isEn ? 'Edit Profile & Security Credentials' : 'تعديل الحساب وتغيير اسم المستخدم وكلمة المرور'}
              </h3>
              <p className="text-[11px] text-[#C6A66A] font-medium">
                {currentUser.name} · {AtharStorageService.getRoleLabel(currentUser.role)}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 font-bold" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Current credentials hint */}
          <div className="p-3 rounded-xl bg-[#F2EBDD]/40 border border-[#C6A66A]/30 text-xs text-[#172C40] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">اسم المستخدم الحالي:</span>
              <span className="font-mono font-bold text-xs" dir="ltr">{currentUser.username || 'لم يُحدد'}</span>
            </div>
            <div className="text-end">
              <span className="text-[11px] text-slate-500 block">كلمة المرور المسجلة:</span>
              <span className="font-mono font-bold text-xs" dir="ltr">{currentUser.password || '123'}</span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {isEn ? 'Full Display Name' : 'الاسم الكامل الظاهر في التقارير والزيارات'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 ps-10 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C6A66A]"
                required
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {isEn ? 'Login Username (Can be changed anytime)' : 'اسم المستخدم لتسجيل الدخول (اليوزرنيم)'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 ps-10 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C6A66A]"
                dir="ltr"
                required
              />
              <span className="absolute start-3 top-2.5 text-xs font-mono font-bold text-slate-400">@</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isEn ? 'Used when logging into the platform.' : 'هو الاسم الذي تستخدمه لتسجيل الدخول إلى المنصة.'}
            </p>
          </div>

          {/* Change Password Section */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C6A66A]" />
                <span>{isEn ? 'Change Password (Leave blank to keep current)' : 'تغيير كلمة المرور (اتركها فارغة للإبقاء على الحالية)'}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#172C40] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? (isEn ? 'Hide' : 'إخفاء') : (isEn ? 'Show' : 'إظهار')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  {isEn ? 'New Password' : 'كلمة المرور الجديدة'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C6A66A]"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  {isEn ? 'Confirm New Password' : 'تأكيد كلمة المرور الجديدة'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C6A66A]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel' : 'إلغاء'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-[#172C40] hover:bg-[#101F2D] text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-[#C6A66A]" />
              <span>{isSaving ? (isEn ? 'Saving...' : 'جاري الحفظ...') : (isEn ? 'Save Changes' : 'حفظ التعديلات')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
