// js/programs.js
// Quản lý Chương trình đào tạo (CTĐT)

import { save } from './storage.js';
import { escapeHtml, debounce } from './utils.js';
import { toast } from './ui.js';
import { calculateProgramCost, sumModuleCredits } from './tuition.js';

function ensurePrograms(state){
  if (!Array.isArray(state.programs)) state.programs = [];
}

let listeners = {};

function emitRefreshTuition(){
  if (listeners && typeof listeners.refreshTuition === 'function'){
    listeners.refreshTuition();
  }
}

function ensureModules(state){
  if (!Array.isArray(state.modules)) state.modules = [];
}

function parseModuleCodes(raw){
  return (raw || '')
    .split(/[,\n]/)
    .map(code => code.trim().toUpperCase())
    .filter(Boolean);
}

function resolveMajorName(state, majorId){
  if (!Array.isArray(state.orgs)) return '';
  const node = state.orgs.find(o => o.id === majorId);
  return node ? node.name : '';
}

function populateMajorSelect(state, selectedId){
  const select = document.getElementById('programMajor');
  if (!select) return;
  const majors = (state.orgs || []).filter(o => o.type === 'major')
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const frag = document.createDocumentFragment();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '— Chọn chuyên ngành —';
  frag.appendChild(placeholder);
  majors.forEach(major => {
    const opt = document.createElement('option');
    opt.value = major.id;
    opt.textContent = major.name;
    frag.appendChild(opt);
  });
  select.innerHTML = '';
  select.appendChild(frag);
  if (selectedId) select.value = selectedId;
}

function mapModules(state, codes){
  ensureModules(state);
  const moduleMap = new Map(state.modules.map(m => [String(m.code || '').toUpperCase(), m]));
  const moduleIds = [];
  const missing = [];
  codes.forEach(code => {
    const found = moduleMap.get(code);
    if (found){
      moduleIds.push(found.id);
    } else {
      missing.push(code);
    }
  });
  return { moduleIds, missing };
}

