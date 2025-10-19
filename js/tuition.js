// js/tuition.js
// Tính toán học phí theo CTĐT và bộ môn

import { save } from './storage.js';
import { debounce, escapeHtml } from './utils.js';

function ensureTuition(state){
  if (!state.tuition || typeof state.tuition !== 'object'){
    state.tuition = { theoryRate: 350000, practiceRate: 280000, selectedProgramId: '' };
  }
  if (typeof state.tuition.theoryRate !== 'number') state.tuition.theoryRate = 350000;
  if (typeof state.tuition.practiceRate !== 'number') state.tuition.practiceRate = 280000;
  if (typeof state.tuition.quickCredits !== 'number') state.tuition.quickCredits = 0;
  if (typeof state.tuition.quickRate !== 'number') state.tuition.quickRate = state.tuition.theoryRate;
  if (typeof state.tuition.quickResult !== 'number') state.tuition.quickResult = 0;
}

export function sumModuleCredits(list){
  return (list || []).reduce((total, mod) => {
    if (!mod) return total;
    if (Number.isFinite(mod.credits)) return total + Number(mod.credits);
    const theory = Number.isFinite(mod.theoryCredits) ? Number(mod.theoryCredits) : 0;
    const practice = Number.isFinite(mod.practiceCredits) ? Number(mod.practiceCredits) : 0;
    return total + theory + practice;
  }, 0);
}

export function calculateModuleCost(state, mod){
  ensureTuition(state);
  if (!mod) return 0;
  const theory = Number.isFinite(mod.theoryCredits) ? Number(mod.theoryCredits) : 0;
  const practice = Number.isFinite(mod.practiceCredits) ? Number(mod.practiceCredits) : 0;
  const total = Number.isFinite(mod.credits) ? Number(mod.credits) : theory + practice;
  if (!theory && !practice && total){
    return total * state.tuition.theoryRate;
  }
  return (theory * state.tuition.theoryRate) + (practice * state.tuition.practiceRate);
}

export function calculateProgramCost(state, program){
  ensureTuition(state);
  if (!program) return 0;
  const modules = (program.moduleIds || []).map(id => state.modules.find(m => m.id === id)).filter(Boolean);
  return modules.reduce((sum, mod) => sum + calculateModuleCost(state, mod), 0);
}

function formatCurrency(amount){
  if (!Number.isFinite(amount) || amount <= 0) return '0';
  try {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  } catch {
    return `${Math.round(amount)}`;
  }
}

function getProgramById(state, id){
  return Array.isArray(state.programs) ? state.programs.find(p => p.id === id) : null;
}

function getModulesForProgram(state, program){
  if (!program) return [];
  return (program.moduleIds || []).map(id => state.modules.find(m => m.id === id)).filter(Boolean);
}

function populateProgramSelect(state){
  const select = document.getElementById('tuitionProgramSelect');
  if (!select) return;
  const programs = Array.isArray(state.programs) ? state.programs : [];
  const frag = document.createDocumentFragment();
  if (!programs.length){
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Chưa có CTĐT';
    frag.appendChild(opt);
    select.innerHTML = '';
    select.appendChild(frag);
    select.disabled = true;
    return;
  }
  select.disabled = false;
  programs.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'))
    .forEach(program => {
      const opt = document.createElement('option');
      opt.value = program.id;
      opt.textContent = program.name;
      frag.appendChild(opt);
    });
  select.innerHTML = '';
  select.appendChild(frag);
  if (state.tuition.selectedProgramId){
    select.value = state.tuition.selectedProgramId;
  }
  if (!select.value && programs.length){
    select.value = programs[0].id;
    state.tuition.selectedProgramId = select.value;
  }
}

