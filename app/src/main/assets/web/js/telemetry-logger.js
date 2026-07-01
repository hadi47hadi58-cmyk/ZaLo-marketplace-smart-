// ZaLo Smart Marketplace - Production Telemetry & Central Error Logging
// وحدة برمجية متكاملة لمراقبة الأداء، تتبع الأخطاء وتسجيل الاستثناءات في بيئة الإنتاج

class ZaLoTelemetry {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.userId = null;
    this.initGlobalErrorHandler();
  }

  setUserId(id) {
    this.userId = id;
    this.logInfo(`تم ربط معرّف المستخدم بالتيليمتري: ${id}`);
  }

  logInfo(message, context = {}) {
    this._addLog('INFO', message, context);
  }

  logWarning(message, context = {}) {
    this._addLog('WARNING', message, context);
  }

  logError(message, errorObject = {}, context = {}) {
    const errorDetails = {
      message: errorObject.message || String(errorObject),
      stack: errorObject.stack || '',
      ...context
    };
    this._addLog('ERROR', message, errorDetails);
    
    // محاكاة الإرسال التلقائي لخادم مراقبة الأخطاء في الإنتاج (مثل Sentry أو Datadog)
    this._sendToCentralServer('ERROR', message, errorDetails);
  }

  _addLog(level, message, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      userId: this.userId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // طباعة منظمة في وحدة التحكم للمطورين
    const colors = {
      INFO: '#00AEEF',
      WARNING: '#D4AF37',
      ERROR: '#FF3333'
    };
    console.log(
      `%c[ZaLo Telemetry - ${level}] %c${message}`,
      `color: ${colors[level]}; font-weight: bold;`,
      'color: inherit;',
      details
    );
  }

  initGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      this.logError('خطأ غير معالج في الواجهة الأمامية', event.error || { message: event.message }, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError('وعد (Promise) غير معالج أو مرفوض', event.reason, {
        type: 'unhandled_rejection'
      });
    });
  }

  async _sendToCentralServer(level, message, details) {
    // محاكاة إرسال لـ NestJS telemetry endpoint
    const telemetryUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/api/analytics/telemetry'
      : null;

    if (telemetryUrl) {
      try {
        fetch(telemetryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, message, details, timestamp: new Date().toISOString() })
        });
      } catch (e) {
        // صامت لتفادي أي حلقات أخطاء مفرغة
      }
    }
  }

  getRecentLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

// تصدير وتوفير مراقب الأداء والأخطاء عالمياً
export const telemetry = new ZaLoTelemetry();
window.ZaLoTelemetry = telemetry;
