 // Shrink navbar logo on scroll
  /* window.addEventListener('scroll', function() {
  const header = document.querySelector('.header-wrapper');
  if(window.scrollY > 40) {   // threshold equals top bar height
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}); */
  // Counter animation for "Our Impact"
  document.addEventListener("DOMContentLoaded", function(){
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
  });
 
 document.querySelectorAll('.dropdown-submenu > a').forEach(el => {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    let submenu = this.nextElementSibling;
    if (submenu.classList.contains('show')) {
      submenu.classList.remove('show');
    } else {
      // Close other open submenus
      this.closest('.dropdown-menu').querySelectorAll('.show').forEach(menu => menu.classList.remove('show'));
      submenu.classList.add('show');
    }
  });
});

 
 const swiper = new Swiper('.success-stories-swiper', {
  slidesPerView: 3,       // Show 3 cards per view
  spaceBetween: 30,       // Space between cards
  loop: true,             // Infinite loop of slides
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    320: { slidesPerView: 1, spaceBetween: 10 },   // Small devices: 1 card
    768: { slidesPerView: 2, spaceBetween: 20 },   // Medium devices: 2 cards
    992: { slidesPerView: 3, spaceBetween: 30 },   // Desktop: 3 cards
  },
});

window.addEventListener('load', () => {
  swiper.update();
});


const testimonialsSwiper = new Swiper('.testimonials-swiper', {
  slidesPerView: 3,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    320: { slidesPerView: 1, spaceBetween: 10 },
    768: { slidesPerView: 2, spaceBetween: 20 },
    992: { slidesPerView: 3, spaceBetween: 30 },
  },
});

document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth >= 992) {
    const dropdowns = document.querySelectorAll('.navbar .dropdown');

    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('mouseenter', function () {
        this.classList.add('show');
        const menu = this.querySelector('.dropdown-menu');
        menu.classList.add('show');
      });

      dropdown.addEventListener('mouseleave', function () {
        this.classList.remove('show');
        const menu = this.querySelector('.dropdown-menu');
        menu.classList.remove('show');
      });
    });
  }
});


