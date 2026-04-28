'use strict';

const API = 'https://api.hicke.se/api/todos';
let apiKey = '';
let todos = [];
let modalDate = isoToday();
let editingId = null;

// ── date helpers ──────────────────────────────────────────────────────────────

function isoToday() { return new Date().toISOString().slice(0, 10); }
function isoTomorrow() { return new Date(Date.now() + 86400000).toISOString().slice(0, 10); }

function dateLabel(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-SE', { weekday: 'short', month: 'short', day: 'numeric' });
}

function offsetDate(n) {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}

// ── API ───────────────────────────────────────────────────────────────────────

function tf(path, opts) {
  return fetch(API.replace('/api/todos', '') + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey, ...(opts && opts.headers) }
  });
}

async function load() {
  const r = await tf('/api/todos');
  if (!r.ok) throw new Error('API ' + r.status);
  todos = await r.json();
}

async function apiToggle(id, done, cascade) {
  await tf('/api/todos/' + id, {
    method: 'PATCH',
    body: JSON.stringify({ done: done, cascade: !!cascade })
  });
}

async function apiDelete(id) {
  await tf('/api/todos/' + id, { method: 'DELETE' });
}

async function apiAdd(text, dueDate, url) {
  await tf('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ text, due_date: dueDate || null, url: url || null })
  });
}

async function apiEdit(id, text) {
  await tf('/api/todos/' + id, {
    method: 'PATCH',
    body: JSON.stringify({ text })
  });
}

// ── grouping ──────────────────────────────────────────────────────────────────

function groupTodos() {
  const today = isoToday();
  const tomorrow = isoTomorrow();
  const cutoff = offsetDate(6);
  const overdue = [], todayList = [], tomorrowList = [];
  const near = {}, beyond = [], someday = [];

  todos.forEach(function(t) {
    if (t.parent_id !== null) return;
    const dd = t.due_date || '';
    if (!dd)           { someday.push(t); return; }
    if (dd < today)    { overdue.push(t); return; }
    if (dd === today)  { todayList.push(t); return; }
    if (dd === tomorrow) { tomorrowList.push(t); return; }
    if (dd <= cutoff)  { if (!near[dd]) near[dd] = []; near[dd].push(t); return; }
    beyond.push(t);
  });

  beyond.sort(function(a, b) { return a.due_date < b.due_date ? -1 : 1; });

  return { overdue, today: todayList, tomorrow: tomorrowList, near, beyond: beyond.slice(0, 5), someday };
}

function getChildren(parentId) {
  return todos.filter(function(t) { return t.parent_id === parentId; });
}

// ── render ────────────────────────────────────────────────────────────────────

const openSections = { today: true, tomorrow: true };

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function doneClass(done) {
  return done === 2 ? ' done' : done === 1 ? ' in-progress' : '';
}
function buildRow(t, showDate) {
  const children = getChildren(t.id);
  const linkHtml = t.url
    ? '<a href="' + esc(t.url) + '" target="_blank" class="todo-link">Link</a>'
    : '';
  const dateTag = showDate && t.due_date
    ? '<span style="font-size:0.62rem;color:var(--faint);margin-left:0.25rem">(' + dateLabel(t.due_date) + ')</span>'
    : '';
  const subCount = children.length
    ? '<span style="font-size:0.65rem;color:var(--faint);margin-left:0.2rem">(' + children.filter(c => c.done === 2).length + '/' + children.length + ')</span>'
    : '';

  let html = '<div class="todo-row' + doneClass(t.done) + '" data-id="' + t.id + '">'
    + '<span class="todo-check' + (t.done === 1 ? ' in-progress' : '') + '" data-action="toggle" data-id="' + t.id + '" data-done="' + t.done + '" data-parent="true">' + (t.done === 2 ? '&#x2714;' : '') + '</span>'
    + '<span class="todo-text" data-action="edit" data-id="' + t.id + '" data-text="' + esc(t.text) + '">' + esc(t.text) + subCount + dateTag + '</span>'
    + linkHtml
    + '<span class="todo-del" data-action="delete" data-id="' + t.id + '">&#x2715;</span>'
    + '</div>';

  children.forEach(function(c) {
    const clinkHtml = c.url
      ? '<a href="' + esc(c.url) + '" target="_blank" class="todo-link">Link</a>'
      : '';
    html += '<div class="todo-row subtask' + doneClass(c.done) + '" data-id="' + c.id + '">'
      + '<span class="todo-check' + (c.done === 1 ? ' in-progress' : '') + '" data-action="toggle" data-id="' + c.id + '" data-done="' + c.done + '" data-parent="false">' + (c.done === 2 ? '&#x2714;' : '') + '</span>'
      + '<span class="todo-text" data-action="edit" data-id="' + c.id + '" data-text="' + esc(c.text) + '">' + esc(c.text) + '</span>'
      + clinkHtml
      + '<span class="todo-del" data-action="delete" data-id="' + c.id + '">&#x2715;</span>'
      + '</div>';
  });

  return html;
}

