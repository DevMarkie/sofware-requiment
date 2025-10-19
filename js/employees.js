// js/employees.js
// Quản lý Nhân viên: render bảng, tìm kiếm, lọc, CRUD đơn giản

import { save } from './storage.js';
import { buildPathMap } from './org.js';
import { updateEmpCount, toast } from './ui.js';
import { escapeHtml } from './utils.js';

/** HTML escape dùng utils */
const escape = escapeHtml;

/** Render bảng nhân viên */
export function renderEmployees(state){
  const { employees, orgs, ui } = state;
  const wrap = document.getElementById('empTable');
  const pathMap = buildPathMap(orgs);
  const list = filterAndSortEmployees(state, pathMap);

  const pathOf = (orgId)=>{
    const path = pathMap.get(orgId) || [];
    return path.map(p=>p.name).join(' / ') || '(chưa gắn)';
  };

  const statusBadge = (st)=>{
    const map = {
      active:   { cls: 'green', label: 'Đang làm' },
      probation:{ cls: 'blue',  label: 'Thử việc' },
      onleave:  { cls: 'amber', label: 'Nghỉ phép' },
      resigned: { cls: 'red',   label: 'Nghỉ việc' },
      default:  { cls: 'gray',  label: 'Tạm nghỉ' }
    };
    const m = map[st] || map.default;
    return `<span class="badge ${m.cls}">${m.label}</span>`;
  };

  const rows = list.map(e => `
    <tr data-emp-id="${e.id}">
      <td><strong>${escape(e.name)}</strong><br><span class="muted small">${escape(e.email||'')}</span></td>
      <td>${escape(e.title||'')}</td>
      <td>${escape(pathOf(e.orgId))}</td>
      <td>${statusBadge(e.status)}</td>
      <td>
        <div class="action-links">
          <span class="action-link" data-act="edit" data-id="${e.id}">Sửa</span>
          <span class="action-link" data-act="del" data-id="${e.id}">Xoá</span>
        </div>
      </td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Chức danh</th>
            <th>Bộ phận</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="5" class="muted">Không có bản ghi.</td></tr>'}
        </tbody>
      </table>
      <div class="table-foot"><span id="empCount"></span></div>
    </div>
  `;

  updateEmpCount(list.length);

  // gắn handler cho edit/del
  wrap.querySelectorAll('.action-link').forEach(a=>{
    a.addEventListener('click', ()=>{
      const id = a.getAttribute('data-id');
      const act = a.getAttribute('data-act');
      if (act==='del'){
        if (confirm('Xoá nhân viên này?')){
          state.employees = employees.filter(x=>x.id!==id);
          save(state);
          toast('Đã xoá nhân viên', 'warn');
          renderEmployees(state);
        }
      } else if (act==='edit'){
        startEditEmployee(state, id);
      }
    });
  });
}

/** Lọc và sắp xếp nhân viên (tách chức năng) */
export function filterAndSortEmployees(state, pathMap){
  const { employees, ui } = state;
  const q = (ui.empSearch||'').toLowerCase();
  const st = ui.empStatusFilter || 'all';
  const sortBy = ui.sortBy || 'name';

  let list = employees.filter(e => {
    const inOrg = ui.selectedOrgId ? (e.orgId === ui.selectedOrgId || (pathMap.get(e.orgId)||[]).some(n=>n.id===ui.selectedOrgId)) : true;
    const matchText = [e.name,e.email,e.title].some(x => (x||'').toLowerCase().includes(q));
    const matchStatus = st==='all' ? true : e.status===st;
    return inOrg && matchText && matchStatus;
  });

  list.sort((a,b)=>{
    if (sortBy==='status') return (a.status||'').localeCompare(b.status||'');
    if (sortBy==='title') return (a.title||'').localeCompare(b.title||'', 'vi');
    return (a.name||'').localeCompare(b.name||'', 'vi');
  });
  return list;
}

/** Thêm nhân viên mới (tách riêng) */
export function addEmployee(state, payload){
  state.employees.push(payload);
  save(state);
  window.__FLASH_EMP = payload.id;
}

/** Cập nhật nhân viên (tách riêng) */
export function updateEmployee(state, payload){
  const idx = state.employees.findIndex(x=>x.id===payload.id);
  if (idx>=0){
    state.employees[idx] = { ...state.employees[idx], ...payload };
    save(state);
    window.__FLASH_EMP = payload.id;
  }
}

/** Bắt đầu sửa: đổ dữ liệu vào form & hiển thị */
export function startEditEmployee(state, id){
  const emp = state.employees.find(x=>x.id===id);
  if (!emp) return;
  const form = document.getElementById('empForm');
  form.classList.remove('hidden');

  document.getElementById('empId').value = emp.id;
  document.getElementById('empName').value = emp.name || '';
  document.getElementById('empTitle').value = emp.title || '';
  document.getElementById('empEmail').value = emp.email || '';
  document.getElementById('empPhone').value = emp.phone || '';
  document.getElementById('empStatus').value = emp.status || 'active';

  // hiển thị path org
  const { orgs } = state;
  const pathMap = buildPathMap(orgs);
  const path = pathMap.get(emp.orgId) || [];
  // chọn đúng bộ phận trong dropdown (nếu có)
  const sel = document.getElementById('empOrgSelect');
  if (sel){
    // nếu dropdown chưa được populate, bỏ qua; main.js sẽ set theo selectedOrgId mặc định
    try { sel.value = emp.orgId || ''; } catch {}
  }
}
