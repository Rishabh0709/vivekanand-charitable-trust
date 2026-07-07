/* ==========================================================================
   script.js — Swami Vivekanand Students' Welfare Charitable Trust
   Site-wide behavior shared across every page.
   Load order: script.js → stats.js (if present) → page-specific inline scripts
   ========================================================================== */


/* ---------------------------------------------------------
   BACK TO TOP BUTTON
   Call this once, after footer.html has been injected.
--------------------------------------------------------- */
function initBackToTop() {
  const backBtn = document.getElementById('backToTopBtn');
  if (!backBtn) return;

  // Guard against double-initialization if loadHTML's callback
  // ever fires more than once for the same element.
  if (backBtn.dataset.initialized === 'true') return;
  backBtn.dataset.initialized = 'true';

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backBtn.classList.add('show');
    } else {
      backBtn.classList.remove('show');
    }
  });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // In case the page is already scrolled on load (e.g. anchor-link
  // navigation, or a reload mid-page), set the initial state correctly
  // instead of waiting for the next scroll event.
  if (window.scrollY > 300) {
    backBtn.classList.add('show');
  }
}


/* ---------------------------------------------------------
   HEADER SUBMENU (nested dropdown support, e.g. "Torch Bearers")
--------------------------------------------------------- */
function initHeaderSubmenu() {
  document.querySelectorAll('.submenu-toggle').forEach((toggle) => {
    function toggleSubmenu(e) {
      e.preventDefault();
      e.stopPropagation();

      const parent = toggle.parentElement;
      const submenu = toggle.nextElementSibling;
      const isOpen = parent.classList.contains('show');

      document.querySelectorAll('.dropdown-submenu').forEach((item) => {
        if (item !== parent) {
          item.classList.remove('show');
          item.querySelector('.dropdown-menu')?.classList.remove('show');
          item.querySelector('.submenu-toggle')?.setAttribute('aria-expanded', 'false');
        }
      });

      parent.classList.toggle('show');
      submenu.classList.toggle('show');
      toggle.setAttribute('aria-expanded', String(!isOpen));
    }

    toggle.addEventListener('click', toggleSubmenu);
  });
}


/* ---------------------------------------------------------
   PARTIAL LOADER
   Fetches an HTML fragment (header.html / footer.html) into a
   placeholder element, then runs an optional callback only after
   innerHTML has actually been set — this is what lets initHeaderSubmenu
   and initBackToTop reliably attach to elements that don't exist yet
   at page-load time.

   USAGE (identical on every page):

     <script>
       loadHTML('header-placeholder', 'header.html', initHeaderSubmenu);
       loadHTML('footer-placeholder', 'footer.html', initBackToTop);
     </script>

   Do NOT keep a second, page-local loadHTML() definition once this one
   is loaded — some pages still do; that cleanup is tracked separately.
--------------------------------------------------------- */
async function loadHTML(id, url, callback) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    document.getElementById(id).innerHTML = text;
    if (typeof callback === 'function') callback();
  } catch (error) {
    console.error(`Failed to load ${url}:`, error);
  }
}


/* ==========================================================================
   SWIPER CAROUSEL FACTORY
   -----------------------------------------------------------------------
   Single source of truth for every Swiper instance on the site. Replaces
   duplicated, hand-typed Swiper() config blocks (previously one per
   carousel, able to drift out of sync with each other).

   Guards against Swiper's own loop-mode requirement: loop needs at least
   2 × the largest slidesPerView in *real* slides, or its internal slide-
   cloning math comes out uneven — producing jumpy widths, or a single
   oversized/mis-cropped slide. This can surface at page load, or later,
   whenever anything on the page (async content, image loads, font
   swaps) causes Swiper's built-in ResizeObserver to recalculate.

   Rather than trust every future content edit to remember that
   constraint, this factory checks the real slide count itself and
   disables loop when it isn't safe, instead of silently shipping a
   carousel that can break later.
   ========================================================================== */

const SWIPER_DEFAULTS = {
  spaceBetween: 30,
  rewind: true,
  pagination: { el: '.swiper-pagination', clickable: true },
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  breakpoints: {
    320: { slidesPerView: 1, spaceBetween: 10 },
    768: { slidesPerView: 2, spaceBetween: 20 },
    992: { slidesPerView: 3, spaceBetween: 30 },
  },
};

