// public/js/categories.js
document.addEventListener('DOMContentLoaded', () => {
  const extraCats = document.querySelectorAll('.extra-cat');
  const btn       = document.getElementById('toggleCategories');
  if (!btn) return;                       // no toggle needed when few cats

  btn.addEventListener('click', () => {
    const isOpen = extraCats[0].classList.contains('show');
    extraCats.forEach(el => {
      if (isOpen) {
        el.classList.remove('show');      // slide‑up
      } else {
        el.classList.add('show');         // slide‑down
      }
    });
    btn.textContent = isOpen ? 'View More' : 'View Less';
  });
});