export function renderTuition(state){
  ensureTuition(state);
  populateProgramSelect(state);
  const program = getProgramById(state, state.tuition.selectedProgramId);
  const modules = getModulesForProgram(state, program);
  const tableWrap = document.getElementById('tuitionModuleTable');
  const summary = document.getElementById('tuitionSummary');
  const theoryInput = document.getElementById('tuitionRateTheory');
  const practiceInput = document.getElementById('tuitionRatePractice');
  const quickCredits = document.getElementById('tuitionQuickCredits');
  const quickRate = document.getElementById('tuitionQuickRate');
  const quickResult = document.getElementById('tuitionQuickResult');

  if (theoryInput) theoryInput.value = state.tuition.theoryRate || 0;
  if (practiceInput) practiceInput.value = state.tuition.practiceRate || 0;
  if (quickCredits) quickCredits.value = state.tuition.quickCredits || 0;
  if (quickRate) quickRate.value = state.tuition.quickRate || 0;
  if (quickResult) quickResult.textContent = state.tuition.quickResult > 0
    ? `Tổng học phí: ${formatCurrency(state.tuition.quickResult)} VND`
    : 'Nhập số liệu để xem tổng học phí dự kiến.';

  if (!tableWrap) return;
  if (!program){
    tableWrap.innerHTML = '<div class="table"><table><tbody><tr><td class="muted">Chưa có CTĐT để tính toán.</td></tr></tbody></table></div>';
    if (summary) summary.textContent = 'Thêm CTĐT để bắt đầu tính học phí.';
    return;
  }

  const rows = modules.map(mod => {
    const theory = Number.isFinite(mod.theoryCredits) ? Number(mod.theoryCredits) : 0;
    const practice = Number.isFinite(mod.practiceCredits) ? Number(mod.practiceCredits) : 0;
    const totalCredits = Number.isFinite(mod.credits) ? Number(mod.credits) : (theory + practice);
    const cost = calculateModuleCost(state, mod);
    return `
      <tr>
        <td><strong>${escapeHtml(mod.code || '')}</strong></td>
        <td>${escapeHtml(mod.name || '')}</td>
        <td class="text-center">${theory}</td>
        <td class="text-center">${practice}</td>
        <td class="text-center">${totalCredits}</td>
        <td class="text-right">${formatCurrency(cost)}</td>
      </tr>
    `;
  }).join('');

  tableWrap.innerHTML = `
    <div class="table">
      <table>
        <thead>
          <tr>
            <th>Mã học phần</th>
            <th>Tên học phần</th>
            <th>TC LT</th>
            <th>TC TH</th>
            <th>Tổng TC</th>
            <th>Học phí (VND)</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6" class="muted">CTĐT chưa có học phần.</td></tr>'}</tbody>
      </table>
    </div>
  `;

  const totalCredits = sumModuleCredits(modules);
  const totalCost = calculateProgramCost(state, program);
  if (summary){
    summary.textContent = `Tổng ${modules.length} học phần · ${totalCredits} tín chỉ · ${formatCurrency(totalCost)} VND`;
  }
}

export function attachTuitionHandlers(state, callbacks = {}){
  ensureTuition(state);
  const select = document.getElementById('tuitionProgramSelect');
  const theoryInput = document.getElementById('tuitionRateTheory');
  const practiceInput = document.getElementById('tuitionRatePractice');
  const quickForm = document.getElementById('tuitionQuickForm');
  const quickReset = document.getElementById('btnResetQuickTuition');
  const quickCredits = document.getElementById('tuitionQuickCredits');
  const quickRate = document.getElementById('tuitionQuickRate');

  select?.addEventListener('change', ()=>{
    state.tuition.selectedProgramId = select.value;
    save(state);
    renderTuition(state);
  });

  const handleRateChange = debounce(()=>{
    const theory = parseFloat(theoryInput?.value || '0');
    const practice = parseFloat(practiceInput?.value || '0');
    state.tuition.theoryRate = Math.max(0, Number.isFinite(theory) ? theory : 0);
    state.tuition.practiceRate = Math.max(0, Number.isFinite(practice) ? practice : 0);
    save(state);
    renderTuition(state);
    callbacks.refreshPrograms?.();
  }, 180);

  theoryInput?.addEventListener('input', handleRateChange);
  practiceInput?.addEventListener('input', handleRateChange);

  quickForm?.addEventListener('submit', e => {
    e.preventDefault();
    const credits = parseFloat(quickCredits?.value || '0');
    const rate = parseFloat(quickRate?.value || '0');
    const total = Math.max(0, credits) * Math.max(0, rate);
    state.tuition.quickCredits = Math.max(0, credits);
    state.tuition.quickRate = Math.max(0, rate);
    state.tuition.quickResult = total;
    save(state);
    renderTuition(state);
  });

  quickReset?.addEventListener('click', ()=>{
    state.tuition.quickCredits = 0;
    state.tuition.quickRate = state.tuition.theoryRate;
    state.tuition.quickResult = 0;
    save(state);
    renderTuition(state);
  });
}
