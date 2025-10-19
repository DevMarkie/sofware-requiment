// js/modules.js
// Quản lý Học phần (modules) gắn với org type 'course'

import { save } from './storage.js';
import { uid } from './data.js';
import { escapeHtml } from './utils.js';
import { renderPrograms } from './programs.js';
import { renderTuition } from './tuition.js';

export function ensureModulesArray(state){
  if (!Array.isArray(state.modules)) state.modules = [];
}

function parseListInput(raw){
  return (raw || '')
    .split(/[\n,]/)
    .map(part => part.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function dedupe(list){
  return Array.from(new Set(list));
}

function formatRelation(label, list){
  if (!list || list.length === 0) return '';
  const chips = list.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join('');
  return `<div class="chip-group"><span class="chip chip-label">${label}</span>${chips}</div>`;
}

function formatRelations(module){
  const blocks = [
    formatRelation('Tiên quyết', module.prerequisites),
    formatRelation('Song hành', module.corequisites),
    formatRelation('Học trước', module.previousCourses)
  ].filter(Boolean);
  return blocks.length ? blocks.join('') : '<span class="muted small">—</span>';
}

function deriveDepartmentId(state, courseId){
  if (!courseId || !Array.isArray(state.orgs)) return null;
  const byId = new Map(state.orgs.map(o => [o.id, o]));
  let current = byId.get(courseId);
  while (current){
    if (current.type === 'school') return current.id;
    current = current.parentId ? byId.get(current.parentId) : null;
  }
  return null;
}

function resolveDepartmentName(state, module){
  const deptId = module.departmentId || deriveDepartmentId(state, module.courseId);
  if (!deptId || !Array.isArray(state.orgs)) return '';
  const dept = state.orgs.find(o => o.id === deptId);
  return dept?.name || '';
}

function populateDepartmentSelect(state, selectedId, courseId){
  const select = document.getElementById('moduleDepartment');
  if (!select) return;
  const orgs = Array.isArray(state.orgs) ? state.orgs : [];
  const options = orgs.filter(o => o.type === 'school').sort((a,b)=>a.name.localeCompare(b.name,'vi'));
  const frag = document.createDocumentFragment();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '— Chọn khoa —';
  frag.appendChild(placeholder);
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.id;
    option.textContent = opt.name;
    frag.appendChild(option);
  });
  select.innerHTML = '';
  select.appendChild(frag);
  const fallback = selectedId || deriveDepartmentId(state, courseId);
  if (fallback) select.value = fallback;
}

function generateCodeFromName(name){
  if (!name) return '';
  const normalized = name.normalize ? name.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : name;
  return normalized
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 24)
    .toUpperCase();
}