/**
 * Initializes a Swiper carousel with shared defaults, deep-merging any
 * per-instance overrides.
 *
 * NAVIGATION STRATEGY — rewind by default, loop as an explicit opt-in:
 *
 * Swiper offers two ways to make a carousel feel "infinite":
 *   - loop:true    clones slides at both ends for seamless wrap-around,
 *                  but REQUIRES at least 2 × slidesPerView real slides or
 *                  its clone math comes out uneven — producing distorted,
 *                  wrongly-sized slides. This bit us once already.
 *   - rewind:true  simply jumps back to slide 1 after the last slide, with
 *                  no cloning and no slide-count requirement. Nav arrows
 *                  never disable, matching the "always advances" feel the
 *                  site wants, without the distortion risk.
 *
 * Rewind is the safer default for every carousel on this site regardless
 * of how many slides a section currently has, so this fixes the bug class
 * permanently rather than for today's slide counts only. True loop mode
 * can still be requested explicitly (`loop: true` in overrides) for a
 * carousel with plenty of slides where seamless-wrap animation is
 * specifically wanted — the same slide-count safety check still guards
 * that path so it can't reintroduce the distortion bug.
 *
 * @param {string} selector       CSS selector for the swiper container.
 * @param {Object} [overrides={}] Per-instance config, merged over SWIPER_DEFAULTS.
 * @returns {Swiper|null}         The Swiper instance, or null if the
 *                                container isn't present on this page.
 */
function initSwiperCarousel(selector, overrides = {}) {
  const container = document.querySelector(selector);
  if (!container) return null;

  const breakpoints = { ...SWIPER_DEFAULTS.breakpoints, ...(overrides.breakpoints || {}) };
  const config = { ...SWIPER_DEFAULTS, ...overrides, breakpoints };

  if (overrides.loop === true) {
    const slideCount = container.querySelectorAll('.swiper-slide').length;
    const maxSlidesPerView = Math.max(...Object.values(breakpoints).map((bp) => bp.slidesPerView || 1));
    const canLoopSafely = slideCount >= maxSlidesPerView * 2;

    if (!canLoopSafely) {
      console.warn(
        `initSwiperCarousel: "${selector}" requested loop:true with ${slideCount} slide(s), ` +
        `but needs at least ${maxSlidesPerView * 2} for its widest breakpoint (${maxSlidesPerView}-up). ` +
        `Falling back to rewind mode instead, so navigation still works without distortion.`
      );
      config.loop = false;
      config.rewind = true;
    }
  }

  return new Swiper(selector, config);
}


/* ==========================================================================
   EXPANDABLE CONTENT (progressive disclosure)
   -----------------------------------------------------------------------
   Generic "show more / show less" utility for any collapsible section
   driven by a max-height CSS transition. Replaces bespoke, page-local
   toggle scripts (e.g. a page's own toggleInspiration()-style function)
   with one shared, accessible implementation.

   MARKUP CONTRACT:
     <button class="expandable-toggle"
             data-expandable-target="some-id"
             data-expandable-label-more="Read More ↓"
             data-expandable-label-less="Show Less ↑">
       Read More ↓
     </button>
     ...
     <div id="some-id" class="inspiration-more"> ... </div>

   The target's own CSS handles the collapsed/expanded look (max-height:0
   by default; an "expanded" class — or whatever class name the target
   already uses — grows it). This utility only handles:
     - toggling that class
     - keeping aria-expanded / aria-controls correct for screen readers
     - using `inert` so keyboard/AT users can never tab into content
       that's still visually clipped, instead of just hiding it from sight

   data-expandable-class lets a page reuse its own existing class name
   (e.g. "expanded", "show") instead of forcing a new one.
   ========================================================================== */
function initExpandable(toggleSelector) {
  document.querySelectorAll(toggleSelector).forEach((btn) => {
    const targetId = btn.dataset.expandableTarget;
    const target = targetId
      ? document.getElementById(targetId)
      : btn.parentElement.querySelector('.expandable-content, .founder-full, .inspiration-more');

    if (!target) {
      console.warn('initExpandable: no matching target found for', btn);
      return;
    }

    const expandedClass = btn.dataset.expandableClass || 'expanded';
    const moreLabel = btn.dataset.expandableLabelMore || btn.textContent.trim();
    const lessLabel = btn.dataset.expandableLabelLess || 'Show Less ↑';

    // Collapsed by default: remove the region from the tab order and the
    // accessibility tree entirely, rather than leaving it focusable-but-
    // invisible behind a max-height:0 clip.
    target.inert = true;
    btn.setAttribute('aria-expanded', 'false');
    if (targetId) btn.setAttribute('aria-controls', targetId);

    btn.addEventListener('click', () => {
      const isExpanding = !target.classList.contains(expandedClass);
      target.classList.toggle(expandedClass, isExpanding);
      target.inert = !isExpanding;
      btn.setAttribute('aria-expanded', String(isExpanding));
      btn.textContent = isExpanding ? lessLabel : moreLabel;
    });
  });
}


