// js/main.js
// Entry: nạp dữ liệu, gắn handler, điều phối render

import { sampleData, LEVELS, uid } from './data.js';
import * as store from './storage.js';
import * as org from './org.js';
import * as emp from './employees.js';
import { setActiveSortButtons, toast } from './ui.js';

// ---------------- State ----------------
/** @type {{orgs:any[], employees:any[], ui:any}} */
let state = store.load() || { ...sampleData, ui: { selectedOrgId: 'u-phenikaa', empSearch:'', empStatusFilter:'all', sortBy:'name' } };
store.save(state);

// --------------- Render all ---------------
function renderAll(){
  org.renderTree(state, onOrgSelect);
  org.renderBreadcrumb(state);
  emp.renderEmployees(state);
  updateEmpFormOrgPath();
  setActiveSortButtons(state.ui.sortBy);
}
function onOrgSelect(){
  renderAll();
}

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
  state = { ...sampleData, ui: { selectedOrgId: 'u-phenikaa', empSearch:'', empStatusFilter:'all', sortBy:'name' } };
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
document.getElementById('empSearch').addEventListener('input', (e)=>{
  state.ui.empSearch = e.target.value;
  store.save(state);
  emp.renderEmployees(state);
  setActiveSortButtons(state.ui.sortBy);
});
document.getElementById('empStatusFilter').addEventListener('change', (e)=>{
  state.ui.empStatusFilter = e.target.value;
  store.save(state);
  emp.renderEmployees(state);
  setActiveSortButtons(state.ui.sortBy);
});
document.getElementById('btnClearSearch').addEventListener('click', ()=>{
  state.ui.empSearch = '';
  document.getElementById('empSearch').value = '';
  store.save(state);
  emp.renderEmployees(state);
  setActiveSortButtons(state.ui.sortBy);
});
document.querySelectorAll('.sort').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    state.ui.sortBy = btn.dataset.sort;
    store.save(state);
    emp.renderEmployees(state);
    setActiveSortButtons(state.ui.sortBy);
  });
});

// --------------- Employee form submit (add or update) ---------------
empForm.addEventListener('submit', (e)=>{
  e.preventDefault();
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
  const exists = state.employees.find(x=>x.id===id);
  if (exists){
    emp.updateEmployee(state, payload);
    toast('Đã cập nhật nhân viên', 'ok');
  } else {
    emp.addEmployee(state, payload);
    toast('Đã thêm nhân viên', 'ok');
  }
  empForm.classList.add('hidden');
  emp.renderEmployees(state);
  setActiveSortButtons(state.ui.sortBy);
});

// --------------- Helpers ---------------
function updateEmpFormOrgPath(){
  const sel = document.getElementById('empOrgSelect');
  if (!sel) return;
  const { orgs, ui } = state;
  const byId = new Map(orgs.map(o=>[o.id,o]));
  const pathOf = (id)=>{
    const parts = [];
    let cur = byId.get(id);
    while(cur){
      parts.unshift(cur.name);
      cur = cur.parentId ? byId.get(cur.parentId) : null;
    }
    return parts.join(' / ');
  };
  const entries = orgs.slice().sort((a,b)=>pathOf(a.id).localeCompare(pathOf(b.id),'vi'));
  sel.innerHTML = '';
  for (const o of entries){
    const opt = document.createElement('option');
    opt.value = o.id;
    opt.textContent = pathOf(o.id);
    sel.appendChild(opt);
  }
  if (ui.selectedOrgId){
    sel.value = ui.selectedOrgId;
  }
}

// --------------- Initial render ---------------
renderAll();

// --------------- Tabs: Org vs Employees ---------------
const tabOrg = document.getElementById('tabOrg');
const tabEmp = document.getElementById('tabEmp');
const sectionOrg = document.getElementById('sectionOrg');
const sectionEmp = document.getElementById('sectionEmp');
function showTab(which){
  const isOrg = which === 'org';
  sectionOrg?.classList.toggle('hidden', !isOrg);
  sectionEmp?.classList.toggle('hidden', isOrg);
  tabOrg?.classList.toggle('active', isOrg);
  tabEmp?.classList.toggle('active', !isOrg);
}
tabOrg?.addEventListener('click', ()=>showTab('org'));
tabEmp?.addEventListener('click', ()=>showTab('emp'));
// default: show Org
showTab('org');
