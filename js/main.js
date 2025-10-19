// js/main.js
// Entry: nạp dữ liệu, gắn handler, điều phối render

import { sampleData, uid } from './data.js';
import * as store from './storage.js';
import * as org from './org.js';
import * as emp from './employees.js';
import * as mod from './modules.js';
import * as users from './users.js';
import * as programs from './programs.js';
import * as tuition from './tuition.js';
import { setActiveSortButtons, toast } from './ui.js';
import { debounce } from './utils.js';
// ĐÃ GỠ backend: các import api-* bị loại bỏ. Nếu cần kết nối API hãy khôi phục dòng import.

// ---------------- State ----------------
/** @type {{orgs:any[], employees:any[], modules:any[], users:any[], programs:any[], ui:any, tuition:any}} */
let state = store.load() || {
  ...sampleData,
  ui: {
    selectedOrgId: 'u-phenikaa',
    orgSearch: '',
    empSearch: '',
    empStatusFilter: 'all',
    sortBy: 'name',
    moduleSearch: '',
    userSearch: '',
    userRoleFilter: 'all',
    userStatusFilter: 'all',
    programSearch: ''
  }
};

function ensureStateDefaults(){
  const uiDefaults = {
    selectedOrgId: 'u-phenikaa',
    orgSearch: '',
    empSearch: '',
    empStatusFilter: 'all',
    sortBy: 'name',
    moduleSearch: '',
    userSearch: '',
    userRoleFilter: 'all',
    userStatusFilter: 'all',
    programSearch: ''
  };
  state.ui = { ...uiDefaults, ...(state.ui || {}) };

  if (!Array.isArray(state.orgs) || state.orgs.length === 0) state.orgs = [...sampleData.orgs];
  if (!Array.isArray(state.employees) || state.employees.length === 0) state.employees = [...sampleData.employees];
  if (!Array.isArray(state.modules) || state.modules.length === 0) state.modules = [...(sampleData.modules || [])];
  if (!Array.isArray(state.users) || state.users.length === 0) state.users = [...(sampleData.users || [])];
  if (!Array.isArray(state.programs) || state.programs.length === 0) state.programs = [...(sampleData.programs || [])];

  if (!Array.isArray(state.employees)) state.employees = [];
  if (!Array.isArray(state.modules)) state.modules = sampleData.modules || [];
  if (!Array.isArray(state.users)) state.users = [];
  if (!Array.isArray(state.programs)) state.programs = [];

  const defaultTuition = sampleData.tuition || { theoryRate: 350000, practiceRate: 280000 };
  if (!state.tuition || typeof state.tuition !== 'object'){
    state.tuition = { ...defaultTuition, selectedProgramId: '' };
  }
  if (typeof state.tuition.theoryRate !== 'number') state.tuition.theoryRate = defaultTuition.theoryRate;
  if (typeof state.tuition.practiceRate !== 'number') state.tuition.practiceRate = defaultTuition.practiceRate;
  if (typeof state.tuition.quickCredits !== 'number') state.tuition.quickCredits = 0;
  if (typeof state.tuition.quickRate !== 'number') state.tuition.quickRate = state.tuition.theoryRate;
  if (typeof state.tuition.quickResult !== 'number') state.tuition.quickResult = 0;
  if (!state.tuition.selectedProgramId && Array.isArray(state.programs) && state.programs.length){
    state.tuition.selectedProgramId = state.programs[0].id;
  }
  if (state.tuition.selectedProgramId && Array.isArray(state.programs)){
    const exists = state.programs.some(p => p.id === state.tuition.selectedProgramId);
    if (!exists){
      state.tuition.selectedProgramId = state.programs.length ? state.programs[0].id : '';
    }
  }

  store.save(state);
}

ensureStateDefaults();

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
  users.renderUsers(state);
  programs.renderPrograms(state);
  tuition.renderTuition(state);
  updateEmpFormOrgPath();
  setActiveSortButtons(state.ui.sortBy);
  updateModuleHint();
  updateCurrentCourseLabel();
  applyFlashEffects();
}
function onOrgSelect(){
  renderAll();
}