/* ==========================================================================
   DOM-DEPENDENT PAGE COMPONENTS (wrapped safely)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* ── Legacy counter animation ──────────────────────────────────────────
     For any remaining elements using the old data-count contract
     (kept for backward compatibility — new counters should use
     data-stat-counter, driven by stats.js, instead). */
  function animateCounter(el) {
    const end = +el.getAttribute('data-count');
    let start = 0;
    const step = Math.ceil(end / 80);
    function tick() {
      start += step;
      if (start > end) start = end;
      el.innerText = start.toLocaleString();
      if (start < end) requestAnimationFrame(tick);
      else el.innerText = end.toLocaleString();
    }
    tick();
  }
  document.querySelectorAll('.impact-counter').forEach(animateCounter);


  /* ── Gallery modal (chart/list lightbox on index.html) ────────────────── */
  const galleryModal = document.getElementById('galleryModal');
  if (galleryModal) {
    galleryModal.addEventListener('click', function (e) {
      if (e.target === this || !e.target.closest('.gallery-swiper')) {
        closeGallery();
      }
    });
  }


  /* ── Carousels — single factory, so a fix or config change here
       covers every carousel on the site at once ─────────────────────────── */
  const swiperInstances = [
    initSwiperCarousel('.success-stories-swiper', {
      slidesPerGroup: 1,
      autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
    }),
    initSwiperCarousel('.testimonials-swiper', {
      autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true },
    }),
  ].filter(Boolean); // drop nulls for pages missing one of these carousels

  /* If stats.js is present on this page, it populates stat text and
     animated counters asynchronously (after a fetch() resolves). That
     DOM mutation can happen after Swiper has already measured slide
     widths, and Swiper's own ResizeObserver may recalculate as a
     result. Explicitly telling every active Swiper instance to
     re-measure once stats finish loading makes that interaction
     intentional instead of accidental. Safe to leave in place even on
     pages that don't load stats.js — the event simply never fires. */
  document.addEventListener('stats:loaded', () => {
    swiperInstances.forEach((swiper) => swiper.update());
  });

  // Handle dropdown setups on resize tracking
  window.addEventListener('resize', handleDesktopDropdowns);
  handleDesktopDropdowns();
});


/* ==========================================================================
   SHARED GLOBAL MECHANICS & DATA OBJECTS
   ========================================================================== */

// Global Nav Dropdown Adjustments
function handleDesktopDropdowns() {
  const dropdowns = document.querySelectorAll('.navbar .dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove('show');
    dropdown.onmouseenter = null;
    dropdown.onmouseleave = null;
  });

  if (window.innerWidth >= 992) {
    dropdowns.forEach((dropdown) => {
      dropdown.addEventListener('mouseenter', function () {
        this.classList.add('show');
        this.querySelector('.dropdown-menu')?.classList.add('show');
      });

      dropdown.addEventListener('mouseleave', function () {
        this.classList.remove('show');
        this.querySelector('.dropdown-menu')?.classList.remove('show');
      });
    });
  }
}

// Media Image Database Matrix (index.html stats → gallery modal)
const galleries = {
  img1: ['/assets/images/chart1.png'],
  img2: ['/assets/images/chart2.png'],
  schools: [
    '/assets/images/school_list1.PNG',
    '/assets/images/school_list2.PNG',
    '/assets/images/school_list3.PNG',
    '/assets/images/school_list4.PNG',
  ],
  colleges: [
    '/assets/images/college_list1.PNG',
    '/assets/images/college_list2.PNG',
  ],
};

let gallerySwiper;

// Open Gallery Pipeline
function openGallery(type) {
  const images = galleries[type];
  if (!images || images.length === 0) {
    console.error('Gallery not found:', type);
    return;
  }

  const modal = document.getElementById('galleryModal');
  const wrapper = document.getElementById('galleryWrapper');
  if (!modal || !wrapper) return;

  wrapper.innerHTML = '';
  images.forEach((img) => {
    wrapper.innerHTML += `
      <div class="swiper-slide">
        <img src="${img}" alt="">
      </div>
    `;
  });

  modal.classList.add('active');

  if (gallerySwiper) {
    gallerySwiper.destroy(true, true);
  }

  gallerySwiper = new Swiper('.gallery-swiper', {
    loop: images.length > 1,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  document.body.style.overflow = 'hidden';
}

// Close Gallery Pipeline
function closeGallery() {
  const modal = document.getElementById('galleryModal');
  if (modal) modal.classList.remove('active');

  document.body.style.overflow = 'auto';

  if (gallerySwiper) {
    gallerySwiper.destroy(true, true);
    gallerySwiper = null;
  }
}