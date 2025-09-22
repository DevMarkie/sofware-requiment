// js/main.js
// Entry: nạp dữ liệu, gắn handler, điều phối render

import { sampleData, uid } from './data.js';
import * as store from './storage.js';
import * as org from './org.js';
import * as emp from './employees.js';
import * as mod from './modules.js';
import { setActiveSortButtons, toast } from './ui.js';
import { debounce } from './utils.js';

// ---------------- State ----------------
/** @type {{orgs:any[], employees:any[], ui:any}} */
let state = store.load() || { ...sampleData, ui: { selectedOrgId: 'u-phenikaa', orgSearch:'', empSearch:'', empStatusFilter:'all', sortBy:'name', moduleSearch:'' } };
// Defensive: đảm bảo mảng tồn tại để tránh lỗi khi JSON bị thiếu trường
if (!Array.isArray(state.employees)) state.employees = [];
if (!Array.isArray(state.modules)) state.modules = sampleData.modules || [];
store.save(state);

// --------------- Theme handling ---------------
const THEME_KEY = 'ui_theme_v1';
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
}
function detectInitialTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}
let currentTheme = detectInitialTheme();
applyTheme(currentTheme);
document.getElementById('themeToggle')?.addEventListener('click', ()=>{
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, currentTheme);
  applyTheme(currentTheme);
});

// --------------- Render all ---------------
function renderAll(){
  // derive selected org type for module filtering
  const selOrg = state.orgs.find(o=>o.id===state.ui.selectedOrgId);
  state.ui.selectedOrgType = selOrg?.type || null;
  org.renderTree(state, onOrgSelect);
  org.renderBreadcrumb(state);
  emp.renderEmployees(state);
  mod.renderModules(state);
  updateEmpFormOrgPath();
  setActiveSortButtons(state.ui.sortBy);
  updateModuleHint();
  updateCurrentCourseLabel();
}
function onOrgSelect(){
  renderAll();
}

// Small refresh helpers
const refreshOrg = () => { org.renderTree(state, onOrgSelect); org.renderBreadcrumb(state); mod.renderModules(state); updateModuleHint(); };
const refreshEmp = () => { emp.renderEmployees(state); setActiveSortButtons(state.ui.sortBy); };
const refreshModules = () => { mod.renderModules(state); updateModuleHint(); };

// --------------- Org actions ---------------
document.getElementById('btnAddChild').addEventListener('click', ()=>{
  org.addChild(state);
  store.save(state);
  renderAll();
});
document.getElementById('btnRename').addEventListener('click', ()=>{
  org.renameNode(state);
  store.save(state);
  renderAll();
});
document.getElementById('btnDelete').addEventListener('click', ()=>{
  org.deleteNode(state);
  store.save(state);
  renderAll();
});

// --------------- Export / Import / Reset ---------------
document.getElementById('btnExport').addEventListener('click', ()=>{
  store.exportJSON(state);
  toast('Đã xuất JSON');
});
document.getElementById('fileImport').addEventListener('change', async (e)=>{
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const data = await store.importJSON(file);
    // giữ lại ui trước đó
    state = { ...data, ui: state.ui || {} };
    store.save(state);
    renderAll();
    toast('Nhập dữ liệu thành công', 'ok');
  } catch (err){
    toast(err.message || 'Lỗi nhập dữ liệu', 'warn');
  } finally {
    e.target.value = '';
  }
});
document.getElementById('btnReset').addEventListener('click', ()=>{
  if (!confirm('Khôi phục dữ liệu mẫu? Dữ liệu hiện tại sẽ mất.')) return;
  store.clearAll();
  state = { ...sampleData, ui: { selectedOrgId: 'u-phenikaa', orgSearch:'', empSearch:'', empStatusFilter:'all', sortBy:'name' } };
  store.save(state);
  renderAll();
  toast('Đã khôi phục dữ liệu mẫu', 'ok');
});

// --------------- Employee form toggle ---------------
const empForm = document.getElementById('empForm');
document.getElementById('btnToggleEmpForm').addEventListener('click', ()=>{
  const editing = !empForm.classList.contains('hidden') && document.getElementById('empId').value;
  document.getElementById('empId').value = '';
  empForm.reset?.();
  updateEmpFormOrgPath();
  empForm.classList.toggle('hidden');
});
document.getElementById('btnCancelEmp').addEventListener('click', ()=>{
  empForm.classList.add('hidden');
  document.getElementById('empId').value='';
});

