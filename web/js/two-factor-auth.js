/**
 * ZaLo Smart Algerian Multivendor Marketplace
 * معالج المصادقة الثنائية - Client Two-Factor Authentication (2FA) Handler
 */

export class TwoFactorAuth {
  /**
   * Requests a new 2FA setup from the backend.
   */
  static async requestSetup() {
    try {
      const response = await window.secureFetch('/api/security/2fa/setup', {
        method: 'POST',
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'فشل إعداد المصادقة الثنائية.');
      }
      return result;
    } catch (error) {
      console.error('[2FA Setup Error]:', error);
      throw error;
    }
  }

  /**
   * Confirms and activates 2FA on the user's account with the first generated token.
   * @param {string} secret 
   * @param {string} code 
   */
  static async enable2FA(secret, code) {
    try {
      const response = await window.secureFetch('/api/security/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ secret, code }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'رمز التحقق غير صحيح، يرجى المحاولة مجدداً.');
      }
      return result;
    } catch (error) {
      console.error('[2FA Enable Error]:', error);
      throw error;
    }
  }

  /**
   * Verifies the 2FA token on login step.
   * @param {string} email 
   * @param {string} code 
   */
  static async verify2FA(email, code) {
    try {
      const response = await fetch('/api/security/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'الرمز الثنائي غير صحيح.');
      }
      return result;
    } catch (error) {
      console.error('[2FA Verification Error]:', error);
      throw error;
    }
  }

  /**
   * Mounts a sleek, modern, Material-style 2FA input field in a container.
   * @param {HTMLElement} containerEl 
   * @param {Function} onCompletedCallback 
   */
  static mountVerificationUI(containerEl, onCompletedCallback) {
    if (!containerEl) return;

    containerEl.innerHTML = `
      <div style="direction: rtl; text-align: center; font-family: Cairo, sans-serif; padding: 20px;">
        <div style="font-size: 36px; margin-bottom: 12px; color: var(--gold, #c9a84c);">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h3 style="font-size: 16px; font-weight: 850; color: #fff; margin-bottom: 8px;">رمز المصادقة الثنائية المطلوب 🛡️</h3>
        <p style="font-size: 12px; color: var(--text2, #7a9e83); margin-bottom: 20px; line-height: 1.6;">
          أدخل الرمز السداسي (6 أرقام) من تطبيق الأمان الخاص بك (Google Authenticator أو Microsoft Authenticator) لإكمال تسجيل الدخول الآمن.
        </p>
        <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; direction: ltr;">
          <input type="text" maxlength="1" class="otp-input" style="width: 45px; height: 50px; text-align: center; font-size: 20px; font-weight: 900; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border, #1e3028); border-radius: 12px; color: #fff;" />
          <input type="text" maxlength="1" class="otp-input" style="width: 45px; height: 50px; text-align: center; font-size: 20px; font-weight: 900; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border, #1e3028); border-radius: 12px; color: #fff;" />
          <input type="text" maxlength="1" class="otp-input" style="width: 45px; height: 50px; text-align: center; font-size: 20px; font-weight: 900; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border, #1e3028); border-radius: 12px; color: #fff;" />
          <input type="text" maxlength="1" class="otp-input" style="width: 45px; height: 50px; text-align: center; font-size: 20px; font-weight: 900; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border, #1e3028); border-radius: 12px; color: #fff;" />
          <input type="text" maxlength="1" class="otp-input" style="width: 45px; height: 50px; text-align: center; font-size: 20px; font-weight: 900; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border, #1e3028); border-radius: 12px; color: #fff;" />
          <input type="text" maxlength="1" class="otp-input" style="width: 45px; height: 50px; text-align: center; font-size: 20px; font-weight: 900; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border, #1e3028); border-radius: 12px; color: #fff;" />
        </div>
        <button id="verify2faBtn" style="width: 100%; background: var(--green, #1a5c2a); border: 1px solid var(--gold, #c9a84c); color: #fff; font-family: inherit; font-size: 14px; font-weight: 800; padding: 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
          تأكيد الرمز الأمني والدخول <i class="fa-solid fa-arrow-left"></i>
        </button>
      </div>
    `;

    const inputs = containerEl.querySelectorAll('.otp-input');
    const verifyBtn = containerEl.querySelector('#verify2faBtn');

    // Autocomplete and dynamic focus switching
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
        
        // Trigger completion if all fields filled
        const code = Array.from(inputs).map(i => i.value).join('');
        if (code.length === 6) {
          verifyBtn.click();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });

    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        const code = Array.from(inputs).map(i => i.value).join('');
        if (code.length < 6) {
          alert('يرجى إدخال رمز الأمان السداسي كاملاً.');
          return;
        }
        onCompletedCallback(code);
      });
    }
  }
}

window.TwoFactorAuth = TwoFactorAuth;