function syncProgramsAfterModuleChange(state, nextModule, prevModule){
  if (!Array.isArray(state.programs)) return;
  const prevCode = prevModule?.code ? String(prevModule.code).toUpperCase() : null;
  const newCode = nextModule?.code ? String(nextModule.code).toUpperCase() : null;
  for (const program of state.programs){
    if (!Array.isArray(program.moduleIds) || !program.moduleIds.includes(nextModule.id)) continue;
    if (!Array.isArray(program.moduleCodes)) program.moduleCodes = [];

    if (prevCode && prevCode !== newCode){
      const idxPrev = program.moduleCodes.findIndex(code => String(code || '').toUpperCase() === prevCode);
      if (idxPrev >= 0){
        if (newCode){
          program.moduleCodes[idxPrev] = nextModule.code;
        } else {
          program.moduleCodes.splice(idxPrev, 1);
        }
      }
    }

    if (newCode){
      const exists = program.moduleCodes.some(code => String(code || '').toUpperCase() === newCode);
      if (!exists){
        program.moduleCodes.push(nextModule.code);
      }
    }
  }
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
  const list = filterModules(state);
  const rows = list.map(m => {
    const theory = m.theoryCredits ?? 0;
    const practice = m.practiceCredits ?? 0;
    const total = (Number.isFinite(m.credits) && m.credits !== undefined)
      ? m.credits
      : theory + practice;
    const relationsHtml = formatRelations(m);
    const deptName = resolveDepartmentName(state, m);
    const departmentCell = deptName ? escapeHtml(deptName) : '<span class="muted small">—</span>';
    return `
      <tr>
        <td><strong>${escapeHtml(m.code || '')}</strong></td>
        <td>${escapeHtml(m.name || '')}</td>
        <td class="text-center">${total}</td>
        <td>
          <div class="chip-pair">
            <span class="chip chip-mono">LT: ${theory}</span>
            <span class="chip chip-mono">TH: ${practice}</span>
          </div>
        </td>
        <td>${relationsHtml}</td>
        <td>${departmentCell}</td>
        <td>
          <div class="action-links">
            <span class="action-link" data-act="edit" data-id="${m.id}">Sửa</span>
            <span class="action-link" data-act="del" data-id="${m.id}">Xoá</span>
          </div>
        </td>
      </tr>`;
  }).join('');
  tableWrap.innerHTML = `
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên học phần</th>
            <th>Tổng TC</th>
            <th>LT / TH</th>
            <th>Quan hệ học phần</th>
            <th>Khoa quản lý</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7" class="muted">Không có học phần.</td></tr>'}</tbody>
      </table>
    </div>`;
  tableWrap.querySelectorAll('.action-link').forEach(a => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('data-id');
      const act = a.getAttribute('data-act');
      if (act === 'del'){
        if (confirm('Xoá học phần này?')){
          const removed = state.modules.find(x => x.id === id);
          state.modules = state.modules.filter(x => x.id !== id);

          if (Array.isArray(state.programs) && removed){
            const removedCode = String(removed.code || '').toUpperCase();
            let touched = false;
            for (const program of state.programs){
              const ids = Array.isArray(program.moduleIds) ? program.moduleIds : [];
              const codes = Array.isArray(program.moduleCodes) ? program.moduleCodes : [];
              const nextIds = ids.filter(mid => mid !== id);
              const nextCodes = removedCode ? codes.filter(code => String(code || '').toUpperCase() !== removedCode) : codes;
              if (nextIds.length !== ids.length || nextCodes.length !== codes.length){
                program.moduleIds = nextIds;
                program.moduleCodes = nextCodes;
                touched = true;
              }
            }
          }
          save(state);
          renderModules(state);
          renderPrograms(state);
          renderTuition(state);
        }
      } else if (act === 'edit'){
        startEditModule(state, id);
      }
    });
  });
}

export function startEditModule(state, id){
  const form = document.getElementById('moduleForm');
  const m = state.modules.find(x=>x.id===id);
  if (!m || !form) return;
  populateDepartmentSelect(state, m.departmentId || null, m.courseId);
  form.classList.remove('hidden');
  document.getElementById('moduleId').value = m.id;
  document.getElementById('moduleCode').value = m.code || '';
  document.getElementById('moduleName').value = m.name || '';
  const totalCredits = (Number.isFinite(m.credits) && m.credits !== undefined)
    ? m.credits
    : (m.theoryCredits || 0) + (m.practiceCredits || 0);
  document.getElementById('moduleCredits').value = totalCredits;
  document.getElementById('moduleTheoryCredits').value = m.theoryCredits ?? 0;
  document.getElementById('modulePracticeCredits').value = m.practiceCredits ?? 0;
  document.getElementById('modulePrereq').value = (m.prerequisites || []).join(', ');
  document.getElementById('moduleCoreq').value = (m.corequisites || []).join(', ');
  document.getElementById('modulePrior').value = (m.previousCourses || []).join(', ');
}

