document.addEventListener('DOMContentLoaded', () => {
  const editBtn   = document.getElementById('editBtn');
  const saveBtn   = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const form      = document.getElementById('profileForm');

  if (!form) return;          // Only on /account

  const inputs = form.querySelectorAll('input, textarea');

  editBtn.addEventListener('click', () => {
    inputs.forEach(i => i.disabled = false);
    editBtn.classList.add('d-none');
    saveBtn.classList.remove('d-none');
    cancelBtn.classList.remove('d-none');
  });

  cancelBtn.addEventListener('click', () => {
    inputs.forEach(i => i.disabled = true);

    saveBtn.classList.add('d-none');
    cancelBtn.classList.add('d-none');
    editBtn.classList.remove('d-none');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new URLSearchParams([...new FormData(form)]);
    const res  = await fetch('/account/update', {
      method: 'POST',
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body:   data,
      credentials:'same-origin'
    });
    const json = await res.json().catch(()=>({success:false,msg:'Error'}));

    if (json.success) {
      showToast('Profile updated');
      inputs.forEach(i => i.disabled = false);
    editBtn.classList.add('d-none');
    saveBtn.classList.remove('d-none');
    cancelBtn.classList.remove('d-none');
    setTimeout(() => location.reload(), 1500);
    } else {
      showToast(json.msg || 'Update failed','danger');
    }
  });
});
