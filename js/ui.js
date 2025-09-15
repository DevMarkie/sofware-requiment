// js/ui.js
// Tiện ích UI nhỏ: toast thông báo, kích hoạt nút sort, cập nhật đếm

/** Hiển thị thông báo ngắn gọn */
export function toast(message, type = 'info'){
  let host = document.getElementById('toast');
  if (!host){
    host = document.createElement('div');
    host.id = 'toast';
    document.body.appendChild(host);
  }
  const item = document.createElement('div');
  item.className = `toast-item ${type}`;
  item.textContent = message;
  host.appendChild(item);
  // auto remove
  setTimeout(()=>{
    item.classList.add('hide');
    setTimeout(()=>item.remove(), 300);
  }, 1800);
}

/** Đặt trạng thái active cho các nút sort */
export function setActiveSortButtons(sortBy){
  document.querySelectorAll('.sort').forEach(btn=>{
    if (btn.dataset.sort === sortBy) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

/** Cập nhật badge đếm nhân viên hiển thị */
export function updateEmpCount(count){
  const el = document.getElementById('empCount');
  if (el) el.textContent = `${count} bản ghi`;
}
