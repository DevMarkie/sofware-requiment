// js/users.js
// Quản lý người dùng nội bộ: render bảng, CRUD, lọc cơ bản

import { uid } from './data.js';
import { save } from './storage.js';
import { escapeHtml, debounce } from './utils.js';
import { toast } from './ui.js';

function ensureUsers(state){
  if (!Array.isArray(state.users)) state.users = [];
}

const ROLE_LABEL = {
  admin: 'Quản trị',
  academic: 'Học vụ',
  lecturer: 'Giảng viên',
  viewer: 'Xem'
};

const STATUS_LABEL = {
  active: { cls: 'green', label: 'Hoạt động' },
  inactive: { cls: 'amber', label: 'Tạm khoá' }
};

function roleLabel(role){
  return ROLE_LABEL[role] || role || 'Khác';
}

function statusBadge(status){
  const meta = STATUS_LABEL[status] || { cls: 'gray', label: 'Khác' };
  return `<span class="badge ${meta.cls}">${meta.label}</span>`;
}

function filterUsers(state){
  ensureUsers(state);
  const { ui } = state;
  const keyword = (ui.userSearch || '').trim().toLowerCase();
  const role = ui.userRoleFilter || 'all';
  const status = ui.userStatusFilter || 'all';
  return state.users.filter(user => {
    const matchText = [user.username, user.fullName, user.email]
      .some(val => (val || '').toLowerCase().includes(keyword));
    const matchRole = role === 'all' ? true : user.role === role;
    const matchStatus = status === 'all' ? true : user.status === status;
    return matchText && matchRole && matchStatus;
  }).sort((a, b) => (a.username || '').localeCompare(b.username || '', 'vi'));
}

export function renderUsers(state){
  ensureUsers(state);
  const wrap = document.getElementById('userTable');
  if (!wrap) return;
  const list = filterUsers(state);
  const rows = list.map(user => `
    <tr data-user-id="${user.id}">
      <td><strong>${escapeHtml(user.username || '')}</strong><br><span class="muted small">${escapeHtml(user.fullName || '')}</span></td>
      <td>${escapeHtml(roleLabel(user.role))}</td>
      <td>${statusBadge(user.status)}</td>
      <td>${escapeHtml(user.email || '')}</td>
      <td>
        <div class="action-links">
          <span class="action-link" data-act="edit" data-id="${user.id}">Sửa</span>
          <span class="action-link" data-act="del" data-id="${user.id}">Xoá</span>
        </div>
      </td>
    </tr>
  `).join('');
  wrap.innerHTML = `
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Tài khoản</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Email</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="5" class="muted">Không có người dùng.</td></tr>'}</tbody>
      </table>
      <div class="table-foot"><span class="muted">${list.length} tài khoản</span></div>
    </div>
  `;

  wrap.querySelectorAll('.action-link').forEach(link => {
    link.addEventListener('click', ()=>{
      const id = link.getAttribute('data-id');
      const act = link.getAttribute('data-act');
      if (act === 'del'){
        if (!confirm('Xoá tài khoản này?')) return;
        state.users = state.users.filter(u => u.id !== id);
        save(state);
        toast('Đã xoá người dùng', 'warn');
        renderUsers(state);
      } else if (act === 'edit'){
        startEditUser(state, id);
      }
    });
  });
}

function resetUserForm(){
  const form = document.getElementById('userForm');
  if (!form) return;
  form.reset?.();
  const hiddenId = document.getElementById('userId');
  if (hiddenId) hiddenId.value = '';
}

function toggleUserForm(show){
  const form = document.getElementById('userForm');
  if (!form) return;
  if (show){
    form.classList.remove('hidden');
  } else {
    form.classList.add('hidden');
  }
}

export function attachUserHandlers(state){
  ensureUsers(state);
  const btnToggle = document.getElementById('btnToggleUserForm');
  const btnCancel = document.getElementById('btnCancelUser');
  const form = document.getElementById('userForm');
  const searchInput = document.getElementById('userSearch');
  const roleFilter = document.getElementById('userRoleFilter');
  const statusFilter = document.getElementById('userStatusFilter');
  const clearBtn = document.getElementById('btnClearUserSearch');

  if (searchInput) searchInput.value = state.ui.userSearch || '';
  if (roleFilter) roleFilter.value = state.ui.userRoleFilter || 'all';
  if (statusFilter) statusFilter.value = state.ui.userStatusFilter || 'all';

  btnToggle?.addEventListener('click', ()=>{
    if (!form) return;
    const isVisible = !form.classList.contains('hidden');
    if (isVisible){
      toggleUserForm(false);
      resetUserForm();
    } else {
      resetUserForm();
      toggleUserForm(true);
      document.getElementById('userUsername')?.focus?.();
    }
  });

  btnCancel?.addEventListener('click', ()=>{
    toggleUserForm(false);
    resetUserForm();
  });

  clearBtn?.addEventListener('click', ()=>{
    if (searchInput) searchInput.value = '';
    state.ui.userSearch = '';
    save(state);
    renderUsers(state);
  });

  searchInput?.addEventListener('input', debounce(()=>{
    state.ui.userSearch = searchInput.value;
    save(state);
    renderUsers(state);
  }, 150));

  roleFilter?.addEventListener('change', ()=>{
    state.ui.userRoleFilter = roleFilter.value;
    save(state);
    renderUsers(state);
  });

  statusFilter?.addEventListener('change', ()=>{
    state.ui.userStatusFilter = statusFilter.value;
    save(state);
    renderUsers(state);
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const idEl = document.getElementById('userId');
    const usernameEl = document.getElementById('userUsername');
    const fullNameEl = document.getElementById('userFullName');
    const emailEl = document.getElementById('userEmail');
    const roleEl = document.getElementById('userRole');
    const statusEl = document.getElementById('userStatus');

    const username = (usernameEl?.value || '').trim();
    if (!username){
      alert('Tên đăng nhập là bắt buộc.');
      return;
    }
    const currentId = (idEl?.value || '').trim();
    const duplicate = state.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== currentId);
    if (duplicate){
      alert('Tên đăng nhập đã tồn tại.');
      return;
    }

    const payload = {
      id: currentId || uid(),
      username,
      fullName: (fullNameEl?.value || '').trim(),
      email: (emailEl?.value || '').trim(),
      role: roleEl?.value || 'viewer',
      status: statusEl?.value || 'active'
    };

    const index = state.users.findIndex(u => u.id === payload.id);
    if (index >= 0){
      state.users[index] = { ...state.users[index], ...payload };
      toast('Đã cập nhật người dùng', 'ok');
    } else {
      state.users.push(payload);
      toast('Đã thêm người dùng', 'ok');
    }
    window.__FLASH_USER = payload.id;
    save(state);
    renderUsers(state);
    toggleUserForm(false);
    resetUserForm();
  });
}

export function startEditUser(state, id){
  ensureUsers(state);
  const user = state.users.find(u => u.id === id);
  if (!user) return;
  document.getElementById('userId').value = user.id;
  document.getElementById('userUsername').value = user.username || '';
  document.getElementById('userFullName').value = user.fullName || '';
  document.getElementById('userEmail').value = user.email || '';
  document.getElementById('userRole').value = user.role || 'viewer';
  document.getElementById('userStatus').value = user.status || 'active';
  toggleUserForm(true);
  document.getElementById('userUsername')?.focus?.();
}