export function attachModuleHandlers(state){
  ensureModulesArray(state);
  const btnAdd = document.getElementById('btnAddModule');
  const form = document.getElementById('moduleForm');
  const cancel = document.getElementById('btnCancelModule');
  const search = document.getElementById('moduleSearch');
  const btnClear = document.getElementById('btnClearModuleSearch');
  const codeInput = document.getElementById('moduleCode');
  const nameInput = document.getElementById('moduleName');
  const creditsInput = document.getElementById('moduleCredits');
  const theoryInput = document.getElementById('moduleTheoryCredits');
  const practiceInput = document.getElementById('modulePracticeCredits');
  const deptSelect = document.getElementById('moduleDepartment');
  const prereqInput = document.getElementById('modulePrereq');
  const coreqInput = document.getElementById('moduleCoreq');
  const priorInput = document.getElementById('modulePrior');

  btnAdd?.addEventListener('click', ()=>{
    if (state.ui.selectedOrgType !== 'course'){
      alert('Hãy chọn một Môn học trong cây trước.');
      return;
    }
    const courseId = state.ui.selectedOrgId;
    populateDepartmentSelect(state, null, courseId);
    form?.reset?.();
    document.getElementById('moduleId').value='';
    if (codeInput) codeInput.value='';
    if (nameInput) nameInput.value='';
    if (creditsInput) creditsInput.value='';
    if (theoryInput) theoryInput.value=0;
    if (practiceInput) practiceInput.value=0;
    if (prereqInput) prereqInput.value='';
    if (coreqInput) coreqInput.value='';
    if (priorInput) priorInput.value='';
    form.classList.remove('hidden');
    codeInput?.focus?.();
  });
  cancel?.addEventListener('click', ()=>{ form.classList.add('hidden'); });
  form?.addEventListener('submit', async e=>{
    e.preventDefault();
    if (state.ui.selectedOrgType !== 'course'){
      alert('Chưa chọn Môn học.');
      return;
    }
    const courseId = state.ui.selectedOrgId;
    const existingId = document.getElementById('moduleId').value.trim();
    const id = existingId || uid();
    const name = nameInput?.value.trim() || '';
    if (!name){
      alert('Tên học phần bắt buộc.');
      return;
    }
    let code = codeInput?.value.trim() || '';
    if (!code) code = generateCodeFromName(name);
    if (!code) code = `HP-${uid().slice(0,5).toUpperCase()}`;
    const theory = Math.max(0, parseInt(theoryInput?.value,10) || 0);
    const practice = Math.max(0, parseInt(practiceInput?.value,10) || 0);
    let credits = Math.max(0, parseInt(creditsInput?.value,10) || 0);
    if (!credits && (theory || practice)) credits = theory + practice;
    const prerequisites = dedupe(parseListInput(prereqInput?.value));
    const corequisites = dedupe(parseListInput(coreqInput?.value));
    const previousCourses = dedupe(parseListInput(priorInput?.value));
    const departmentId = (deptSelect?.value || '').trim() || deriveDepartmentId(state, courseId);
    const duplicate = state.modules.some(m => (
      m.courseId === courseId &&
      m.id !== id &&
      (m.code || '').toLowerCase() === code.toLowerCase()
    ));
    if (duplicate){
      alert('Mã học phần đã tồn tại trong môn này.');
      return;
    }
    const payload = {
      id,
      courseId,
      name,
      code,
      credits,
      theoryCredits: theory,
      practiceCredits: practice,
      prerequisites,
      corequisites,
      previousCourses,
      departmentId
    };
    const idx = state.modules.findIndex(x => x.id === id);
    const prevModule = idx >= 0 ? { ...state.modules[idx] } : null;
    if (idx >= 0){
      state.modules[idx] = { ...state.modules[idx], ...payload };
    } else {
      state.modules.push(payload);
    }
    syncProgramsAfterModuleChange(state, payload, prevModule);
    save(state);
    form.classList.add('hidden');
    renderModules(state);
    renderPrograms(state);
    renderTuition(state);
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
