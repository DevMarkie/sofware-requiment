// js/modules.js
// Quản lý Học phần (modules) gắn với org type 'course'

import { save } from './storage.js';
import { uid } from './data.js';
import { escapeHtml } from './utils.js';
import * as api from './api-modules.js';

export function ensureModulesArray(state){
  if (!Array.isArray(state.modules)) state.modules = [];
}

export function filterModules(state){
  const { modules, ui } = state;
  const q = (ui.moduleSearch||'').toLowerCase();
  const currentCourseId = ui.selectedOrgType === 'course' ? ui.selectedOrgId : null;
  return modules.filter(m => {
    const inCourse = currentCourseId ? m.courseId === currentCourseId : true;
    const match = [m.code, m.name].some(x => (x||'').toLowerCase().includes(q));
    return inCourse && match;
  }).sort((a,b)=> (a.code||'').localeCompare(b.code||''));
}

export async function renderModules(state){
  ensureModulesArray(state);
  const tableWrap = document.getElementById('moduleTable');
  if (!tableWrap) return;
  // Attempt a lightweight sync with backend:
  // - If a specific course selected: replace only that course's modules (merging others untouched)
  // - If no course selected: replace entire list (acts like a full refresh)
  // Silent failure = offline / server not running; local data stays as last known.
  try {
    const currentCourseId = state.ui.selectedOrgType === 'course' ? state.ui.selectedOrgId : undefined;
    const remote = await api.listModules(currentCourseId);
    // merge strategy: replace modules of that course, keep others
    if (Array.isArray(remote)){
      if (currentCourseId){
        state.modules = state.modules.filter(m=>m.courseId !== currentCourseId).concat(remote);
      } else {
        // replace all (fallback)
        state.modules = remote;
      }
      save(state);
    }
  } catch (err){
    // Silent offline/network fallback (optional debug):
    // console.warn('Sync modules failed', err);
  }
  const list = filterModules(state);
  const rows = list.map(m => `
    <tr>
      <td><strong>${escapeHtml(m.code||'')}</strong></td>
      <td>${escapeHtml(m.name)}</td>
      <td>${m.credits ?? 0}</td>
      <td>
        <div class="action-links">
          <span class="action-link" data-act="edit" data-id="${m.id}">Sửa</span>
          <span class="action-link" data-act="del" data-id="${m.id}">Xoá</span>
        </div>
      </td>
    </tr>`).join('');
  tableWrap.innerHTML = `
    <div class="table">
      <table>
        <thead><tr><th>Mã</th><th>Tên</th><th>Tín chỉ</th><th>Thao tác</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" class="muted">Không có học phần.</td></tr>'}</tbody>
      </table>
    </div>`;
  tableWrap.querySelectorAll('.action-link').forEach(a=>{
    a.addEventListener('click', ()=>{
      const id = a.getAttribute('data-id');
      const act = a.getAttribute('data-act');
      if (act==='del'){
        if (confirm('Xoá học phần này?')){
          // optimistic remove
          const backup = [...state.modules];
          state.modules = state.modules.filter(x=>x.id!==id);
          save(state);
          renderModules(state);
          api.deleteModule(id).catch(()=>{
            // rollback
            state.modules = backup; save(state); renderModules(state);
          });
        }
      } else if (act==='edit'){
        startEditModule(state, id);
      }
    });
  });
}

export function startEditModule(state, id){
  const form = document.getElementById('moduleForm');
  const m = state.modules.find(x=>x.id===id);
  if (!m || !form) return;
  form.classList.remove('hidden');
  document.getElementById('moduleId').value = m.id;
  document.getElementById('moduleCode').value = m.code || '';
  document.getElementById('moduleName').value = m.name || '';
  document.getElementById('moduleCredits').value = m.credits ?? 0;
}

export function attachModuleHandlers(state){
  ensureModulesArray(state);
  const btnAdd = document.getElementById('btnAddModule');
  const form = document.getElementById('moduleForm');
  const cancel = document.getElementById('btnCancelModule');
  const search = document.getElementById('moduleSearch');
  const btnClear = document.getElementById('btnClearModuleSearch');

  btnAdd?.addEventListener('click', ()=>{
    if (state.ui.selectedOrgType !== 'course'){
      alert('Hãy chọn một Môn học trong cây trước.');
      return;
    }
    document.getElementById('moduleId').value='';
    form.classList.remove('hidden');
  });
  cancel?.addEventListener('click', ()=>{ form.classList.add('hidden'); });
  form?.addEventListener('submit', async e=>{
    e.preventDefault();
    if (state.ui.selectedOrgType !== 'course'){
      alert('Chưa chọn Môn học.');
      return;
    }
    const existingId = document.getElementById('moduleId').value;
    const tempId = existingId || uid();
    const payload = {
      id: tempId,
      code: document.getElementById('moduleCode').value.trim(),
      name: document.getElementById('moduleName').value.trim(),
      credits: parseInt(document.getElementById('moduleCredits').value,10) || 0,
      courseId: state.ui.selectedOrgId
    };
    if (!payload.name){ alert('Tên học phần bắt buộc.'); return; }
    // optimistic update/add
    const idx = state.modules.findIndex(x=>x.id===tempId);
    if (idx>=0) state.modules[idx] = { ...state.modules[idx], ...payload }; else state.modules.push(payload);
    save(state);
    form.classList.add('hidden');
    renderModules(state);
    try {
      if (existingId){
        await api.updateModule(existingId, { code: payload.code, name: payload.name, credits: payload.credits });
      } else {
        const resp = await api.createModule(payload);
        if (resp?.id && resp.id !== tempId){
          // replace temp id with real id
          const mod = state.modules.find(m=>m.id===tempId);
          if (mod){ mod.id = resp.id; save(state); }
        }
      }
      renderModules(state);
    } catch (err){
      const detail = [err.message, err.status && ('HTTP '+err.status), err.url].filter(Boolean).join(' | ');
      alert('Lỗi đồng bộ backend: ' + detail + '\nBạn có đang chạy server tại http://localhost:3000 ?');
    }
  });
  search?.addEventListener('input', ()=>{
    state.ui.moduleSearch = search.value;
    save(state);
    renderModules(state);
  });
  btnClear?.addEventListener('click', ()=>{
    if (search){ search.value=''; }
    state.ui.moduleSearch='';
    save(state);
    renderModules(state);
  });
}
