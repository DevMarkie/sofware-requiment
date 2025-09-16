// js/utils.js
// Nhỏ gọn: tiện ích chung dùng lại giữa các module

/** Escape HTML đơn giản để chống chèn markup */
export function escapeHtml(s = ''){
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/** Debounce: trì hoãn gọi fn cho đến khi không nhập thêm trong delay ms */
export function debounce(fn, delay = 200){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(()=>fn.apply(this, args), delay);
  };
}
