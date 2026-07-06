/**
 * gallery-page.js
 * -----------------------------------------------------------------------
 * Reusable, data-driven "gallery with lightbox" page component.
 * Powers gallery_news.html, gallery_scholarship.html, and awards.html
 * (and any future gallery page) from a single implementation.
 *
 * Supports two data shapes, auto-detected from the JSON payload:
 *
 *   A) YEAR-GROUPED (renders year filter tabs)
 *        { "2021-2025": ["/img1.jpg", "/img2.jpg"], "2011-2020": [...] }
 *
 *   B) FLAT (no filter tabs — one continuous grid)
 *        ["/img1.jpg", "/img2.jpg", ...]
 *
 * Each entry in either shape may be a plain string (bare image path) or
 * an object carrying caption metadata:
 *
 *        { "src": "/img1.jpg", "alt": "...", "title": "...",
 *          "date": "...", "desc": "..." }
 *
 * Items with no title/date/desc render as plain thumbnails; items that
 * carry any of those fields render as captioned cards. The two variants
 * can be mixed within the same dataset.
 *
 * Usage — year-grouped, plain thumbnails (news / scholarship galleries):
 *
 *   initGalleryPage({
 *     dataUrl:       '/assets/json/gallery-news.json',
 *     gridId:        'gallery',
 *     yearBtnsId:    'gallery-year-btns',
 *     modalId:       'galleryImageModal',
 *     altTextPrefix: 'Trust in News coverage'
 *   });
 *
 * Usage — flat, captioned cards (awards gallery):
 *
 *   initGalleryPage({
 *     dataUrl:       '/assets/json/awards.json',
 *     gridId:        'awards-grid',
 *     modalId:       'awardsImageModal',
 *     altTextPrefix: 'Award'
 *   });
 * -----------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  const FLAT_GROUP_KEY = '_all';

  /**
   * @param {Object} config
   * @param {string} config.dataUrl                  URL of the JSON data file.
   * @param {string} config.gridId                   id of the container that receives grid items.
   * @param {string} [config.yearBtnsId]              id of the container for year filter buttons.
   *                                                  Ignored (and safe to omit) for flat datasets.
   * @param {string} config.modalId                   id of the Bootstrap modal wrapping the lightbox carousel.
   * @param {string} [config.altTextPrefix='Gallery image'] Fallback alt-text prefix for items without their own `alt`.
   */
  async function initGalleryPage(config) {
    const {
      dataUrl,
      gridId,
      yearBtnsId,
      modalId,
      altTextPrefix = 'Gallery image',
    } = config;

    const grid = document.getElementById(gridId);
    const yearBtnsContainer = yearBtnsId ? document.getElementById(yearBtnsId) : null;
    const modalEl = document.getElementById(modalId);

    if (!grid || !modalEl) {
      console.error('initGalleryPage: required elements missing from the DOM (grid or modal).');
      return;
    }

    const carouselInner = modalEl.querySelector('.carousel-inner');
    const modal = new bootstrap.Modal(modalEl);

    let groups = {};
    let activeGroup = null;
    let isGrouped = false;

    try {
      const res = await fetch(dataUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      ({ groups, isGrouped } = normalizeData(raw));
    } catch (err) {
      console.error(`Failed to load gallery data from ${dataUrl}:`, err);
      grid.innerHTML = `
        <p class="gallery-empty-state">
          This gallery couldn't be loaded right now. Please try again later.
        </p>`;
      return;
    }

    const groupKeys = Object.keys(groups);
    if (groupKeys.length === 0) {
      grid.innerHTML = '<p class="gallery-empty-state">No items available yet.</p>';
      return;
    }

    if (isGrouped && yearBtnsContainer) {
      renderYearButtons(groupKeys);
    }
    loadGroup(groupKeys[0]);

    /**
     * Normalizes the fetched JSON into a uniform { groups, isGrouped } shape,
     * so the rest of the module never needs to know which authoring format
     * the data file used.
     */
    function normalizeData(raw) {
      if (Array.isArray(raw)) {
        return { groups: { [FLAT_GROUP_KEY]: raw.map(normalizeItem) }, isGrouped: false };
      }
      const grouped = {};
      Object.keys(raw).forEach((key) => {
        grouped[key] = (raw[key] || []).map(normalizeItem);
      });
      return { groups: grouped, isGrouped: true };
    }

    /** A bare string becomes { src }; an object passes through with its fields intact. */
    function normalizeItem(item) {
      return typeof item === 'string' ? { src: item } : item;
    }

    /** An item is "captioned" if it carries any human-readable metadata beyond the image itself. */
    function hasCaption(item) {
      return Boolean(item.title || item.date || item.desc);
    }

    /** Build the year filter buttons from the data's own keys — no hardcoding, can't drift out of sync. */
    function renderYearButtons(groupKeyList) {
      yearBtnsContainer.innerHTML = '';
      groupKeyList.forEach((key, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn' + (idx === 0 ? ' active' : '');
        btn.textContent = key;
        btn.dataset.group = key;
        btn.addEventListener('click', () => {
          yearBtnsContainer
            .querySelectorAll('.btn')
            .forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          loadGroup(key);
        });
        yearBtnsContainer.appendChild(btn);
      });
    }

    /** Render the grid for a given group key, choosing thumbnail or card markup per item. */
    function loadGroup(groupKey) {
      activeGroup = groupKey;
      const items = groups[groupKey] || [];

      grid.innerHTML = '';

      if (items.length === 0) {
        grid.innerHTML = '<p class="gallery-empty-state">No items for this selection.</p>';
        return;
      }

      items.forEach((item, idx) => {
        const alt = item.alt || `${altTextPrefix} ${idx + 1} of ${items.length}`;
        const tile = hasCaption(item)
          ? buildCardTile(item, alt)
          : buildThumbnailTile(item, alt);

        const openThisItem = () => openLightbox(idx);
        const trigger = tile.querySelector('[data-lightbox-trigger]');
        trigger.addEventListener('click', openThisItem);
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openThisItem();
          }
        });

        grid.appendChild(tile);
      });
    }

    /** Plain thumbnail tile — used by the news/scholarship galleries. */
    function buildThumbnailTile(item, alt) {
      const wrapper = document.createElement('div');
      wrapper.className = 'gallery-thumb-tile';
      wrapper.innerHTML = `
        <img src="${item.src}" alt="${escapeHtml(alt)}" loading="lazy"
             class="gallery-thumb-tile__img"
             tabindex="0" role="button" data-lightbox-trigger>`;
      return wrapper;
    }

    /** Captioned card tile — used by the awards gallery. */
    function buildCardTile(item, alt) {
      const wrapper = document.createElement('div');
      wrapper.className = 'gallery-card-tile';
      wrapper.innerHTML = `
        <img src="${item.src}" alt="${escapeHtml(alt)}" loading="lazy"
             class="gallery-card-tile__img"
             tabindex="0" role="button" data-lightbox-trigger>
        <div class="gallery-card-tile__body">
          ${item.title ? `<p class="gallery-card-tile__title">${escapeHtml(item.title)}</p>` : ''}
          ${item.date ? `<p class="gallery-card-tile__date">${escapeHtml(item.date)}</p>` : ''}
          ${item.desc ? `<p class="gallery-card-tile__desc">${escapeHtml(item.desc)}</p>` : ''}
        </div>`;
      return wrapper;
    }

    /** Build carousel slides for the active group and open the modal at `startIndex`. */
    function openLightbox(startIndex) {
      const items = groups[activeGroup] || [];
      carouselInner.innerHTML = '';

      items.forEach((item, idx) => {
        const alt = item.alt || `${altTextPrefix} ${idx + 1} of ${items.length}`;
        const slide = document.createElement('div');
        slide.className = 'carousel-item' + (idx === startIndex ? ' active' : '');
        slide.innerHTML = `<img src="${item.src}" class="d-block w-100" alt="${escapeHtml(alt)}">`;
        carouselInner.appendChild(slide);
      });

      modal.show();
      bootstrap.Carousel.getOrCreateInstance(modalEl.querySelector('.carousel')).to(startIndex);
    }

    /** Minimal HTML-escaping for text sourced from JSON. */
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }

  global.initGalleryPage = initGalleryPage;
})(window);