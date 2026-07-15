/**
 * contact-form.js
 * -----------------------------------------------------------------------
 * Progressive-enhancement handler for the enquiry form on contact_us.html.
 * Endpoint-agnostic by design: works against Formspree-style backends
 * (readable JSON response) or a Google Apps Script Web App (opaque
 * response) via the same code path, controlled by data attributes on
 * the <form> — no duplicated logic per backend.
 *
 * SETUP REQUIRED — configure via attributes on the <form>:
 *   data-endpoint="<your POST URL>"
 *   data-response-mode="opaque"   <!-- ONLY for backends verified to not
 *                                       support CORS. Google Apps Script
 *                                       deployments with "Anyone" access
 *                                       DO support readable responses —
 *                                       do not set this attribute for them.
 *                                       See note below on why. -->
 * -----------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  function initContactForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('[type="submit"]');
    const endpoint = form.dataset.endpoint;
    const isOpaque = form.dataset.responseMode === 'opaque';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot: a real visitor never fills this in. If it's filled,
      // silently "succeed" without sending anything, anywhere.
      const honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) {
        showStatus('success', 'Thank you \u2014 we will get back to you soon.');
        form.reset();
        return;
      }

      if (!validateForm(form)) return;

      if (!endpoint || endpoint.includes('YOUR_FORM_ID') || endpoint.includes('YOUR_SCRIPT_ID')) {
        console.warn('contact-form.js: no endpoint configured \u2014 see data-endpoint on the <form>.');
        showStatus('error', 'We couldn\u2019t send this automatically. Please email kishoreggm@gmail.com or call +91-9414917901.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending\u2026';

      try {
        const fetchOptions = { method: 'POST', body: new FormData(form) };

        if (isOpaque) {
          // We genuinely cannot inspect this response. "The request didn't
          // throw" is the ONLY signal available in this mode — meaning a
          // 403, a login redirect, or a broken script all look identical
          // to a real success. Only use this path for backends verified
          // to require it.
          fetchOptions.mode = 'no-cors';
          await fetch(endpoint, fetchOptions);
        } else {
          fetchOptions.headers = { Accept: 'application/json' };
          const res = await fetch(endpoint, fetchOptions);

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          // IMPORTANT: Google Apps Script's ContentService always returns
          // HTTP 200, even when the script's own try/catch caught an
          // internal error (e.g. a bad Sheet ID, a permissions failure)
          // and returned { result: 'error', message: '...' }. Checking
          // res.ok alone would report that as a success. We parse the
          // body and check the script's own reported result instead.
          const payload = await res.json().catch(() => null);
          if (!payload || payload.result !== 'success') {
            throw new Error((payload && payload.message) || 'Unexpected response from server.');
          }
        }

        showStatus('success', 'Thank you for reaching out \u2014 we will respond within 2\u20133 working days.');
        form.reset();
      } catch (err) {
        console.error('Contact form submission failed:', err);
        showStatus('error', 'Something went wrong sending this. Please email kishoreggm@gmail.com or call +91-9414917901.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });

    form.querySelectorAll('[required]').forEach((field) => {
      field.addEventListener('input', () => {
        if (field.checkValidity()) {
          field.closest('.form-field')?.classList.remove('has-error');
          field.setAttribute('aria-invalid', 'false');
        }
      });
    });

    function validateForm(formEl) {
      let isValid = true;
      formEl.querySelectorAll('[required]').forEach((field) => {
        const fieldValid = field.checkValidity();
        field.closest('.form-field')?.classList.toggle('has-error', !fieldValid);
        field.setAttribute('aria-invalid', String(!fieldValid));
        if (!fieldValid) isValid = false;
      });
      if (!isValid) showStatus('error', 'Please fill in the highlighted fields before sending.');
      return isValid;
    }

    function showStatus(type, message) {
      statusEl.textContent = message;
      statusEl.className = `form-status ${type}`;
      statusEl.setAttribute('role', 'status');
    }
  }

  global.initContactForm = initContactForm;
})(window);