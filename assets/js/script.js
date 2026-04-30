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
 
document.getElementById("galleryModal")
  .addEventListener("click", function(e){

    if(e.target === this){
      closeGallery();
    }

}); 
 
// For image gallery - stats section
const galleries = {
	  img1: [
    "/assets/images/chart1.png"
  ],

  img2: [
    "/assets/images/chart2.png"
  ],

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

function openGallery(type) {

  const images = galleries[type];

  // Safety check
  if (!images || images.length === 0) {
    console.error("Gallery not found:", type);
    return;
  }

  const modal = document.getElementById("galleryModal");
  const wrapper = document.getElementById("galleryWrapper");

  wrapper.innerHTML = "";

  images.forEach(img => {

    wrapper.innerHTML += `
      <div class="swiper-slide">
        <img src="${img}" alt="">
      </div>
    `;

  });

  modal.classList.add("active");

  // destroy old swiper first
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

function closeGallery() {

  document.getElementById("galleryModal")
    .classList.remove("active");

  document.body.style.overflow = "auto";

  if (gallerySwiper) {
    gallerySwiper.destroy(true, true);
    gallerySwiper = null;
  }
}


/*This section for closing gallery modal even when someone click outside image area*/
const galleryModal = document.getElementById("galleryModal");

galleryModal.addEventListener("click", function(e) {

  // if clicked outside actual swiper container
  if (!e.target.closest(".gallery-swiper")) {
    closeGallery();
  }

});

//


// For Success Stories Swiper
document.addEventListener("DOMContentLoaded", function () {
  const swiper = new Swiper('.success-stories-swiper', {
    slidesPerView: 3,
    slidesPerGroup: 1,
    spaceBetween: 30,
    loop: true,

    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    breakpoints: {
      320: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      992: { slidesPerView: 3 },
    },
  });
});




const testimonialsSwiper = new Swiper('.testimonials-swiper', {
  slidesPerView: 3,
  spaceBetween: 30,
  loop: true,
  
  autoplay: {
    delay: 4000,          // 4 seconds per slide
    disableOnInteraction: false, // continue autoplay after manual swipe
	pauseOnMouseEnter: true,   // ✅ pauses when mouse enters, resumes on leave

  },

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

  function handleDesktopDropdowns() {
    const dropdowns = document.querySelectorAll('.navbar .dropdown');

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

  handleDesktopDropdowns();

  window.addEventListener('resize', handleDesktopDropdowns);
});


/* BackToTop Button*/
window.addEventListener("load", function () {

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

});