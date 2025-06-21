/* global showToast */                 // if ESLint
document.addEventListener('DOMContentLoaded', () => {
  const input  = document.getElementById('searchInput');
  const list   = document.getElementById('searchResults');

  if (!input || !list) return;

  /* --- helpers --- */
  const hide = () => list.classList.add('d-none');
  const show = () => list.classList.remove('d-none');
  hide();

  // Close on click outside
  document.addEventListener('click', e => {
    if (!list.contains(e.target) && e.target !== input) hide();
  });

  // Debounce
  let timer;
  input.addEventListener('input', e => {
    const q = e.target.value.trim();
    clearTimeout(timer);
    if (q.length < 2) return hide();

    timer = setTimeout(async () => {
      const res = await fetch('/search-suggestions?q=' + encodeURIComponent(q));
      const json = await res.json().catch(() => ({ categories: [], products: [] }));
      render(json);
    }, 250);
  });

  input.form.closest('form').addEventListener('submit', () => hide());

  function render({ categories, products }) {
    list.innerHTML = '';
    if (!categories.length && !products.length) {
      list.innerHTML = `<li class="list-group-item disabled">No results</li>`;
      return show();
    }

    if (categories.length) {
      list.insertAdjacentHTML('beforeend',
        `<li class="list-group-item fw-semibold text-primary">Categories</li>`);
      categories.forEach(c => {
        list.insertAdjacentHTML('beforeend',
          `<li class="list-group-item" data-url="/category/${c.slug}">
             <i class="bi bi-folder me-2"></i>${c.name}
           </li>`);
      });
    }

    if (products.length) {
      list.insertAdjacentHTML('beforeend',
        `<li class="list-group-item fw-semibold text-success">Products</li>`);
      products.forEach(p => {
        list.insertAdjacentHTML('beforeend',
          `<li class="list-group-item" data-url="/product/${p.partno}">
             <i class="bi bi-box-seam me-2"></i>${p.name}
           </li>`);
      });
    }

    Array.from(list.children).forEach(li => {
      const url = li.dataset.url;
      if (url) li.addEventListener('click', () => window.location.href = url);
    });

    show();
  }
});