// --------------- Employee search/filter/sort ---------------
document.getElementById('empSearch').addEventListener('input', debounce((e)=>{
  state.ui.empSearch = e.target.value;
  store.save(state);
  refreshEmp();
}, 150));
document.getElementById('empStatusFilter').addEventListener('change', (e)=>{
  state.ui.empStatusFilter = e.target.value;
  store.save(state);
  refreshEmp();
});
document.getElementById('btnClearSearch').addEventListener('click', ()=>{
  state.ui.empSearch = '';
  document.getElementById('empSearch').value = '';
  store.save(state);
  refreshEmp();
});
document.querySelectorAll('.sort').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    state.ui.sortBy = btn.dataset.sort;
    store.save(state);
    refreshEmp();
  });
});

// --------------- Employee form submit (add or update) ---------------
empForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  try {
    const id = document.getElementById('empId').value || uid();
    const payload = {
      id,
      name: document.getElementById('empName').value.trim(),
      title: document.getElementById('empTitle').value.trim(),
      email: document.getElementById('empEmail').value.trim(),
      phone: document.getElementById('empPhone').value.trim(),
      status: document.getElementById('empStatus').value,
      orgId: document.getElementById('empOrgSelect')?.value || state.ui.selectedOrgId || null
    };
    if (!payload.name){
      alert('Họ tên là bắt buộc.');
      return;
    }
    if (!Array.isArray(state.employees)) state.employees = []; // đảm bảo luôn có mảng
    const exists = state.employees.find(x=>x.id===id);
    if (exists){
      emp.updateEmployee(state, payload);
      toast('Đã cập nhật nhân viên', 'ok');
    } else {
      emp.addEmployee(state, payload);
      toast('Đã thêm nhân viên', 'ok');
    }
    if (window?.DEBUG_EMP){
      console.debug('[EMP] After submit employees:', state.employees);
    }
    empForm.classList.add('hidden');
    emp.renderEmployees(state);
    setActiveSortButtons(state.ui.sortBy);
  } catch (err){
    console.error('Lỗi xử lý submit nhân viên', err);
    alert('Có lỗi khi lưu nhân viên. Xem Console để biết thêm.');
  }
});

// --------------- Helpers ---------------
function updateEmpFormOrgPath(){
  const sel = document.getElementById('empOrgSelect');
  if (!sel) return;
  const { orgs, ui } = state;
  // Precompute path strings only once for efficiency when org count grows.
  const byId = new Map(orgs.map(o=>[o.id,o]));
  const pathCache = new Map();
  const buildPath = (id)=>{
    if (pathCache.has(id)) return pathCache.get(id);
    const node = byId.get(id);
    if (!node){ pathCache.set(id, ''); return ''; }
    const parentPath = node.parentId ? buildPath(node.parentId) : '';
    const full = parentPath ? parentPath + ' / ' + node.name : node.name;
    pathCache.set(id, full);
    return full;
  };
  for (const o of orgs) buildPath(o.id);
  const entries = orgs.slice().sort((a,b)=>pathCache.get(a.id).localeCompare(pathCache.get(b.id),'vi'));
  const frag = document.createDocumentFragment();
  for (const o of entries){
    const opt = document.createElement('option');
    opt.value = o.id;
    opt.textContent = pathCache.get(o.id);
    frag.appendChild(opt);
  }
  sel.innerHTML = '';
  sel.appendChild(frag);
  if (ui.selectedOrgId){
    sel.value = ui.selectedOrgId;
  }
}

// --------------- Module handlers ---------------
mod.attachModuleHandlers(state);

function updateModuleHint(){
  const hint = document.getElementById('moduleHint');
  if (!hint) return;
  if (state.ui.selectedOrgType === 'course'){
    hint.textContent = 'Quản lý học phần cho Môn học được chọn.';
  } else {
    hint.textContent = 'Chọn một Môn học (type=course) trong Cơ cấu tổ chức để xem / quản lý học phần.';
  }
}