function filterPrograms(state){
  ensurePrograms(state);
  const q = (state.ui.programSearch || '').trim().toLowerCase();
  if (!q) return state.programs.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'));
  return state.programs.filter(program => {
    const fields = [program.name, program.academicYear, resolveMajorName(state, program.majorId)];
    return fields.some(val => (val || '').toLowerCase().includes(q));
  }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'));
}

function formatCurrency(amount){
  if (!Number.isFinite(amount)) return '—';
  try {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  } catch {
    return `${Math.round(amount)}`;
  }
}

export function renderPrograms(state){
  ensurePrograms(state);
  const wrap = document.getElementById('programTable');
  if (!wrap) return;
  const list = filterPrograms(state);
  const rows = list.map(program => {
    const modules = (program.moduleIds || []).map(id => state.modules.find(m => m.id === id)).filter(Boolean);
    const totalCredits = sumModuleCredits(modules);
    const tuition = calculateProgramCost(state, program);
    const moduleCount = modules.length;
    return `
      <tr data-program-id="${program.id}">
        <td><strong>${escapeHtml(program.name || '')}</strong><br><span class="muted small">${escapeHtml(resolveMajorName(state, program.majorId) || '(chưa chọn)')}</span></td>
        <td>${escapeHtml(program.academicYear || '')}</td>
        <td class="text-center">${moduleCount}</td>
        <td class="text-center">${totalCredits}</td>
        <td class="text-right">${formatCurrency(tuition)}</td>
        <td>
          <div class="action-links">
            <span class="action-link" data-act="edit" data-id="${program.id}">Sửa</span>
            <span class="action-link" data-act="del" data-id="${program.id}">Xoá</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  wrap.innerHTML = `
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Tên CTĐT / Chuyên ngành</th>
            <th>Năm học</th>
            <th>Số HP</th>
            <th>Tổng tín chỉ</th>
            <th>Học phí dự kiến (VND)</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6" class="muted">Chưa có CTĐT.</td></tr>'}</tbody>
      </table>
    </div>
  `;

  const countEl = document.getElementById('programCount');
  if (countEl) countEl.textContent = `${list.length} CTĐT`;

  wrap.querySelectorAll('.action-link').forEach(link => {
    link.addEventListener('click', ()=>{
      const id = link.getAttribute('data-id');
      const act = link.getAttribute('data-act');
      if (act === 'del'){
        if (!confirm('Xoá CTĐT này?')) return;
        state.programs = state.programs.filter(p => p.id !== id);
        save(state);
        toast('Đã xoá CTĐT', 'warn');
        renderPrograms(state);
        emitRefreshTuition();
      } else if (act === 'edit'){
        startEditProgram(state, id);
      }
    });
  });
}

function resetProgramForm(){
  const form = document.getElementById('programForm');
  if (!form) return;
  form.reset?.();
  const hiddenId = document.getElementById('programId');
  if (hiddenId) hiddenId.value = '';
}

function toggleProgramForm(show){
  const form = document.getElementById('programForm');
  if (!form) return;
  if (show){
    form.classList.remove('hidden');
  } else {
    form.classList.add('hidden');
  }
}

export function attachProgramHandlers(state, callbacks = {}){
  ensurePrograms(state);
  listeners = callbacks || {};
  const btnToggle = document.getElementById('btnToggleProgramForm');
  const btnCancel = document.getElementById('btnCancelProgram');
  const form = document.getElementById('programForm');
  const searchInput = document.getElementById('programSearch');
  const clearBtn = document.getElementById('btnClearProgramSearch');

  if (searchInput) searchInput.value = state.ui.programSearch || '';

  btnToggle?.addEventListener('click', ()=>{
    if (!form) return;
    const visible = !form.classList.contains('hidden');
    if (visible){
      toggleProgramForm(false);
      resetProgramForm();
    } else {
      populateMajorSelect(state, state.ui.selectedMajorForProgram || '');
      toggleProgramForm(true);
      resetProgramForm();
      document.getElementById('programName')?.focus?.();
    }
  });

  btnCancel?.addEventListener('click', ()=>{
    toggleProgramForm(false);
    resetProgramForm();
  });

  clearBtn?.addEventListener('click', ()=>{
    if (searchInput) searchInput.value = '';
    state.ui.programSearch = '';
    save(state);
    renderPrograms(state);
    emitRefreshTuition();
  });

  searchInput?.addEventListener('input', debounce(()=>{
    state.ui.programSearch = searchInput.value;
    save(state);
    renderPrograms(state);
    emitRefreshTuition();
  }, 160));

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const nameEl = document.getElementById('programName');
    const majorEl = document.getElementById('programMajor');
    const yearEl = document.getElementById('programYear');
    const codesEl = document.getElementById('programModules');
    const idEl = document.getElementById('programId');

    const name = (nameEl?.value || '').trim();
    if (!name){
      alert('Tên CTĐT là bắt buộc.');
      return;
    }
    const majorId = (majorEl?.value || '').trim();
    if (!majorId){
      alert('Hãy chọn chuyên ngành.');
      return;
    }
    const codes = parseModuleCodes(codesEl?.value || '');
    const { moduleIds, missing } = mapModules(state, codes);
    if (missing.length){
      alert(`Không tìm thấy các mã học phần: ${missing.join(', ')}.`);
      return;
    }
    const payload = {
      id: (idEl?.value || '').trim() || `prog-${Date.now().toString(36)}`,
      name,
      majorId,
      academicYear: (yearEl?.value || '').trim(),
      moduleIds,
      moduleCodes: codes
    };

    const idx = state.programs.findIndex(p => p.id === payload.id);
    if (idx >= 0){
      state.programs[idx] = { ...state.programs[idx], ...payload };
      toast('Đã cập nhật CTĐT', 'ok');
    } else {
      state.programs.push(payload);
      toast('Đã thêm CTĐT', 'ok');
    }
    state.tuition.selectedProgramId = payload.id;
    window.__FLASH_PROGRAM = payload.id;
    save(state);
    renderPrograms(state);
    emitRefreshTuition();
    toggleProgramForm(false);
    resetProgramForm();
  });
}

export function startEditProgram(state, id){
  ensurePrograms(state);
  const program = state.programs.find(p => p.id === id);
  if (!program) return;
  populateMajorSelect(state, program.majorId);
  document.getElementById('programId').value = program.id;
  document.getElementById('programName').value = program.name || '';
  document.getElementById('programMajor').value = program.majorId || '';
  document.getElementById('programYear').value = program.academicYear || '';
  document.getElementById('programModules').value = (program.moduleCodes || []).join(', ');
  toggleProgramForm(true);
  document.getElementById('programName')?.focus?.();
}
