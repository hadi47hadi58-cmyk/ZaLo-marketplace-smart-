/**
 * ZaLo Smart Algerian Multivendor Marketplace
 * نظام التحقق من ملكية البريد الإلكتروني - Client Email Verification Module
 */

export class EmailVerification {
  /**
   * Triggers a new email verification request token to be sent to the user.
   * @param {string} email 
   */
  static async sendVerificationRequest(email) {
    try {
      const response = await fetch('/api/auth/email-verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'فشل إرسال رمز التحقق للبريد.');
      }
      return result;
    } catch (error) {
      console.error('[Email Verification Request Error]:', error);
      throw error;
    }
  }

  /**
   * Submits and completes email verification using a token.
   * @param {string} token 
   */
  static async verifyEmailToken(token) {
    try {
      const response = await fetch('/api/auth/email-verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'رمز التحقق غير صالح أو منتهي الصلاحية.');
      }
      return result;
    } catch (error) {
      console.error('[Email Verification Error]:', error);
      throw error;
    }
  }

  /**
   * Renders a verification reminder notice or badge.
   * @param {HTMLElement} containerEl 
   * @param {string} email 
   * @param {boolean} isVerified 
   */
  static renderVerificationBadge(containerEl, email, isVerified) {
    if (!containerEl) return;

    if (isVerified) {
      containerEl.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 20px; color: #10b981; font-size: 11px; font-weight: bold; font-family: Cairo, sans-serif;">
          <i class="fa-solid fa-circle-check"></i> حساب موثق وآمن بالكامل
        </span>
      `;
    } else {
      containerEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; align-items: center; padding: 10px; background: rgba(245, 158, 11, 0.1); border: 1px dashed #f59e0b; border-radius: 12px; font-family: Cairo, sans-serif; text-align: center;">
          <span style="color: #f59e0b; font-size: 11px; font-weight: bold;">
            <i class="fa-solid fa-triangle-exclamation"></i> البريد غير مؤكد بعد
          </span>
          <button id="resendVerificationBtn" style="background: transparent; border: none; color: #fff; font-family: inherit; font-size: 10px; text-decoration: underline; cursor: pointer; padding: 2px;">
            اضغط هنا لإرسال رابط التأكيد مجدداً
          </button>
        </div>
      `;

      const resendBtn = containerEl.querySelector('#resendVerificationBtn');
      if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
          resendBtn.disabled = true;
          resendBtn.textContent = 'جاري الإرسال...';
          try {
            await this.sendVerificationRequest(email);
            alert(`تم إرسال رابط تأكيد البريد الإلكتروني بنجاح لـ: ${email} 📥`);
            resendBtn.textContent = 'تم الإرسال بنجاح ✅';
          } catch (err) {
            alert(err.message || 'فشل إرسال الطلب.');
            resendBtn.disabled = false;
            resendBtn.textContent = 'اضغط هنا لإرسال رابط التأكيد مجدداً';
          }
        });
      }
    }
  }
}

window.EmailVerification = EmailVerification;
