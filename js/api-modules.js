// js/api-modules.js
// API client cho Học phần (Modules)
// Hỗ trợ chạy từ:
//  - Cùng domain backend (served via express) => dùng relative '/api'
//  - Live Server / file:// hoặc cổng khác (ví dụ 127.0.0.1:5500) => có thể khai báo window.APP_API_BASE

function detectApiBase(){
  if (typeof window !== 'undefined'){
    if (window.APP_API_BASE) return window.APP_API_BASE.replace(/\/$/, '');
    // Nếu đang chạy trên file:// hoặc cổng khác 5500 -> thử mặc định http://localhost:3000
    const isFile = window.location.origin === 'null' || window.location.protocol === 'file:';
    const origin = window.location.origin;
    if (isFile || /:5500$/.test(origin)){
      return 'http://localhost:3000';
    }
    return origin; // same origin case
  }
  return '';
}

const API_BASE = detectApiBase();
const BASE = API_BASE + '/api/modules';

async function jsonFetch(url, options){
  let res;
  try {
    res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  } catch (netErr){
    const err = new Error('Network error: ' + (netErr?.message || 'fetch failed'));
    err.cause = netErr;
    throw err;
  }
  if (!res.ok){
    let body; try { body = await res.json(); } catch {}
    const err = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.url = url;
    throw err;
  }
  try { return await res.json(); } catch { return {}; }
}

export async function listModules(courseId){
  const q = courseId ? `?courseId=${encodeURIComponent(courseId)}` : '';
  return jsonFetch(`${BASE}${q}`);
}
export async function createModule(data){
  return jsonFetch(BASE, { method: 'POST', body: JSON.stringify(data) });
}
export async function updateModule(id, patch){
  return jsonFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
}
export async function deleteModule(id){
  return jsonFetch(`${BASE}/${id}`, { method: 'DELETE' });
}

export { API_BASE };
