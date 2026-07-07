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
 *   data-response-mode="opaque"   <!-- only needed for Apps Script -->
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

        // Apps Script Web Apps typically don't send CORS headers a
        // browser can read, so the response is opaque to fetch(). In
        // that mode we treat "the request didn't throw" as success,
        // since we can't inspect res.ok. Normal backends (Formspree,
        // etc.) keep full response checking.
        if (isOpaque) {
          fetchOptions.mode = 'no-cors';
        } else {
          fetchOptions.headers = { Accept: 'application/json' };
        }

        const res = await fetch(endpoint, fetchOptions);
        if (!isOpaque && !res.ok) throw new Error(`HTTP ${res.status}`);

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