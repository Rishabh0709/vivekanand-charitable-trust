/**
 * pdf-grid.js
 * -----------------------------------------------------------------------
 * Reusable, data-driven "grid of downloadable PDF documents" component.
 * Powers balance_sheet.html, certificates.html, and scholarship_certificate.html
 * (and any future PDF-listing page) from a single implementation.
 *
 * Data contract (JSON): an array of document objects, in display order —
 *
 *   [
 *     { "label": "2023-24", "href": "/assets/docs/financials/2023-24.pdf" },
 *     { "label": "12A Certificate", "href": "/assets/docs/12A.pdf", "filename": "12A.pdf" }
 *   ]
 *
 * A document can optionally be marked `"featured": true` to render in a
 * visually separated row below the main grid (used for the scholarship
 * summary PDF, which spans all years rather than belonging to one).
 *
 * Usage:
 *
 *   initPdfGrid({
 *     dataUrl:     '/assets/json/financial-reports.json',
 *     containerId: 'pdf-grid',
 *     colClasses:  'col-6 col-sm-4 col-md-3 col-lg-2',
 *     ariaLabel:   'Financial reports by year',
 *   });
 * -----------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  /**
   * @param {Object} config
   * @param {string} config.dataUrl        URL of the JSON data file.
   * @param {string} config.containerId    id of the container <div> (should already carry `.row`).
   * @param {string} [config.colClasses]   Bootstrap column classes applied to each tile's wrapper.
   *                                       Defaults to a 2/3/4-per-row responsive layout.
   * @param {string} [config.ariaLabel='Downloadable documents'] Accessible label for the grid region.
   */
  async function initPdfGrid(config) {
    const {
      dataUrl,
      containerId,
      colClasses = 'col-6 col-sm-4 col-md-3 col-lg-2',
      ariaLabel = 'Downloadable documents',
    } = config;

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`initPdfGrid: container #${containerId} not found in DOM.`);
      return;
    }

    container.setAttribute('role', 'list');
    container.setAttribute('aria-label', ariaLabel);

    let documents = [];
    try {
      const res = await fetch(dataUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      documents = await res.json();
    } catch (err) {
      console.error(`Failed to load PDF list from ${dataUrl}:`, err);
      container.innerHTML = `
        <p class="pdf-grid-empty-state">
          These documents couldn't be loaded right now. Please try again later.
        </p>`;
      return;
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      container.innerHTML = '<p class="pdf-grid-empty-state">No documents available yet.</p>';
      return;
    }

    const standardDocs = documents.filter((doc) => !doc.featured);
    const featuredDocs = documents.filter((doc) => doc.featured);

    container.innerHTML = standardDocs.map((doc) => renderTile(doc, colClasses)).join('');

    if (featuredDocs.length > 0) {
      const featuredWrap = document.createElement('div');
      featuredWrap.className = 'row justify-content-center pdf-featured-row';
      featuredWrap.setAttribute('role', 'list');
      featuredWrap.innerHTML = featuredDocs
        .map((doc) => renderTile(doc, 'col-12 col-sm-8 col-md-6'))
        .join('');
      container.insertAdjacentElement('afterend', featuredWrap);
    }
  }

  /**
   * @param {{label: string, href: string, filename?: string}} doc
   * @param {string} colClasses
   * @returns {string} HTML markup for one PDF tile.
   */
  function renderTile(doc, colClasses) {
    const filename = doc.filename || doc.href.split('/').pop();
    const safeLabel = escapeHtml(doc.label);
	// Falls back to the visible label if no richer description is supplied —
  // so existing JSON files keep working unchanged.
  const safeAria = escapeHtml(doc.ariaLabel || doc.label);

    return `
      <div class="${colClasses} text-center mb-4" role="listitem">
        <a href="${doc.href}"
           download="${filename}"
           class="pdf-download d-block"
           aria-label="Download ${safeAria} (PDF)">
          <i class="fas fa-file-pdf pdf-icon" aria-hidden="true"></i>
          <span class="pdf-caption">${safeLabel}</span>
        </a>
      </div>`;
  }

  /** Minimal HTML-escaping for label text sourced from JSON. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  global.initPdfGrid = initPdfGrid;
})(window);