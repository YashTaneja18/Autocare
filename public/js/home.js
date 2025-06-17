// public/js/home.js
(function () {
  // Simple slider for "Current Offers"
  let index = 0;
  const sets = document.querySelectorAll('.offer-set');
  const totalSets = Math.ceil(sets.length / 2); // 2 images per slide on mobile

  function showSets() {
    sets.forEach((el, i) => {
      el.classList.toggle('show',
        i >= index * 2 && i < (index + 1) * 2
      );
    });
  }

  // Initial display
  showSets();

  document.getElementById('nextOffer').addEventListener('click', () => {
    index = (index + 1) % totalSets;
    showSets();
  });

  document.getElementById('prevOffer').addEventListener('click', () => {
    index = (index - 1 + totalSets) % totalSets;
    showSets();
  });
})();

// public/js/home for dynamic display at the start
(function () {
  const nameEl  = document.getElementById('prodName');
  const priceEl = document.getElementById('prodPrice');
  const descEl  = document.getElementById('prodDesc');

  function updateDetails(activeImg) {
    nameEl.textContent  = activeImg.dataset.name;
    priceEl.textContent = `₹ ${Number(activeImg.dataset.price).toLocaleString()}`;
    descEl.textContent  = activeImg.dataset.desc;
  }

  const carousel = document.getElementById('heroCarousel');
  const firstImg = carousel.querySelector('.carousel-item.active img');
  if (firstImg) updateDetails(firstImg);  // show details for first image

  carousel.addEventListener('slide.bs.carousel', e => {
    const nextImg = e.relatedTarget.querySelector('img');
    updateDetails(nextImg);
  });
})();

