import sharedDatabaseSource from '../../gas/SharedDatabase.gs?raw';

export interface GasFile {
  name: string;
  type: 'gs' | export const GAS_FILES: GasFile[] = [
  {
    name: 'SharedDatabase.gs',
    type: 'gs',
    description: 'الخادم المركزي الفعلي لمنصة أَثَر: تسجيل الدخول والصلاحيات وعزل بيانات المدرسة والزيارات والخطط وسجل التدقيق.',
    content: sharedDatabaseSource
  },
  {
    name: 'appsscript.json',
    type: 'json',
    description: 'إعدادات نشر خادم أَثَر المركزي على Google Apps Script بتوقيت دبي وإتاحة تطبيق الويب.',
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
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}`
  }
];