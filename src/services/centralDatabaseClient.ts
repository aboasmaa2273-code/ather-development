/**
 * أَثَر — عميل الاتصال الآمن نسبيًا بخادم Apps Script.
 * ينقل الطلبات عبر نموذج POST وإطار مخفي؛ لا يضع أسرارًا أو كلمات مرور في عنوان URL.
 */
const CONFIG_KEY = 'athar_central_database_endpoint_v1';
const RESPONSE_TYPE = 'ATHAR_DB_RESULT';
const TRUSTED_PARENT_ORIGIN = 'https://aboasmaa2273-code.github.io';

export type CentralApiResponse<T = unknown> = {
  success: boolean;
  error?: string;
  [key: string]: unknown;
};

export class CentralDatabaseClient {
  static getEndpoint(): string {
    try { return localStorage.getItem(CONFIG_KEY) || ''; } catch { return ''; }
  }

  static setEndpoint(value: string): { success: boolean; error?: string } {
    const endpoint = String(value || '').trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) {
      return { success: false, error: 'أدخل رابط نشر تطبيق Apps Script المنتهي بـ /exec.' };
    }
    try { localStorage.setItem(CONFIG_KEY, endpoint); }
    catch { return { success: false, error: 'تعذر حفظ رابط الخادم في هذا المتصفح.' }; }
    return { success: true };
  }

  static async request<T = unknown>(payload: Record<string, unknown>, timeoutMs = 20000): Promise<CentralApiResponse<T>> {
    const endpoint = this.getEndpoint();
    if (!endpoint) return { success: false, error: 'لم يُضبط رابط قاعدة البيانات المركزية بعد.' };
    if (typeof window === 'undefined' || window.location.origin !== TRUSTED_PARENT_ORIGIN) {
      return { success: false, error: 'اتصال قاعدة البيانات متاح من نطاق منصة أَثَر المنشور فقط.' };
    }

    const requestId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(36).slice(2);
    const frameName = 'athar_db_' + requestId.replace(/-/g, '');
    const iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.title = 'اتصال قاعدة بيانات أَثَر';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.display = 'none';

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = endpoint;
    form.target = frameName;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    const correlation = document.createElement('input');
    correlation.type = 'hidden';
    correlation.name = 'requestId';
    correlation.value = requestId;
    form.append(input, correlation);
    document.body.append(iframe, form);

    return new Promise(resolve => {
      let settled = false;
      const finish = (result: CentralApiResponse<T>) => {
        if (settled) return;
        settled = true;
        window.removeEventListener('message', onMessage);
        window.clearTimeout(timer);
        form.remove();
        iframe.remove();
        resolve(result);
      };
      const onMessage = (event: MessageEvent) => {
        if (event.source !== iframe.contentWindow) return;
        const data = event.data;
        if (!data || data.type !== RESPONSE_TYPE || data.requestId !== requestId) return;
        finish(data.payload as CentralApiResponse<T>);
      };
      const timer = window.setTimeout(
        () => finish({ success: false, error: 'انتهت مهلة الاتصال بالخادم. تحقق من رابط النشر وصلاحية الوصول.' }),
        timeoutMs
      );
      window.addEventListener('message', onMessage);
      try { form.submit(); }
      catch { finish({ success: false, error: 'تعذر إرسال الطلب إلى خادم قاعدة البيانات.' }); }
    });
  }

  static async testConnection(): Promise<CentralApiResponse> {
    return this.request({ action: 'ping', clientId: 'ather-web-client' });
  }
}