function updateCurrentCourseLabel(){
  const label = document.getElementById('currentCourseLabel');
  if (!label) return;
  if (state.ui.selectedOrgType === 'course'){
    const course = state.orgs.find(o=>o.id===state.ui.selectedOrgId);
    label.textContent = course ? `— ${course.name}` : '';
  } else {
    label.textContent = '— (chưa chọn môn học)';
  }
}

// --------------- Initial render ---------------
renderAll();

// --------------- Tabs: Org vs Employees ---------------
const tabOrg = document.getElementById('tabOrg');
const tabEmp = document.getElementById('tabEmp');
// add dynamic button for modules tab inside header actions (simpler: reuse existing nav?)
const tabModules = document.getElementById('tabModules');
const sectionOrg = document.getElementById('sectionOrg');
const sectionEmp = document.getElementById('sectionEmp');
const sectionModules = document.getElementById('sectionModules');
function showTab(which){
  const isOrg = which === 'org';
  const isEmp = which === 'emp';
  const isMod = which === 'modules';
  sectionOrg?.classList.toggle('hidden', !isOrg);
  sectionEmp?.classList.toggle('hidden', !isEmp);
  sectionModules?.classList.toggle('hidden', !isMod);
  tabOrg?.classList.toggle('active', isOrg);
  tabEmp?.classList.toggle('active', isEmp);
  tabModules?.classList.toggle('active', isMod);
}
tabOrg?.addEventListener('click', ()=>showTab('org'));
tabEmp?.addEventListener('click', ()=>showTab('emp'));
tabModules?.addEventListener('click', ()=>{ showTab('modules'); refreshModules(); });
// default: show Org
showTab('org');

// --------------- Floating Action Menu ---------------
const fabToggle = document.getElementById('fabToggle');
const fabPanel = document.getElementById('fabPanel');
function closeFab(){ fabPanel?.classList.add('hidden'); fabPanel?.setAttribute('aria-hidden','true'); }
function toggleFab(){
  if (!fabPanel) return;
  const hidden = fabPanel.classList.contains('hidden');
  if (hidden){ fabPanel.classList.remove('hidden'); fabPanel.setAttribute('aria-hidden','false'); }
  else closeFab();
}
fabToggle?.addEventListener('click', (e)=>{ e.stopPropagation(); toggleFab(); });
document.addEventListener('click', (e)=>{
  if (!fabPanel || fabPanel.classList.contains('hidden')) return;
  if (!fabPanel.contains(e.target) && e.target !== fabToggle){ closeFab(); }
});
// Esc key
document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') closeFab(); });

// Bind fab items to existing buttons by id
function bindFabItems(){
  fabPanel?.querySelectorAll('[data-bind-click]')?.forEach(item=>{
    const targetId = item.getAttribute('data-bind-click');
    const original = document.getElementById(targetId);
    if (original){
      item.addEventListener('click', ()=>{
        original.click();
        if (targetId !== 'fileImport'){ closeFab(); }
      });
    }
  });
  // handle file import clone
  const fileClone = document.getElementById('fileImportClone');
  const realFile = document.getElementById('fileImport');
  if (fileClone && realFile){
    fileClone.addEventListener('change', (e)=>{
      // mirror to real file input logic
      const files = fileClone.files;
      if (files && files.length){
        // Trigger the same handler by cloning file to original input via DataTransfer
        try {
          const dt = new DataTransfer();
          for (const f of files) dt.items.add(f);
          realFile.files = dt.files;
          const ev = new Event('change', { bubbles:true });
          realFile.dispatchEvent(ev);
        } catch {}
        fileClone.value='';
        closeFab();
      }
    });
  }
}
bindFabItems();

// --------------- Org search ---------------
const orgSearch = document.getElementById('orgSearch');
const btnClearOrgSearch = document.getElementById('btnClearOrgSearch');
if (orgSearch){
  orgSearch.value = state.ui.orgSearch || '';
  orgSearch.addEventListener('input', debounce((e)=>{
    state.ui.orgSearch = e.target.value;
    store.save(state);
    refreshOrg();
  }, 120));
}
btnClearOrgSearch?.addEventListener('click', ()=>{
  if (orgSearch){ orgSearch.value = ''; }
  state.ui.orgSearch = '';
  store.save(state);
  refreshOrg();
});
