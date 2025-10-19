// js/org.js
// Quản lý Cơ cấu tổ chức: render cây, CRUD node, chọn node

import { LEVELS, uid } from './data.js';
import { save } from './storage.js';
import { escapeHtml } from './utils.js';

/** Lấy level info theo type */
const levelOf = (type) => LEVELS.find(l => l.key === type);

/** Tạo helper index để tra cứu nhanh */
function indexById(arr){
  const m = new Map();
  for (const it of arr) m.set(it.id, it);
  return m;
}

/** Tính đường dẫn (breadcrumbs) đến node */
export function buildPathMap(orgs){
  const map = indexById(orgs);
  const pathMap = new Map();
  for (const node of orgs){
    const path = [];
    let cur = node;
    while(cur){
      path.unshift(cur);
      cur = cur.parentId ? map.get(cur.parentId) : null;
    }
    pathMap.set(node.id, path);
  }
  return pathMap;
}

/** Render cây tổ chức */
export function renderTree(state, onSelect){
  const { orgs, ui } = state;
  const container = document.getElementById('orgTree');
  // Lưu scroll hiện tại để tránh nhảy lên đầu khi re-render nhiều lần
  const prevScroll = container.scrollTop;
  container.innerHTML = '';

  const byParent = new Map();
  for (const n of orgs){
    const list = byParent.get(n.parentId || 'root') || [];
    list.push(n);
    byParent.set(n.parentId || 'root', list);
  }
  for (const [k, list] of byParent) list.sort((a,b)=>a.name.localeCompare(b.name,'vi'));

  const q = (ui.orgSearch||'').trim().toLowerCase();
  const showAll = q.length === 0;

  // precompute name matches
  const nameMatch = new Map(orgs.map(n => [n.id, n.name.toLowerCase().includes(q)]));

  // compute set of visible nodes: matches OR is ancestor of a match
  const visible = new Set();
  if (!showAll){
    const index = new Map(orgs.map(n => [n.id, n]));
    for (const n of orgs){
      if (nameMatch.get(n.id)){
        // add node and its ancestors
        let cur = n;
        while(cur){
          if (visible.has(cur.id)) break;
          visible.add(cur.id);
          cur = cur.parentId ? index.get(cur.parentId) : null;
        }
      }
    }
  }

  function makeNodeEl(node){
    const el = document.createElement('div');
    el.className = 'node' + (ui.selectedOrgId === node.id ? ' active' : '');
    const lvl = levelOf(node.type)?.name || node.type;
    // highlight match
    let label = node.name;
    if (!showAll && nameMatch.get(node.id)){
      const i = node.name.toLowerCase().indexOf(q);
      if (i >= 0){
        const a = node.name.slice(0,i);
        const b = node.name.slice(i, i+q.length);
        const c = node.name.slice(i+q.length);
        label = `${escapeHtml(a)}<mark>${escapeHtml(b)}</mark>${escapeHtml(c)}`;
      }
    } else {
      label = escapeHtml(label);
    }
  el.innerHTML = `<span class=\"badge gray\">${lvl}</span><span>${label}</span>`;
    el.setAttribute('data-org-id', node.id);
    el.addEventListener('click', (e)=>{
      e.stopPropagation();
      ui.selectedOrgId = node.id;
      save(state);
      renderTree(state, onSelect);
      onSelect?.(node);
    });
    return el;
  }

  function build(parentId, parentEl){
    const children = byParent.get(parentId) || [];
    for (const c of children){
      if (!showAll && !visible.has(c.id)) continue;
      const cEl = makeNodeEl(c);
      parentEl.appendChild(cEl);
      const wrapper = document.createElement('div');
      wrapper.className = 'children';
      parentEl.appendChild(wrapper);
      build(c.id, wrapper);
    }
  }

  const rootWrap = document.createElement('div');
  container.appendChild(rootWrap);
  build('root', rootWrap);
  // empty state when filtering
  if (rootWrap.childElementCount === 0){
    const p = document.createElement('div');
    p.className = 'muted small';
    p.style.padding = '8px';
    p.textContent = 'Không có kết quả phù hợp. Hãy thử từ khóa khác.';
    container.appendChild(p);
  }

  // Khôi phục scroll nếu vẫn còn nội dung tương tự
  if (prevScroll && container.scrollHeight > prevScroll){
    container.scrollTop = prevScroll;
  }

  // Tự động đưa node đang chọn vào trong vùng nhìn nếu bị khuất
  if (ui.selectedOrgId){
    const activeEl = container.querySelector('.node.active');
    if (activeEl){
      const rect = activeEl.getBoundingClientRect();
      const crect = container.getBoundingClientRect();
      if (rect.top < crect.top + 10 || rect.bottom > crect.bottom - 10){
        activeEl.scrollIntoView({block:'center'});
      }
    }
  }
}

// escapeHtml moved to utils.js

/** Cập nhật breadcrumb */
export function renderBreadcrumb(state){
  const { orgs, ui } = state;
  const bc = document.getElementById('orgBreadcrumb');
  bc.innerHTML = '';
  if (!ui.selectedOrgId) return;
  const pathMap = buildPathMap(orgs);
  const path = pathMap.get(ui.selectedOrgId) || [];
  for (const p of path){
    const span = document.createElement('span');
    span.className = 'lvl';
    span.textContent = p.name;
    bc.appendChild(span);
  }
}

/** Thêm cấp con cho node được chọn */
export function addChild(state){
  const { orgs, ui } = state;
  const parent = orgs.find(o => o.id === ui.selectedOrgId);
  if (!parent){
    alert('Hãy chọn một nút trước.');
    return;
  }
  const parentLevel = levelOf(parent.type);
  if (!parentLevel?.child){
    alert('Cấp này không có cấp con.');
    return;
  }
  const childType = parentLevel.child;
  const childName = prompt(`Nhập tên ${levelOf(childType).name} mới:`);
  if (!childName) return;
  const newNode = { id: uid(), type: childType, name: childName.trim(), parentId: parent.id };
  orgs.push(newNode);
  save(state);
  window.__FLASH_ORG = newNode.id;
  // Offline mode: không đồng bộ backend
}

/** Đổi tên nút */
export function renameNode(state){
  const { orgs, ui } = state;
  const node = orgs.find(o => o.id === ui.selectedOrgId);
  if (!node){ alert('Chưa chọn nút.'); return; }
  const name = prompt('Tên mới:', node.name);
  if (!name) return;
  const oldName = node.name;
  node.name = name.trim();
  save(state);
  window.__FLASH_ORG = node.id;
  // Offline mode: không gọi API
}

/** Xoá nút (cả cây con) + tách nhân viên ra khỏi nút đã xoá */
export function deleteNode(state){
  const { orgs, employees, ui } = state;
  const node = orgs.find(o => o.id === ui.selectedOrgId);
  if (!node){ alert('Chưa chọn nút.'); return; }
  if (!confirm('Xoá nút này và toàn bộ cấp con?')) return;

  // thu thập id con cháu
  const toDelete = new Set();
  const collect = (id)=>{
    toDelete.add(id);
    for (const c of orgs.filter(x=>x.parentId===id)) collect(c.id);
  };
  collect(node.id);

  // xoá orgs
  state.orgs = orgs.filter(o=>!toDelete.has(o.id));

  // gỡ nhân viên gắn với các org đã xoá
  for (const emp of employees){
    if (toDelete.has(emp.orgId)) emp.orgId = null;
  }
  ui.selectedOrgId = null;
  save(state);
  // Offline mode: không gọi API
}
