// js/auth.js
// Simple client-side auth integration with backend sessions

const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLogout = document.getElementById('btnLogout');

let currentUser = null;

function showLogin(show){
  loginOverlay?.classList.toggle('hidden', !show);
  loginOverlay?.setAttribute('aria-hidden', show ? 'false' : 'true');
}

export async function fetchJSON(url, opts={}){
  let res;
  try{
    res = await fetch(url, { credentials: 'include', headers: { 'Content-Type':'application/json', ...(opts.headers||{}) }, ...opts });
  } catch(err){
    throw new Error('Không thể kết nối tới server. Hãy mở ứng dụng tại http://localhost:3000 và đảm bảo server đang chạy.');
  }
  if (!res.ok){
    const text = await res.text().catch(()=>res.statusText);
    // Normalize common auth errors
    try {
      const data = JSON.parse(text);
      if (data && data.error === 'invalid_credentials'){
        throw new Error('Sai tài khoản hoặc mật khẩu.');
      }
      if (data && data.error === 'unauthorized'){
        throw new Error('Phiên đăng nhập không hợp lệ. Hãy đăng nhập lại.');
      }
    } catch {}
    throw new Error(text || res.statusText);
  }
  const ct = res.headers.get('content-type')||'';
  return ct.includes('application/json') ? res.json() : res.text();
}

export async function checkAuth(){
  try{
    const me = await fetchJSON('/api/auth/me');
    currentUser = me;
    btnLogout?.classList.remove('hidden');
    showLogin(false);
  } catch {
    currentUser = null;
    btnLogout?.classList.add('hidden');
    showLogin(true);
  }
}

export async function login(username, password){
  try{
    const me = await fetchJSON('/api/auth/login', { method:'POST', body: JSON.stringify({ username, password }) });
    currentUser = me;
    btnLogout?.classList.remove('hidden');
    loginError?.classList.add('hidden');
    showLogin(false);
    return me;
  } catch (e){
    if (loginError){
      loginError.textContent = e?.message || 'Lỗi đăng nhập';
      loginError.classList.remove('hidden');
    }
    throw e;
  }
}

export async function logout(){
  await fetchJSON('/api/auth/logout', { method:'POST' });
  currentUser = null;
  btnLogout?.classList.add('hidden');
  showLogin(true);
}

loginForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  await login(username, password).catch(()=>{});
});

btnLogout?.addEventListener('click', async()=>{
  await logout();
});

// Initial check (allows app to hide content until auth is confirmed)
checkAuth();
