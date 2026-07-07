/**
 * testimonial-page.js
 * -----------------------------------------------------------------------
 * Data-driven "category tabs + video lightbox" component for testimonial.html.
 * Mirrors the existing gallery-page.js pattern: JSON in, DOM out, one shared
 * Bootstrap modal reused for every video instead of embedding N iframes at
 * once.
 *
 * ACCESSIBILITY:
 *  - Tabs follow the WAI-ARIA Tabs pattern: role="tablist"/"tab"/"tabpanel",
 *    aria-selected, roving tabindex, Left/Right/Home/End keyboard support.
 *  - The shared iframe gets a descriptive title set per-video, and its src
 *    is cleared on close so the video stops playing/loading in the background.
 *
 * Usage:
 *   initTestimonialPage({
 *     dataUrl: '/assets/json/testimonial-videos.json',
 *     tabsId:  'testimonial-tabs',
 *     gridId:  'testimonial-grid',
 *     modalId: 'testimonialVideoModal'
 *   });
 * -----------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  // Presentation metadata for each category key — kept separate from the
  // JSON data file since labels/icons are a display concern, not content.
  const CATEGORY_META = {
    students:    { label: 'Students',    icon: 'fa-user-graduate' },
    dignitaries: { label: 'Dignitaries', icon: 'fa-award' },
  };

  async function initTestimonialPage(config) {
    const { dataUrl, tabsId, gridId, modalId } = config;

    const tabsContainer = document.getElementById(tabsId);
    const grid = document.getElementById(gridId);
    const modalEl = document.getElementById(modalId);

    if (!tabsContainer || !grid || !modalEl) {
      console.error('initTestimonialPage: required elements missing from the DOM.');
      return;
    }

    const iframe = modalEl.querySelector('iframe');
    const modal = new bootstrap.Modal(modalEl);

    let categories = {};
    let activeCategory = null;

    try {
      const res = await fetch(dataUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      categories = await res.json();
    } catch (err) {
      console.error(`Failed to load testimonials from ${dataUrl}:`, err);
      grid.innerHTML = '<p class="testimonial-empty-state">These videos couldn\u2019t be loaded right now. Please try again later.</p>';
      return;
    }

    const categoryKeys = Object.keys(categories);
    if (categoryKeys.length === 0) {
      grid.innerHTML = '<p class="testimonial-empty-state">No testimonials available yet.</p>';
      return;
    }

    renderTabs(categoryKeys);
    loadCategory(categoryKeys[0]);

    // Stop the video and free the frame as soon as the modal closes.
    modalEl.addEventListener('hidden.bs.modal', () => {
      iframe.src = '';
      iframe.removeAttribute('title');
    });

    function renderTabs(keys) {
      tabsContainer.setAttribute('role', 'tablist');
      tabsContainer.setAttribute('aria-label', 'Testimonial categories');
      tabsContainer.innerHTML = '';

      keys.forEach((key, idx) => {
        const meta = CATEGORY_META[key] || { label: key, icon: 'fa-circle' };
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'testimonial-tab' + (idx === 0 ? ' active' : '');
        btn.id = `tab-${key}`;
        btn.dataset.category = key;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', String(idx === 0));
        btn.setAttribute('aria-controls', 'testimonial-panel');
        btn.tabIndex = idx === 0 ? 0 : -1;
        btn.innerHTML = `<i class="fas ${meta.icon}" aria-hidden="true"></i> ${escapeHtml(meta.label)}`;

        btn.addEventListener('click', () => selectTab(key, keys, true));
        btn.addEventListener('keydown', (e) => handleTabKeydown(e, keys));

        tabsContainer.appendChild(btn);
      });
    }

    function handleTabKeydown(e, keys) {
      const currentIdx = keys.indexOf(activeCategory);
      let nextIdx = null;

      if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % keys.length;
      else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + keys.length) % keys.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = keys.length - 1;
      else return;

      e.preventDefault();
      selectTab(keys[nextIdx], keys, false);
      tabsContainer.querySelector(`#tab-${keys[nextIdx]}`).focus();
    }

    function selectTab(key) {
      tabsContainer.querySelectorAll('.testimonial-tab').forEach((btn) => {
        const isActive = btn.dataset.category === key;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
        btn.tabIndex = isActive ? 0 : -1;
      });
      loadCategory(key);
    }

    function loadCategory(key) {
      activeCategory = key;
      const items = categories[key] || [];

      grid.innerHTML = '';
      grid.id = 'testimonial-panel';
      grid.setAttribute('role', 'tabpanel');
      grid.setAttribute('aria-labelledby', `tab-${key}`);

      if (items.length === 0) {
        grid.innerHTML = '<p class="testimonial-empty-state">No videos in this category yet.</p>';
        return;
      }

      items.forEach((item) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'video-card';
        card.setAttribute('aria-label', `Play testimonial video: ${item.name}`);
        card.innerHTML = `
          <span class="video-card__play" aria-hidden="true"><i class="fas fa-play"></i></span>
          <span class="video-card__name">${escapeHtml(item.name)}</span>
          ${item.role ? `<span class="video-card__role">${escapeHtml(item.role)}</span>` : ''}
        `;
        card.addEventListener('click', () => openVideo(item));
        grid.appendChild(card);
      });
    }

    function openVideo(item) {
      iframe.src = `https://drive.google.com/file/d/${item.videoId}/preview`;
      iframe.title = `${item.name} \u2014 video testimonial`;
      modal.show();
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }

  global.initTestimonialPage = initTestimonialPage;
})(window);