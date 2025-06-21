function showToast(msg, type = 'success') {
  let wrap = document.getElementById('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.style = 'position:fixed;top:1rem;right:1rem;z-index:1080';
    document.body.appendChild(wrap);
  }
  const toast = document.createElement('div');
  toast.className = `toast text-bg-${type} border-0`;
  toast.role = 'alert';
  toast.innerHTML =
    `<div class="d-flex">
       <div class="toast-body">${msg}</div>
       <button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
     </div>`;
  wrap.appendChild(toast);
  bootstrap.Toast.getOrCreateInstance(toast, { delay: 1600 }).show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

/* -------- Add to cart -------- */
function wireAdd() {
  document.querySelectorAll('form.add-to-cart:not([data-wired])').forEach(f => {
    f.dataset.wired = 1;
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const data = new URLSearchParams([...new FormData(f)]);
      const res  = await fetch('/cart/add', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:data,
        credentials:'same-origin'
      });
      if (res.ok) {
        const json = await res.json();
        showToast('Added to cart!');
        const badge = document.getElementById('cartBadge');
        if (badge && json.cartCount != null) {
        badge.textContent = json.cartCount;
        }
      }
    });
  });
}

/* -------- Row update / remove -------- */
function wireRows() {
  document.querySelectorAll('form.cart-row:not([data-wired])').forEach(form => {
    form.dataset.wired = 1;                     // avoid double‑binding

    form.addEventListener('submit', async e => {
      e.preventDefault();

      // ← this gives us the exact endpoint (update OR remove)
      const endpoint =
        e.submitter?.getAttribute('formaction') || form.getAttribute('action');

      // payload with CSRF + partno + qty
      const body = new URLSearchParams([...new FormData(form)]);

      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        credentials: 'same-origin'
      });

      const json = await res.json().catch(() => ({ success: false }));

      if (json.success) {
        const msg = endpoint.includes('/remove') ? 'Item removed' : 'Cart updated';
        showToast(msg, 'success');
        const badge = document.getElementById('cartBadge');
        if (badge && json.cartCount != null) {
        badge.textContent = json.cartCount;
        }
        location.reload();              // refresh totals & rows
      } else {
        showToast('Operation failed', 'danger');
      }
    });
  });
}


/* -------- Login modal -------- */
const lf = document.getElementById('loginForm');
if (lf) {
  lf.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new URLSearchParams([...new FormData(lf)]);
    const res  = await fetch('/login', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:data,
      credentials:'same-origin'
    });
    const json = await res.json().catch(()=>({msg:'Login failed'}));
    if (res.ok && json.success) {
      location.reload();
    } else {
      showToast(json.msg || 'Invalid credentials', 'danger');
    }
  });
}

/* -------- init -------- */
document.addEventListener('DOMContentLoaded', () => {
  wireAdd();
  wireRows();
});
