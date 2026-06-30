
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
   HEADER SUBMENU (if/when the nested "Torch Bearers" submenu
   pattern is reintroduced anywhere — kept here as the single
   place such logic should live, never inside header.html itself)
--------------------------------------------------------- */
/* ==========================================================================
   Dynamic Partials Loader Engine
   ========================================================================== */

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
   PARTIAL LOADER  (replaces the loadHTML() copy-pasted at the
   bottom of every page). Accepts an optional callback that
   fires only after innerHTML has actually been set — this is
   what was missing before, and why "fixes" inside header.html /
   footer.html's own <script> tags never ran.
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


/* ---------------------------------------------------------
   USAGE — replace the per-page loader block at the bottom of
   every HTML file with this:

   <script>
     loadHTML('header-placeholder', 'header.html', initHeaderSubmenu);
     loadHTML('footer-placeholder', 'footer.html', initBackToTop);
   </script>

   Do NOT keep a second, page-local loadHTML() definition once
   this one is in script.js — having two definitions of the same
   function name is harmless (the later one wins) but confusing
   and worth cleaning up across all 38 pages as part of the wider
   consolidation already tracked in the site audit.
--------------------------------------------------------- */

/* ==========================================================================
   2. DOM-Dependent Page Components (Wrapped Safely)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function() {
  
  // Counter animation for "Our Impact"
  function animateCounter(el) {
    let end = +el.getAttribute('data-count');
    let start = 0;
    let step = Math.ceil(end/80);
    function tick() {
      start += step;
      if(start > end) start = end;
      el.innerText = start.toLocaleString();
      if(start < end) requestAnimationFrame(tick);
      else el.innerText = end.toLocaleString();
    }
    tick();
  }
  document.querySelectorAll('.impact-counter').forEach(animateCounter);

  // SAFE GUARD: Gallery Modal Structural Verification
  const galleryModal = document.getElementById("galleryModal");
  if (galleryModal) {
    galleryModal.addEventListener("click", function(e) {
      if(e.target === this || !e.target.closest(".gallery-swiper")){
        closeGallery();
      }
    });
  }

  // SAFE GUARD: Success Stories Swiper Initialization
  if (document.querySelector('.success-stories-swiper')) {
    new Swiper('.success-stories-swiper', {
      slidesPerView: 3,
      slidesPerGroup: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: {
        320: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        992: { slidesPerView: 3 },
      },
    });
  }

  // SAFE GUARD: Testimonials Swiper Initialization
  if (document.querySelector('.testimonials-swiper')) {
    new Swiper('.testimonials-swiper', {
      slidesPerView: 3,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: {
        320: { slidesPerView: 1, spaceBetween: 10 },
        768: { slidesPerView: 2, spaceBetween: 20 },
        992: { slidesPerView: 3, spaceBetween: 30 },
      },
    });
  }

  // Handle dropdown setups on resize tracking
  window.addEventListener('resize', handleDesktopDropdowns);
});


/* ==========================================================================
   3. Shared Global Mechanics & Data Objects
   ========================================================================== */

// Global Nav Dropdown Adjustments
function handleDesktopDropdowns() {
  const dropdowns = document.querySelectorAll('.navbar .dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach(dropdown => {
    dropdown.classList.remove('show');
    dropdown.onmouseenter = null;
    dropdown.onmouseleave = null;
  });

  if (window.innerWidth >= 992) {
    dropdowns.forEach(dropdown => {
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

// Media Image Database Matrix
const galleries = {
  img1: ["/assets/images/chart1.png"],
  img2: ["/assets/images/chart2.png"],
  schools: [
    "/assets/images/school_list1.PNG",
    "/assets/images/school_list2.PNG",
    "/assets/images/school_list3.PNG",
    "/assets/images/school_list4.PNG"
  ],
  colleges: [
    "/assets/images/college_list1.PNG",
    "/assets/images/college_list2.PNG"
  ]
};

let gallerySwiper;

// Open Gallery Pipeline
function openGallery(type) {
  const images = galleries[type];
  if (!images || images.length === 0) {
    console.error("Gallery not found:", type);
    return;
  }

  const modal = document.getElementById("galleryModal");
  const wrapper = document.getElementById("galleryWrapper");
  if (!modal || !wrapper) return;

  wrapper.innerHTML = "";
  images.forEach(img => {
    wrapper.innerHTML += `
      <div class="swiper-slide">
        <img src="${img}" alt="">
      </div>
    `;
  });

  modal.classList.add("active");

  if (gallerySwiper) {
    gallerySwiper.destroy(true, true);
  }

  gallerySwiper = new Swiper(".gallery-swiper", {
    loop: images.length > 1,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  document.body.style.overflow = "hidden";
}

// Close Gallery Pipeline
function closeGallery() {
  const modal = document.getElementById("galleryModal");
  if (modal) modal.classList.remove("active");

  document.body.style.overflow = "auto";

  if (gallerySwiper) {
    gallerySwiper.destroy(true, true);
    gallerySwiper = null;
  }
}