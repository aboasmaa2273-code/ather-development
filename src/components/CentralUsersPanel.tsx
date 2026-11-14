import React, { useEffect, useState } from 'react';
import { CentralDatabaseClient, CentralSessionUser } from '../services/centralDatabaseClient';
import { Language } from '../i18n/translations';
import { UserPlus, RefreshCw, Save, UserX, UserCheck, Trash2, Pencil } from 'lucide-react';

type Role = CentralSessionUser['role'];
type ManagedUser = {
  userId: string;
  username: string;
  name: string;
  role: Role;
  schoolId: string;
  jobNumber: string;
  status: 'active' | 'disabled';
};
type Draft = {
  username: string;
  name: string;
  role: Role;
  jobNumber: string;
  password: string;
};

interface Props { language?: Language; }

const roles: Record<Role, { ar: string; en: string }> = {
  platform_admin: { ar: 'مسؤول المنصة', en: 'Platform admin' },
  school_admin: { ar: 'مسؤول المدرسة', en: 'School admin' },
  vice_principal: { ar: 'مساعد المدير', en: 'Vice principal' },
  evaluator: { ar: 'مقيّم', en: 'Evaluator' },
  teacher: { ar: 'معلم', en: 'Teacher' }
};

const emptyDraft = (): Draft => ({
  username: '', name: '', role: 'evaluator', jobNumber: '', password: ''
});

