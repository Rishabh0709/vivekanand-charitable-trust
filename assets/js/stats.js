/**
 * stats.js
 * -----------------------------------------------------------------------
 * Single source of truth for every numeric fact on the site (girls
 * supported, scholarship amount, schools, colleges, etc.).
 *
 * HOW IT WORKS
 * Any element, anywhere on the site, can request a stat by adding a
 * data-stat attribute matching a key in trust-stats.json:
 *
 *   <span data-stat="colleges"></span>
 *   <!-- becomes -->
 *   <span data-stat="colleges">32</span>
 *
 * Formatting is controlled by an optional data-stat-format attribute:
 *
 *   data-stat-format="number"    → 37,564                (default)
 *   data-stat-format="cr"        → ₹4.51 Cr
 *   data-stat-format="plain"     → 4.51                   (no commas/symbols)
 *
 * Prose sentences embed the same span inline — no template engine needed:
 *
 *   <p>Supporting girls across
 *      <span data-stat="schools"></span> schools and
 *      <span data-stat="colleges"></span> colleges.</p>
 *
 * ANIMATED COUNTERS (index.html-style "count up" stat blocks) opt in with
 * data-stat-counter instead of a bare data-stat — this sets the target
 * dynamically from JSON and animates it into view via IntersectionObserver,
 * replacing the old hardcoded data-target="37564" pattern:
 *
 *   <h2 class="counter" data-stat-counter="girlsSupported"></h2>
 *
 * "As of" date: any element with data-stat="asOf" gets a formatted date
 * string, e.g. for a footer note like:
 *   <p>Figures last verified <span data-stat="asOf"></span>.</p>
 * -----------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  const DATA_URL = '/assets/json/trust-stats.json';

  // Cached promise so multiple calls (or multiple pages sharing this file
  // via partials) only ever fetch the JSON once per page load.
  let statsPromise = null;

  function fetchStats() {
    if (!statsPromise) {
      statsPromise = fetch(DATA_URL)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .catch((err) => {
          console.error(`Failed to load trust stats from ${DATA_URL}:`, err);
          return null;
        });
    }
    return statsPromise;
  }

  /** Formats a raw stat value according to the requested format. */
  function formatStat(key, value, format) {
    if (key === 'asOf') {
      return new Date(value).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    }
    switch (format) {
      case 'cr':
        return `₹${value} Cr`;
      case 'plain':
        return String(value);
      case 'number':
      default:
        return value.toLocaleString('en-IN');
    }
  }

  /** Populates every static (non-animated) data-stat element on the page. */
  function populateStaticStats(stats) {
    document.querySelectorAll('[data-stat]').forEach((el) => {
      const key = el.dataset.stat;
      if (!(key in stats)) {
        console.warn(`stats.js: unknown stat key "${key}" on`, el);
        return;
      }
      const format = el.dataset.statFormat || 'number';
      el.textContent = formatStat(key, stats[key], format);
    });
  }

  /** Wires up animated count-up stats, driven by JSON instead of hardcoded data-target. */
  function populateCounterStats(stats) {
    const counters = document.querySelectorAll('[data-stat-counter]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const key = el.dataset.statCounter;
        const target = stats[key];
        if (typeof target !== 'number') {
          console.warn(`stats.js: unknown or non-numeric stat "${key}" for counter on`, el);
          return;
        }
        animateCounter(el, target);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => observer.observe(el));
  }

  /** Counts up to `target`, formatting each frame like the final value. */
  function animateCounter(el, target) {
    const isDecimal = !Number.isInteger(target);
    const duration = 1400; // ms
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = target * progress;
      el.textContent = isDecimal
        ? current.toFixed(2)
        : Math.floor(current).toLocaleString('en-IN');
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = isDecimal ? target.toFixed(2) : target.toLocaleString('en-IN');
      }
    }
    requestAnimationFrame(tick);
  }

  async function initStats() {
    const stats = await fetchStats();
    if (!stats) return; // fetchStats already logged the error; fail quietly on-page
    populateStaticStats(stats);
    populateCounterStats(stats);
	document.dispatchEvent(new CustomEvent('stats:loaded'));
  }

  document.addEventListener('DOMContentLoaded', initStats);

  // Exposed for pages that inject stats-bearing HTML *after* DOMContentLoaded
  // (e.g. into a modal or a partial loaded via loadHTML()).
  global.refreshStats = initStats;
})(window);