function buildSection(key, label, items, cls, addDate, showDate) {
  const isOpen = openSections[key] === true;
  const arrow = '<span class="sec-arrow' + (isOpen ? ' open' : '') + '">&#x25B6;</span>';
  const count = items.length ? '<span class="sec-count">' + items.length + ' task' + (items.length !== 1 ? 's' : '') + '</span>' : '';
  const rows = items.map(function(t) { return buildRow(t, showDate); }).join('');
  const addBtn = addDate !== null
    ? '<div class="sec-add" data-action="add" data-date="' + (addDate || '') + '">+ Add task</div>'
    : '';
  return '<div class="section">'
    + '<div class="sec-hdr' + (cls ? ' ' + cls : '') + '" data-toggle="' + key + '">'
    + '<span class="sec-label">' + label + '</span>' + count + arrow
    + '</div>'
    + '<div class="sec-body' + (isOpen ? ' open' : '') + '">' + rows + addBtn + '</div>'
    + '</div>';
}

function render() {
  const g = groupTodos();
  const today = isoToday();
  const tomorrow = isoTomorrow();
  const parts = [];

  if (g.overdue.length) {
    parts.push(buildSection('overdue', 'Overdue', g.overdue, 'overdue', today, false));
  }
  parts.push(buildSection('today', 'Today — ' + dateLabel(today), g.today, 'today', today, false));
  parts.push(buildSection('tomorrow', 'Tomorrow — ' + dateLabel(tomorrow), g.tomorrow, '', tomorrow, false));

  const nearDates = Object.keys(g.near).sort();
  nearDates.forEach(function(d) {
    parts.push(buildSection('day-' + d, dateLabel(d), g.near[d], '', d, false));
  });

  if (g.beyond.length) {
    parts.push(buildSection('future', 'Future', g.beyond, '', null, true));
  }
  parts.push(buildSection('someday', 'Someday', g.someday, '', '', false));

  document.getElementById('app').innerHTML = parts.join('');
  attachListeners();
}

function attachListeners() {
  document.querySelectorAll('[data-toggle]').forEach(function(el) {
    el.addEventListener('click', function() {
      const key = el.dataset.toggle;
      openSections[key] = !openSections[key];
      render();
    });
  });

  document.querySelectorAll('[data-action="toggle"]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(el.dataset.id);
      const done = parseInt(el.dataset.done);
      const next = (done + 1) % 3;
      const cascade = el.dataset.parent === 'true' && next === 2;
      apiToggle(id, next, cascade).then(refresh);
    });
  });

  document.querySelectorAll('[data-action="edit"]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      openModal(parseInt(el.dataset.id), el.dataset.text, null);
    });
  });

  document.querySelectorAll('[data-action="delete"]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      apiDelete(parseInt(el.dataset.id)).then(refresh);
    });
  });

  document.querySelectorAll('[data-action="add"]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      openModal(null, '', el.dataset.date || null);
    });
  });
}

// ── modal ─────────────────────────────────────────────────────────────────────

function openModal(id, text, date) {
  editingId = id;
  modalDate = date !== null && date !== undefined ? date : isoToday();
  document.getElementById('modal-text').value = text || '';
  document.getElementById('modal-url').value = '';
  document.getElementById('modal-url').style.display = id ? 'none' : '';
  document.getElementById('modal-title').textContent = id ? 'Edit Task' : 'Add Todo';
  document.getElementById('modal-save').textContent = id ? 'Save' : 'Add';
  syncDateBtns();
  document.getElementById('modal').classList.add('show');
  setTimeout(function() { document.getElementById('modal-text').focus(); }, 50);
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
  editingId = null;
}

function syncDateBtns() {
  document.querySelectorAll('.date-btn').forEach(function(btn) {
    const d = btn.dataset.date;
    const active = (d === 'today' && modalDate === isoToday())
                || (d === 'tomorrow' && modalDate === isoTomorrow())
                || (d === 'someday' && !modalDate);
    btn.classList.toggle('active', active);
  });
  const dateRow = document.querySelector('.modal-dates');
  if (dateRow) dateRow.style.display = editingId ? 'none' : '';
}

function saveModal() {
  const text = document.getElementById('modal-text').value.trim();
  if (!text) return;
  const url = document.getElementById('modal-url').value.trim();
  const date = modalDate === 'someday' ? null : modalDate || null;

  let p;
  if (editingId) {
    p = apiEdit(editingId, text);
  } else {
    p = apiAdd(text, date, url);
  }
  p.then(refresh).catch(console.error);
  closeModal();
}

// ── init ──────────────────────────────────────────────────────────────────────

async function refresh() {
  await load();
  render();
  chrome.runtime.sendMessage('refresh');
}

async function init() {
  const data = await new Promise(resolve => chrome.storage.sync.get('apiKey', resolve));
  apiKey = data.apiKey || '';

  if (!apiKey) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = '';
    document.getElementById('app').innerHTML =
      '<div class="no-key">No API key set. <a href="#" id="open-opts">Open settings</a></div>';
    document.getElementById('open-opts').addEventListener('click', function(e) {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
    return;
  }

  try {
    await load();
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = '';
    render();
  } catch (err) {
    document.getElementById('loading').textContent = 'Error: ' + err.message;
  }
}

// header buttons
document.getElementById('add-btn').addEventListener('click', function() {
  openModal(null, '', isoToday());
});
document.getElementById('settings-btn').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});

// modal controls
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-save').addEventListener('click', saveModal);
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('modal-text').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') saveModal();
  if (e.key === 'Escape') closeModal();
});
document.querySelectorAll('.date-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    modalDate = btn.dataset.date === 'today' ? isoToday()
              : btn.dataset.date === 'tomorrow' ? isoTomorrow()
              : null;
    syncDateBtns();
  });
});

init();
