/**
 * SCRIPTA Demo - Context Menu
 * 
 * Right-click context menu for tree nodes.
 */

import { state } from './state.mjs';
import { $, $$, genId, openModal, closeModal } from './utils.mjs';
import { findNode, findParent, addChild, renderTree } from './tree.mjs';
import { generateCNL } from './cnl.mjs';
import { showSelectModal, showBlockModal, showActionModal, editNodeProps } from './entities.mjs';

export function setupContextMenu() {
  document.addEventListener('click', () => $('#context-menu').classList.remove('open'));
  
  document.addEventListener('click', e => {
    const item = e.target.closest('.context-menu-item');
    if (!item) return;
    const { action, id } = item.dataset;
    handleContextAction(action, id);
  });
}

window.showCtx = (e, id) => {
  e.preventDefault();
  const n = findNode(id);
  const m = $('#context-menu');
  let items = [];
  
  if (n.type === 'book' || n.type === 'chapter') {
    items.push({ a: 'add-chapter', l: '+ Chapter' }, { a: 'add-scene', l: '+ Scene' });
  }
  if (n.type === 'scene') {
    items.push(
      { a: 'add-char', l: '+ Character' },
      { a: 'add-loc', l: '+ Location' },
      { a: 'add-obj', l: '+ Object' },
      { a: 'add-mood', l: '+ Mood' },
      { a: 'add-block', l: '+ Narrative Block' },
      { a: 'add-action', l: '+ Action' }
    );
  }
  items.push({ a: 'div' }, { a: 'edit', l: 'Edit' }, { a: 'delete', l: 'Delete' });
  
  m.innerHTML = items.map(i => 
    i.a === 'div' 
      ? '<div class="context-menu-divider"></div>' 
      : `<div class="context-menu-item" data-action="${i.a}" data-id="${id}">${i.l}</div>`
  ).join('');
  
  m.style.left = e.pageX + 'px';
  m.style.top = e.pageY + 'px';
  m.classList.add('open');
};

function handleContextAction(action, id) {
  const n = findNode(id);
  if (!n) return;
  
  if (action === 'add-chapter') {
    addChild(n, { type: 'chapter', name: `Ch${(n.children?.length || 0) + 1}`, title: '', children: [] });
  }
  if (action === 'add-scene') {
    addChild(n, { type: 'scene', name: `Sc${(n.children?.length || 0) + 1}`, title: '', children: [] });
  }
  if (action === 'add-char') showSelectModal('characters', n);
  if (action === 'add-loc') showSelectModal('locations', n);
  if (action === 'add-obj') showSelectModal('objects', n);
  if (action === 'add-mood') showSelectModal('moods', n);
  if (action === 'add-block') showBlockModal(n);
  if (action === 'add-action') showActionModal(n);
  if (action === 'edit') editNodeProps(n);
  if (action === 'delete') {
    if (state.project.structure?.id === id) {
      state.project.structure = null;
    } else {
      const p = findParent(id);
      if (p) p.children = p.children.filter(c => c.id !== id);
    }
    state.selectedNode = null;
    renderTree();
  }
}
