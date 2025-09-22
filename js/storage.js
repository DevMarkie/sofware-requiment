// js/storage.js
// Lưu trữ & sao lưu dữ liệu qua localStorage + (xuất/nhập) JSON

// Public key constant to allow external modules (e.g., debug tools) to reference storage key.
export const STORAGE_KEY = 'org_emp_data_v1';

/** Tải dữ liệu từ localStorage hoặc trả về null nếu chưa có */
export function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    // Basic shape validation; if corrupted, ignore to avoid runtime errors.
    if (data && typeof data === 'object') return data;
  } catch {}
  return null;
}

/** Ghi dữ liệu vào localStorage */
export function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e){
    // Fail silently (quota exceeded, etc.) – could hook to UI toast if desired.
  }
}

/** Xuất JSON để tải xuống */
export function exportJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'org-employee-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

/** Nhập JSON từ file input */
export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được file.'));
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.orgs) || !Array.isArray(data.employees)) {
          return reject(new Error('Định dạng JSON không hợp lệ.'));
        }
        if (data.modules && !Array.isArray(data.modules)) {
          return reject(new Error('Trường modules không hợp lệ (phải là mảng).'));
        }
        if (!data.modules) data.modules = [];
        resolve(data);
      } catch (e) {
        reject(new Error('File không phải JSON hợp lệ.'));
      }
    };
    reader.readAsText(file, 'utf-8');
  });
}

/** Xoá key để khôi phục dữ liệu mẫu rồi reload */
export function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
}
