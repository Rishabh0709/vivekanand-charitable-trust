/* ==========================================================================
   1. Dynamic Partials Loader Engine
   ========================================================================== */

// For header/submenu toggle on mobile
function initHeaderSubmenu() {
  document.querySelectorAll(".submenu-toggle").forEach(toggle => {
    toggle.addEventListener("click", e => { /* existing logic */ });
  });
  // Safely trigger desktop navbar tracking logic once loaded
  handleDesktopDropdowns();
}

// Fixed Back-to-Top initializer running strictly AFTER footer insertion
function initBackToTop() { 
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// Asynchronous layout patcher
async function loadHTML(id, url, callback) {
  try {
    const placeholder = document.getElementById(id);
    if (!placeholder) return; // Guard clause if placeholder isn't present
    
    const res = await fetch(url);
    placeholder.innerHTML = await res.text();
    callback?.();
  } catch (err) { 
    console.error(`Failed to load ${url}:`, err); 
  }
}

// Initialize components
loadHTML('header-placeholder', 'header.html', initHeaderSubmenu);
loadHTML('footer-placeholder', 'footer.html', initBackToTop);


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