export const CentralUsersPanel: React.FC<Props> = ({ language = 'ar' }) => {
  const isAr = language === 'ar';
  const session = CentralDatabaseClient.getSession();
  const isPlatformAdmin = session?.user.role === 'platform_admin';
  const allowedRoles: Role[] = isPlatformAdmin
    ? ['platform_admin', 'school_admin', 'vice_principal', 'evaluator', 'teacher']
    : ['vice_principal', 'evaluator', 'teacher'];

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [editDraft, setEditDraft] = useState<Draft | null>(null);
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const result = await CentralDatabaseClient.listUsers();
    setLoading(false);
    if (!result.success) {
      setMessage(result.error || (isAr ? 'تعذر تحميل الحسابات.' : 'Could not load accounts.'));
      return;
    }
    const rows = Array.isArray(result.users) ? result.users as ManagedUser[] : [];
    setUsers(rows);
    if (selectedId) {
      const current = rows.find(user => user.userId === selectedId);
      if (current) setEditDraft({
        username: current.username, name: current.name, role: current.role,
        jobNumber: current.jobNumber || '', password: ''
      });
      else { setSelectedId(''); setEditDraft(null); }
    }
  };

  useEffect(() => { void loadUsers(); }, []);

  const selectForEdit = (user: ManagedUser) => {
    setSelectedId(user.userId);
    setEditDraft({
      username: user.username, name: user.name, role: user.role,
      jobNumber: user.jobNumber || '', password: ''
    });
  };

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newDraft.password.length < 12) {
      setMessage(isAr ? 'كلمة المرور يجب ألا تقل عن 12 حرفًا.' : 'Password must be at least 12 characters.');
      return;
    }
    if (newDraft.role === 'teacher' && !newDraft.jobNumber.trim()) {
      setMessage(isAr ? 'أدخل الرقم الوظيفي للمعلم.' : 'Enter the teacher employee number.');
      return;
    }
    setBusy('create');
    const result = await CentralDatabaseClient.createUser({
      username: newDraft.username, name: newDraft.name, password: newDraft.password,
      role: newDraft.role, jobNumber: newDraft.jobNumber
    });
    setBusy('');
    if (!result.success) {
      setMessage(result.error || (isAr ? 'تعذر إنشاء الحساب.' : 'Could not create account.'));
      return;
    }
    setNewDraft(emptyDraft());
    setMessage(isAr ? 'أُنشئ الحساب بنجاح.' : 'Account created.');
    await loadUsers();
  };

  const saveAccount = async () => {
    if (!selectedId || !editDraft) return;
    if (editDraft.password && editDraft.password.length < 12) {
      setMessage(isAr ? 'كلمة المرور الجديدة يجب ألا تقل عن 12 حرفًا.' : 'New password must be at least 12 characters.');
      return;
    }
    if (editDraft.role === 'teacher' && !editDraft.jobNumber.trim()) {
      setMessage(isAr ? 'يجب ربط حساب المعلم برقمه الوظيفي.' : 'A teacher account must have an employee number.');
      return;
    }
    setBusy(selectedId);
    const result = await CentralDatabaseClient.updateUser(selectedId, {
      username: editDraft.username, name: editDraft.name, role: editDraft.role,
      jobNumber: editDraft.jobNumber,
      ...(editDraft.password ? { password: editDraft.password } : {})
    });
    setBusy('');
    if (!result.success) {
      setMessage(result.error || (isAr ? 'تعذر تحديث الحساب.' : 'Could not update account.'));
      return;
    }
    setMessage(isAr ? 'تم تحديث الحساب. قد يحتاج المستخدم إلى تسجيل الدخول مجددًا.' : 'Account updated. The user may need to sign in again.');
    setEditDraft({ ...editDraft, password: '' });
    await loadUsers();
  };

  const changeStatus = async (user: ManagedUser, status: 'active' | 'disabled' | 'deleted') => {
    const prompt = status === 'deleted'
      ? (isAr ? 'سيُخفى الحساب من القائمة ولن يمكن إدارته مجددًا من هنا. هل تريد المتابعة؟' : 'This account will be hidden and cannot be managed here again. Continue?')
      : status === 'disabled'
        ? (isAr ? 'هل تريد تعطيل هذا الحساب؟' : 'Disable this account?')
        : (isAr ? 'هل تريد إعادة تفعيل هذا الحساب؟' : 'Reactivate this account?');
    if (!window.confirm(prompt)) return;
    setBusy(user.userId);
    const result = await CentralDatabaseClient.setUserStatus(user.userId, status);
    setBusy('');
    if (!result.success) {
      setMessage(result.error || (isAr ? 'تعذر تغيير حالة الحساب.' : 'Could not change account status.'));
      return;
    }
    setMessage(status === 'deleted'
      ? (isAr ? 'تم إخفاء الحساب من القائمة.' : 'Account hidden from the list.')
      : (isAr ? 'تم تغيير حالة الحساب.' : 'Account status changed.'));
    if (selectedId === user.userId) { setSelectedId(''); setEditDraft(null); }
    await loadUsers();
  };

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-[#172C40]">{isAr ? 'إدارة الحسابات المركزية' : 'Central Account Management'}</h3>
          <p className="text-xs text-slate-500 mt-1">{isAr ? 'إنشاء الحسابات وتعديل بياناتها وصلاحياتها وتعطيلها أو حذفها منطقيًا.' : 'Create accounts, update details and roles, disable or soft-delete users.'}</p>
        </div>
        <button type="button" onClick={() => void loadUsers()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold disabled:opacity-50">
          <RefreshCw className={loading ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} />
          {isAr ? 'تحديث القائمة' : 'Refresh list'}
        </button>
      </div>

      <form onSubmit={createAccount} className="grid grid-cols-1 md:grid-cols-6 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <input value={newDraft.name} onChange={e => setNewDraft(v => ({ ...v, name: e.target.value }))} placeholder={isAr ? 'الاسم الكامل' : 'Full name'} required className="rounded-lg border border-slate-300 px-3 py-2 text-xs md:col-span-2" />
        <input value={newDraft.username} onChange={e => setNewDraft(v => ({ ...v, username: e.target.value }))} placeholder={isAr ? 'اسم المستخدم' : 'Username'} required dir="ltr" autoComplete="off" className="rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        <select value={newDraft.role} onChange={e => setNewDraft(v => ({ ...v, role: e.target.value as Role }))} className="rounded-lg border border-slate-300 px-3 py-2 text-xs">
          {allowedRoles.map(role => <option key={role} value={role}>{isAr ? roles[role].ar : roles[role].en}</option>)}
        </select>
        <input value={newDraft.jobNumber} onChange={e => setNewDraft(v => ({ ...v, jobNumber: e.target.value }))} placeholder={isAr ? 'الرقم الوظيفي للمعلم' : 'Teacher employee no.'} dir="ltr" className="rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        <input value={newDraft.password} onChange={e => setNewDraft(v => ({ ...v, password: e.target.value }))} placeholder={isAr ? 'كلمة مرور (12 حرفًا فأكثر)' : 'Password (12+ chars)'} type="password" autoComplete="new-password" required className="rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        <button type="submit" disabled={busy === 'create' || loading} className="md:col-span-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#172C40] text-white px-4 py-2.5 text-xs font-bold disabled:opacity-50">
          <UserPlus className="w-4 h-4 text-[#C6A66A]" />
          {busy === 'create' ? (isAr ? 'جارٍ إنشاء الحساب...' : 'Creating account...') : (isAr ? 'إنشاء حساب جديد' : 'Create account')}
        </button>
      </form>

      <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
        {isAr ? 'حساب المعلم يتطلب وجود المعلم مسبقًا في سجل المعلمين المركزي برقم وظيفي فريد ونشط.' : 'Teacher accounts require an existing active teacher record with a unique employee number.'}
      </p>

      {message && <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-700">{message}</p>}

      <div className="space-y-2">
        {users.map(user => {
          const canManage = isPlatformAdmin || !['platform_admin', 'school_admin'].includes(user.role);
          return (
            <div key={user.userId} className="rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong className="text-sm text-[#172C40]">{user.name}</strong>
                <p className="text-[11px] text-slate-500" dir="ltr">@{user.username} · {user.jobNumber || '—'}</p>
                <p className="text-[10px] text-slate-500">{isAr ? roles[user.role].ar : roles[user.role].en} · {user.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطّل' : 'Disabled')}</p>
              </div>
              {canManage && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => selectForEdit(user)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-[11px] font-bold">
                    <Pencil className="w-3.5 h-3.5" />{isAr ? 'تعديل' : 'Edit'}
                  </button>
                  <button type="button" onClick={() => void changeStatus(user, user.status === 'active' ? 'disabled' : 'active')} disabled={busy === user.userId} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-[11px] font-bold disabled:opacity-50">
                    {user.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    {user.status === 'active' ? (isAr ? 'تعطيل' : 'Disable') : (isAr ? 'تفعيل' : 'Activate')}
                  </button>
                  <button type="button" onClick={() => void changeStatus(user, 'deleted')} disabled={busy === user.userId} className="inline-flex items-center gap-1 rounded-lg border border-red-200 text-red-700 px-3 py-2 text-[11px] font-bold disabled:opacity-50">
                    <Trash2 className="w-3.5 h-3.5" />{isAr ? 'حذف' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {!loading && users.length === 0 && <p className="text-xs text-slate-500 text-center py-4">{isAr ? 'لا توجد حسابات لعرضها.' : 'No accounts to display.'}</p>}
      </div>

      {selectedId && editDraft && (
        <div className="rounded-xl border border-[#C6A66A]/60 bg-[#F2EBDD]/30 p-4 space-y-3">
          <h4 className="font-bold text-sm text-[#172C40]">{isAr ? 'تعديل الحساب المحدد' : 'Edit selected account'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input value={editDraft.name} onChange={e => setEditDraft(v => v ? { ...v, name: e.target.value } : v)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" aria-label={isAr ? 'الاسم' : 'Name'} />
            <input value={editDraft.username} onChange={e => setEditDraft(v => v ? { ...v, username: e.target.value } : v)} dir="ltr" className="rounded-lg border border-slate-300 px-3 py-2 text-xs" aria-label={isAr ? 'اسم المستخدم' : 'Username'} />
            <select value={editDraft.role} onChange={e => setEditDraft(v => v ? { ...v, role: e.target.value as Role } : v)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs">
              {allowedRoles.map(role => <option key={role} value={role}>{isAr ? roles[role].ar : roles[role].en}</option>)}
            </select>
            <input value={editDraft.jobNumber} onChange={e => setEditDraft(v => v ? { ...v, jobNumber: e.target.value } : v)} dir="ltr" placeholder={isAr ? 'الرقم الوظيفي' : 'Employee no.'} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" />
            <input value={editDraft.password} onChange={e => setEditDraft(v => v ? { ...v, password: e.target.value } : v)} type="password" autoComplete="new-password" placeholder={isAr ? 'كلمة مرور جديدة (اختياري)' : 'New password (optional)'} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void saveAccount()} disabled={busy === selectedId} className="inline-flex items-center gap-2 rounded-lg bg-[#172C40] text-white px-4 py-2 text-xs font-bold disabled:opacity-50">
              <Save className="w-3.5 h-3.5" />{isAr ? 'حفظ التعديلات' : 'Save changes'}
            </button>
            <button type="button" onClick={() => { setSelectedId(''); setEditDraft(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold">{isAr ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </div>
      )}
    </section>
  );
};