// Small refresh helpers
const refreshOrg = () => { org.renderTree(state, onOrgSelect); org.renderBreadcrumb(state); mod.renderModules(state); updateModuleHint(); };
const refreshEmp = () => { emp.renderEmployees(state); setActiveSortButtons(state.ui.sortBy); };
const refreshModules = () => { mod.renderModules(state); updateModuleHint(); };
const refreshUsers = () => { users.renderUsers(state); };
const refreshPrograms = () => { programs.renderPrograms(state); tuition.renderTuition(state); };
const refreshTuition = () => { tuition.renderTuition(state); };

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
    ensureStateDefaults();
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
  ensureStateDefaults();
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
users.attachUserHandlers(state, { refreshUsers, refreshTuition });
programs.attachProgramHandlers(state, { refreshPrograms, refreshTuition });
tuition.attachTuitionHandlers(state, { refreshTuition, refreshPrograms });

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

// (Đã bỏ đồng bộ backend)

// --------------- Tabs: điều hướng chính ---------------
const tabOrg = document.getElementById('tabOrg');
const tabEmp = document.getElementById('tabEmp');
const tabModules = document.getElementById('tabModules');
const tabUsers = document.getElementById('tabUsers');
const tabPrograms = document.getElementById('tabPrograms');
const tabTuition = document.getElementById('tabTuition');
const sectionOrg = document.getElementById('sectionOrg');
const sectionEmp = document.getElementById('sectionEmp');
const sectionModules = document.getElementById('sectionModules');
const sectionUsers = document.getElementById('sectionUsers');
const sectionPrograms = document.getElementById('sectionPrograms');
const sectionTuition = document.getElementById('sectionTuition');

const tabConfig = {
  org: { tab: tabOrg, section: sectionOrg },
  emp: { tab: tabEmp, section: sectionEmp },
  modules: { tab: tabModules, section: sectionModules },
  users: { tab: tabUsers, section: sectionUsers },
  programs: { tab: tabPrograms, section: sectionPrograms },
  tuition: { tab: tabTuition, section: sectionTuition }
};

function showTab(which){
  Object.entries(tabConfig).forEach(([key, cfg])=>{
    cfg.section?.classList.toggle('hidden', key !== which);
    cfg.tab?.classList.toggle('active', key === which);
  });
  if (which === 'modules') refreshModules();
  if (which === 'users') refreshUsers();
  if (which === 'programs') refreshPrograms();
  if (which === 'tuition') refreshTuition();
}

tabOrg?.addEventListener('click', ()=>showTab('org'));
tabEmp?.addEventListener('click', ()=>showTab('emp'));
tabModules?.addEventListener('click', ()=>showTab('modules'));
tabUsers?.addEventListener('click', ()=>showTab('users'));
tabPrograms?.addEventListener('click', ()=>showTab('programs'));
tabTuition?.addEventListener('click', ()=>showTab('tuition'));

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

// --------------- Flash / Animation helpers ---------------
function applyFlashEffects(){
  if (window.__FLASH_ORG){
    const el = document.querySelector(`[data-org-id="${window.__FLASH_ORG}"]`);
    if (el){ el.classList.add('anim-flash'); setTimeout(()=>el.classList.remove('anim-flash'), 1400); }
    delete window.__FLASH_ORG;
  }
  if (window.__FLASH_EMP){
    const row = document.querySelector(`[data-emp-id="${window.__FLASH_EMP}"]`);
    if (row){ row.classList.add('anim-pop'); setTimeout(()=>row.classList.remove('anim-pop'), 900); }
    delete window.__FLASH_EMP;
  }
  if (window.__FLASH_USER){
    const row = document.querySelector(`[data-user-id="${window.__FLASH_USER}"]`);
    if (row){ row.classList.add('anim-pop'); setTimeout(()=>row.classList.remove('anim-pop'), 900); }
    delete window.__FLASH_USER;
  }
  if (window.__FLASH_PROGRAM){
    const row = document.querySelector(`[data-program-id="${window.__FLASH_PROGRAM}"]`);
    if (row){ row.classList.add('anim-pop'); setTimeout(()=>row.classList.remove('anim-pop'), 900); }
    delete window.__FLASH_PROGRAM;
  }
}
