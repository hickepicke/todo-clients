const INSTALL_SH = '#!/bin/sh\n'
  + 'set -e\n'
  + '\n'
  + 'CLONE_DIR="$HOME/.todo-clients"\n'
  + 'DEST="$HOME/.local/bin/todo"\n'
  + 'BASE="https://github.com/hickepicke/todo-clients/releases/latest/download"\n'
  + '\n'
  + 'OS=$(uname -s | tr \'[:upper:]\' \'[:lower:]\')\n'
  + 'ARCH=$(uname -m)\n'
  + 'case "$ARCH" in\n'
  + '  x86_64)        ARCH="amd64" ;;\n'
  + '  aarch64|arm64) ARCH="arm64" ;;\n'
  + '  *) echo "Unsupported arch: $ARCH"; exit 1 ;;\n'
  + 'esac\n'
  + '\n'
  + 'case "$OS" in\n'
  + '  linux)  SUFFIX="${OS}-${ARCH}" ;;\n'
  + '  darwin) SUFFIX="macos-${ARCH}" ;;\n'
  + '  *) echo "Unsupported OS: $OS"; exit 1 ;;\n'
  + 'esac\n'
  + '\n'
  + '# CLI binary\n'
  + 'echo "Downloading todo CLI ($SUFFIX)..."\n'
  + 'mkdir -p "$HOME/.local/bin"\n'
  + 'curl -fsSL "$BASE/todo-$SUFFIX" -o "$DEST"\n'
  + 'chmod +x "$DEST"\n'
  + '\n'
  + '# Add to PATH if needed\n'
  + 'for RC in "$HOME/.bashrc" "$HOME/.zshrc"; do\n'
  + '  [ -f "$RC" ] && grep -q ".local/bin" "$RC" || \\\n'
  + '    echo \'export PATH="$HOME/.local/bin:$PATH"\' >> "$RC"\n'
  + 'done\n'
  + 'export PATH="$HOME/.local/bin:$PATH"\n'
  + '\n'
  + '# Chrome extension\n'
  + 'if [ -d "$CLONE_DIR" ]; then\n'
  + '  echo "Updating $CLONE_DIR..."\n'
  + '  git -C "$CLONE_DIR" pull --ff-only\n'
  + 'else\n'
  + '  echo "Cloning todo-clients..."\n'
  + '  git clone --depth=1 https://github.com/hickepicke/todo-clients "$CLONE_DIR"\n'
  + 'fi\n'
  + '\n'
  + 'echo ""\n'
  + 'echo "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"\n'
  + 'echo "  todo CLI + Chrome extension installed"\n'
  + 'echo "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"\n'
  + 'echo ""\n'
  + 'echo "1. Create ~/.config/todo/config.toml:"\n'
  + 'echo "   api_key  = \\"your-api-key\\""\n'
  + 'echo "   api_base = \\"https://api.hicke.se\\""\n'
  + 'echo ""\n'
  + 'echo "2. Load Chrome extension:"\n'
  + 'echo "   chrome://extensions -> Developer mode -> Load unpacked"\n'
  + 'echo "   -> $CLONE_DIR/extension"\n'
  + 'echo ""\n'
  + 'echo "Run: todo"\n';

const ICON_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAIAAACyr5FlAAACyUlEQVR4nO3bQW4bMRQFQR8gR8q9cvxkl0Xgti1LHH5OSqi1/YZsaCFIbz9+/oJ3vW1fwFjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIE2J4/ey1/ZHO5c49qxat1kcFx30ulXrNovjooNet2rdZnFcdNDrVq3bLI6LDnrdqnWbxXHRQa9btW6zOC466HWr1m3+j+K48i+IQxx8lThI4iCJgyQOkjhI4iCJgyQOkjhI4iCJgyQO0vQ4nn9tf7RziYMkDpI4SOIgiYMkDpI4SFPiYCBxfGTd+9kR73bi+Ig49o8YSxz7R4wljv0jxhLH/hFjiWP/iLHEsX/EWOLYP4KZxEESB0kcJHGQxEESB+mecQz//OAUN4xj/odLp7hbHEd88niKW8VxysfSp7hPHJ+WIY5H3SSOr5QhjkfdIY4vliGORx0fx9fLEMejzo5DGUsdHIcyVtsZxzMXqYwLTIzj0+tUxjWGxvHBpSrjMnPjePdqlXGl0XH8c8HKuNj0OP5e85YyHvqnL3xtz+KYODae7KKFVz6COFYd64qF1z/FkXG8/PSHz9v4IEfG8cILmLxtwrMcGcdL7mDssFGPc2QcT17DzFUzn+jIOL59EwMnPf/afhfj4vjGZWwffG+z4vC1rlHGxeGrwnNMjMPPT4YYGoefNE4wNw62EwdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHKQ/3MdspI8wySsAAAAASUVORK5CYII=';

const FAVICON_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAgElEQVR4nO3TWw6AIAxEURbgktyXy69fJj6gnQ5torENn3JPAtiWdUtdrYAC3gPIMSmAnOaDgFIPAOQ6wYBZjwRG3/AAUucB5HB4AK/3AXMnXjeA7n5X3QZuFdfhaHfQDRF17ZKfOaJuvCIZDF63n2k6QB+9A0D+jFlgZhXwA2AHxxzy0lzCTuEAAAAASUVORK5CYII=';

const MANIFEST_JSON = '{"name":"Todos","short_name":"Todos","start_url":"https://todo.hicke.se/","display":"standalone",'
  + '"background_color":"#0c3c77","theme_color":"#0c3c77",'
  + '"icons":[{"src":"https://api.hicke.se/icon.png","sizes":"192x192","type":"image/png","purpose":"any maskable"}]}';

const TODO_APP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="https://api.hicke.se/favicon.png">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#0c3c77">
  <link rel="apple-touch-icon" href="https://api.hicke.se/icon.png">
  <link rel="manifest" href="https://api.hicke.se/manifest.json">
  <title>Todos</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --accent: #0c3c77;
      --red: #dc2626;
      --bg: #d4d4d4;
      --surface: #ffffff;
      --surface2: #e8e8e8;
      --border: rgba(0,0,0,0.08);
      --text: #1a1a1a;
      --text-dim: rgba(0,0,0,0.42);
      --text-faint: rgba(0,0,0,0.22);
      --green-bg: #dcfce7;
      --green-fg: #166534;
      --red-bg: #fee2e2;
      --red-fg: #991b1b;
      --radius: 10px;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      max-width: 540px;
      margin: 0 auto;
    }
    header {
      background: var(--accent);
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      position: sticky;
      top: 0;
      z-index: 20;
      box-shadow: 0 1px 6px rgba(220,38,38,0.25);
    }
    header h1 { flex: 1; font-size: 0.95rem; font-weight: 700; color: #fff; }
    #hdr-sub { font-size: 0.7rem; color: rgba(255,255,255,0.65); }
    .hdr-add {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.35);
      color: #fff;
      font-size: 1.3rem;
      font-weight: 300;
      width: 30px; height: 30px;
      border-radius: 6px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
      line-height: 1;
    }
    .hdr-add:hover { background: rgba(255,255,255,0.3); }
    main { padding: 0.75rem 0.75rem 6rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .section { border-radius: var(--radius); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .section-hdr {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 0.9rem;
      cursor: pointer;
      background: var(--surface);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .section-hdr:active { background: var(--surface2); }
    .section-hdr.today {
      background: rgba(220,38,38,0.05);
      border-left: 3px solid var(--accent);
      padding-left: calc(0.9rem - 3px);
    }
    .section-label { flex: 1; font-size: 0.82rem; font-weight: 600; color: var(--text); }
    .section-hdr.today .section-label { color: var(--accent); }
    .todo-row.todo-overdue .todo-text { color: #ef4444; }
    .overdue-chip { font-size: 0.68em; margin-left: 0.4rem; opacity: 0.75; }
    .section-count { font-size: 0.7rem; color: var(--text-dim); }
    .section-arrow { font-size: 0.65rem; color: var(--text-faint); transition: transform 0.2s ease; flex-shrink: 0; }
    .section-arrow.open { transform: rotate(90deg); }
    .section-body { background: var(--surface); overflow: hidden; max-height: 0; transition: max-height 0.28s ease; }
    .section-body.open { max-height: 4000px; }
    .section-add {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.55rem 0.9rem;
      color: var(--text-faint);
      font-size: 0.8rem;
      cursor: pointer;
      border-top: 1px solid var(--border);
      transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .section-add:hover, .section-add:active { color: var(--accent); }
    .todo-row { position: relative; overflow: hidden; border-top: 1px solid var(--border); }
    .todo-row.dragging { opacity: 0.35; }
    .todo-row.drag-above { box-shadow: 0 -2px 0 var(--accent); }
    .drag-handle { color: var(--text-faint); cursor: grab; padding: 0 0.25rem; font-size: 1rem; touch-action: none; -webkit-user-select: none; user-select: none; flex-shrink: 0; }
    .collapse-btn { color: var(--text-faint); cursor: pointer; padding: 0 0.25rem; font-size: 0.8rem; flex-shrink: 0; transition: transform 0.15s; -webkit-user-select: none; user-select: none; display: inline-block; }
    .collapse-btn.expanded { transform: rotate(90deg); }
    .subtask-list.hidden { display: none; }
    .todo-row.subtask .todo-inner { padding-left: 4.5rem; }
    .todo-row.subtask .todo-check { width: 18px; height: 18px; font-size: 0.75rem; }
    .swipe-bg {
      position: absolute; inset: 0;
      display: flex; align-items: center;
      padding: 0 1rem;
      font-size: 0.75rem; font-weight: 700;
      letter-spacing: 0.05em; text-transform: uppercase;
      opacity: 0; pointer-events: none;
    }
    .swipe-bg.right { background: rgba(28,105,199,0.12); color: #0c3c77; justify-content: flex-start; }
    .swipe-bg.left  { background: var(--green-bg); color: var(--green-fg); justify-content: flex-end; }
    .todo-inner {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.9rem 0.9rem;
      background: var(--surface);
      position: relative; z-index: 1;
      touch-action: pan-y; will-change: transform;
    }
    .todo-inner.snapping { transition: transform 0.2s ease; }
    .todo-check {
      flex-shrink: 0; width: 20px; height: 20px;
      border: 2px solid rgba(28,105,199,0.55);
      border-radius: 4px;
      background: rgba(28,105,199,0.04);
      color: var(--accent);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 700; cursor: pointer;
      transition: background 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .todo-check:hover, .todo-check:active { background: rgba(220,38,38,0.1); }
    .todo-check.in-progress { border-color: var(--green-fg); background: rgba(22,101,52,0.08); position: relative; overflow: hidden; }
    .todo-check.in-progress::after { content: ''; position: absolute; inset: -2px; background: linear-gradient(to top right, transparent calc(50% - 1.5px), var(--green-fg) calc(50%), transparent calc(50% + 1.5px)); }
    .todo-row.done .todo-check { border-color: var(--green-fg); background: rgba(22,101,52,0.08); color: var(--green-fg); }
    .todo-text { flex: 1; font-size: 1rem; line-height: 1.4; color: var(--text); cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .todo-row.done .todo-text { text-decoration: line-through; color: var(--text-faint); }
    .todo-row.has-children .todo-text { font-weight: 600; }
    .todo-sub-count { font-size: 0.65rem; color: var(--text-faint); margin-left: 0.25rem; }
    .todo-del {
      flex-shrink: 0; font-size: 0.7rem; color: rgba(220,38,38,0.3);
      cursor: pointer; padding: 0.25rem 0.4rem; transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .todo-del:hover, .todo-del:active { color: var(--accent); }
    .modal-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.35); z-index: 50;
      align-items: flex-end; justify-content: center; padding: 0;
    }
    .modal-overlay.show { display: flex; }
    .modal-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px 16px 0 0;
      padding: 1.25rem 1.25rem 2rem;
      width: 100%; max-width: 540px;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.1);
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(60px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @media (min-width: 480px) {
      .modal-overlay { align-items: center; padding: 1rem; }
      .modal-box { border-radius: 14px; max-width: 400px; padding-bottom: 1.25rem; }
    }
    .modal-title { font-size: 0.9rem; font-weight: 700; color: var(--accent); margin-bottom: 1rem; }
    .modal-input {
      width: 100%; background: var(--bg);
      border: 1px solid rgba(0,0,0,0.12);
      color: var(--text); padding: 0.65rem 0.75rem;
      border-radius: 8px; font-size: 1rem; margin-bottom: 1rem;
    }
    .modal-input:focus { outline: none; border-color: var(--accent); }
    .modal-dates { display: flex; gap: 0.4rem; margin-bottom: 0.5rem; }
    .date-btn {
      flex: 1; padding: 0.45rem 0.5rem;
      border-radius: 7px; border: 1px solid var(--border);
      background: var(--surface2); color: var(--text-dim);
      font-size: 0.75rem; cursor: pointer; text-align: center;
      transition: all 0.15s;
    }
    .date-btn:hover { border-color: rgba(220,38,38,0.3); color: var(--text); }
    .date-btn.active {
      background: rgba(220,38,38,0.08);
      border-color: rgba(220,38,38,0.4);
      color: var(--accent); font-weight: 600;
    }
    .modal-btns { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .modal-btn {
      padding: 0.55rem 1.1rem; border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface2); color: var(--text-dim);
      font-size: 0.85rem; cursor: pointer; transition: background 0.15s;
    }
    .modal-btn:hover { background: rgba(0,0,0,0.06); color: var(--text); }
    .modal-btn.primary {
      background: rgba(220,38,38,0.08);
      border-color: rgba(28,105,199,0.35);
      color: var(--accent); font-weight: 600;
    }
    .modal-btn.primary:hover { background: rgba(220,38,38,0.15); }
    .modal-date-input {
      width: 100%; background: var(--bg);
      border: 1px solid rgba(0,0,0,0.12);
      color: var(--text); padding: 0.6rem 0.75rem;
      border-radius: 8px; font-size: 0.9rem;
      margin-bottom: 1.1rem;
    }
    .modal-date-input:focus { outline: none; border-color: var(--accent); }
    .toast {
      position: fixed; bottom: 1.25rem; left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 30px; padding: 0.6rem 1.1rem;
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 0.82rem; color: var(--text); z-index: 60;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      transition: transform 0.25s ease, opacity 0.25s ease;
      opacity: 0; white-space: nowrap;
    }
    .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    .toast-undo { color: var(--accent); font-weight: 700; cursor: pointer; padding: 0.15rem 0; }
    .app-loading { padding: 2rem 1rem; text-align: center; color: var(--text-faint); font-size: 0.85rem; }
    .todo-link {
      color: var(--accent); font-size: 0.72rem; font-weight: 600;
      text-decoration: none; border-radius: 4px;
      padding: 0.05rem 0.35rem; background: rgba(220,38,38,0.08);
      border: 1px solid rgba(220,38,38,0.2); white-space: nowrap;
      flex-shrink: 0;
    }
    .todo-link:hover { background: rgba(220,38,38,0.16); }
    .todo-date-tag {
      font-size: 0.65rem; color: var(--text-faint);
      background: var(--surface2);
      padding: 0.15rem 0.45rem; border-radius: 10px;
      flex-shrink: 0; white-space: nowrap;
    }
    #ptr {
      position: fixed;
      top: 0; left: 50%;
      transform: translateX(-50%) translateY(-56px);
      background: var(--accent);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      padding: 0.45rem 1.25rem;
      border-radius: 0 0 20px 20px;
      z-index: 30;
      pointer-events: none;
      transition: transform 0.18s ease;
      white-space: nowrap;
    }
    .tag-chip { display:inline-block; background:rgba(12,60,119,0.1); color:#0c3c77; border-radius:999px; padding:0.1rem 0.45rem; font-size:0.72rem; margin-left:0.25rem; cursor:pointer; white-space:nowrap; }
    .tag-bar { display:flex; flex-wrap:wrap; gap:0.5rem; padding:1rem 1rem 2rem; justify-content:center; background:var(--accent); margin-top:0.5rem; border-radius:var(--radius); }
    .tag-bar-chip { background:rgba(255,255,255,0.15); color:#fff; border-radius:999px; padding:0.2rem 0.6rem; font-size:0.78rem; cursor:pointer; white-space:nowrap; flex-shrink:0; border:none; }
    .tag-bar-chip.active { background:#fff; color:var(--accent); font-weight:600; }
  </style>
</head>
<body>
<div id="ptr">Pull to refresh</div>
<header>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
  <h1>Todos</h1>
  <span id="hdr-sub"></span>
  <button class="hdr-add" id="hdr-add" title="Add todo (t)">+</button>
</header>
<main id="app"><div class="app-loading">Loading&hellip;</div></main>
<div class="modal-overlay" id="modal">
  <div class="modal-box">
    <div class="modal-title" id="modal-title">Add Todo</div>
    <input class="modal-input" id="modal-input" type="text" placeholder="What needs to be done?" autocomplete="off" />
    <input class="modal-input" id="modal-url" type="url" placeholder="Link URL (optional)" autocomplete="off" />
    <div class="modal-dates">
      <button class="date-btn" data-date="today">Today</button>
      <button class="date-btn" data-date="tomorrow">Tomorrow</button>
      <button class="date-btn" data-date="someday">Someday</button>
    </div>
    <input type="date" id="modal-date" class="modal-date-input" />
    <div class="modal-btns">
      <button class="modal-btn" id="modal-cancel">Cancel</button>
      <button class="modal-btn primary" id="modal-save">Add</button>
    </div>
  </div>
</div>
<div class="toast" id="toast">
  <span id="toast-msg">Task deleted</span>
  <span class="toast-undo" id="toast-undo">Undo</span>
</div>
<script>
(function () {
  var API = 'https://api.hicke.se/api/todos';
  var KEY = '__API_KEY__';

  function tf(url, opts) {
    opts = opts || {};
    var headers = Object.assign({ 'X-API-Key': KEY }, opts.headers || {});
    return fetch(url, Object.assign({}, opts, { headers: headers }));
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function localIsoDate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }
  var _now     = new Date();
  var TODAY    = localIsoDate(_now);
  var TOMORROW = localIsoDate(addDays(_now, 1));

  function offsetDate(days) { return localIsoDate(addDays(_now, days)); }

  function dateLabel(iso) {
    if (!iso) return 'Someday';
    if (iso === TODAY)    return 'Today';
    if (iso === TOMORROW) return 'Tomorrow';
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-SE', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  var todos = [];
  var expandedSections = { today: true, future: false, someday: false };
  var expandedDays = {};
  var collapsedParents = {};
  var activeTag = null;
  expandedDays['day-' + TOMORROW] = true;
  var undoItem = null, undoTimer = null;
  var editingId = null, modalDate = TODAY;

  function load() {
    tf(API).then(function(r) { return r.json(); }).then(function(data) {
      var stale = data.filter(function(t) {
        return t.done === 2 && t.parent_id === null && t.due_date && t.due_date < TODAY;
      });
      if (stale.length === 0) {
        todos = data;
        render();
        return;
      }
      Promise.all(stale.map(function(t) {
        return tf(API + '/' + t.id, { method: 'DELETE', credentials: 'include' });
      })).then(function() {
        return tf(API).then(function(r) { return r.json(); });
      }).then(function(fresh) {
        todos = fresh;
        render();
      });
    }).catch(function() {
      document.getElementById('app').innerHTML = '<div class="app-loading">Unable to load todos.</div>';
      document.getElementById('hdr-sub').textContent = '';
    });
  }

  function parseTags(text) {
    var tags = [];
    (text || '').replace(/\\B#(\\w+)/g, function(_, t) { tags.push(t); });
    return tags;
  }
  function stripTags(text) {
    return (text || '').replace(/\\s*\\B#\\w+/g, '').trim();
  }

  function buildTagBar() {
    var all = {};
    todos.forEach(function(t) {
      parseTags(t.text).forEach(function(tag) { all[tag] = true; });
    });
    var tags = Object.keys(all).sort();
    if (!tags.length) return '';
    var chips = (activeTag ? '<button class="tag-bar-chip active" data-tag="">&#x2715; All</button>' : '') +
      tags.map(function(t) {
        return '<button class="tag-bar-chip' + (activeTag === t ? ' active' : '') + '" data-tag="' + t + '">#' + t + '</button>';
      }).join('');
    return '<div class="tag-bar">' + chips + '</div>';
  }

  function groupTodos() {
    var today = [], near = {}, beyond = [], someday = [];
    var cutoff = offsetDate(5);
    var source = activeTag
      ? todos.filter(function(t) {
          if (t.parent_id !== null) return false;
          if (parseTags(t.text).indexOf(activeTag) !== -1) return true;
          return todos.some(function(c) { return c.parent_id === t.id && parseTags(c.text).indexOf(activeTag) !== -1; });
        })
      : todos;
    source.forEach(function(t) {
      if (t.parent_id !== null) return;
      if (!t.due_date)          { someday.push(t); return; }
      if (t.due_date <= TODAY)  { today.push(t);   return; }
      if (t.due_date > cutoff)  { beyond.push(t);  return; }
      if (!near[t.due_date]) near[t.due_date] = [];
      near[t.due_date].push(t);
    });
    today.sort(function(a, b) { return a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0; });
    beyond.sort(function(a, b) { return a.due_date < b.due_date ? -1 : 1; });
    return { today: today, near: near, beyond: beyond.slice(0, 5), someday: someday };
  }

  function getChildren(parentId) {
    return todos.filter(function(t) { return t.parent_id === parentId; });
  }

  function render() {
    var app = document.getElementById('app');
    var sub = document.getElementById('hdr-sub');
    var done  = todos.filter(function(t) { return t.done === 2; }).length;
    sub.textContent = done + '/' + todos.length + ' done';

    var g = groupTodos();
    var parts = [];

    parts.push(buildSection('today',
      'Today \u2014 ' + new Date().toLocaleDateString('en-SE', { weekday: 'long', month: 'short', day: 'numeric' }),
      TODAY, g.today, true, false));

    for (var i = 1; i <= 5; i++) {
      var d = offsetDate(i);
      parts.push(buildSection('day-' + d, dateLabel(d), d, g.near[d] || [], false, false));
    }

    if (g.beyond.length) {
      parts.push(buildSection('future', 'Future todos', null, g.beyond, false, true));
    }

    parts.push(buildSection('someday', 'Someday', null, g.someday, false, false));
    parts.push(buildTagBar());

    app.innerHTML = parts.join('');
    attachListeners();
  }

  function buildSection(key, label, date, items, alwaysOpen, showDate) {
    var isToday  = key === 'today';
    var isFuture = key === 'future';
    var isOpen   = alwaysOpen || expandedSections[key] || expandedDays[key];
    var hdrCls   = 'section-hdr' + (isToday ? ' today' : '');
    var countHtml = items.length ? '<span class="section-count">' + items.length + (items.length === 1 ? ' task' : ' tasks') + '</span>' : '';
    var arrowHtml = alwaysOpen ? '' : '<span class="section-arrow' + (isOpen ? ' open' : '') + '">&#x25B6;</span>';
    var rows = items.map(function(item) { return buildRow(item, showDate, items.length); }).join('');
    var addDate = date || '';
    var addHtml = isFuture ? '' : '<div class="section-add" data-action="add" data-date="' + addDate + '">+ Add task</div>';
    return '<div class="section">' +
      '<div class="' + hdrCls + '" data-toggle="' + key + '">' +
        '<span class="section-label">' + label + '</span>' + countHtml + arrowHtml +
      '</div>' +
      '<div class="section-body' + (isOpen ? ' open' : '') + '">' +
        rows + addHtml +
      '</div>' +
    '</div>';
  }

  function buildRow(todo, showDate, sectionCount) {
    var children  = getChildren(todo.id);
    var doneCount = children.filter(function(c) { return c.done === 2; }).length;
    var subHtml   = children.length ? '<span class="todo-sub-count">(' + doneCount + '/' + children.length + ')</span>' : '';
    var dateHtml  = showDate && todo.due_date ? '<span class="todo-date-tag">' + dateLabel(todo.due_date) + '</span>' : '';
    var linkHtml  = todo.url ? '<a href="' + esc(todo.url) + '" target="_blank" rel="noopener" class="todo-link" onclick="event.stopPropagation()">Link</a>' : '';
    var displayText = esc(stripTags(todo.text));
    var collapsed  = todo.id in collapsedParents ? collapsedParents[todo.id] : true;
    var allTags = parseTags(todo.text);
    if (collapsed) {
      children.forEach(function(c) { parseTags(c.text).forEach(function(t) { if (allTags.indexOf(t) === -1) allTags.push(t); }); });
    }
    var tagChips  = allTags.map(function(t) { return '<span class="tag-chip" data-tag="' + t + '">#' + t + '</span>'; }).join('');
    var childRows  = children.map(function(c) { return buildChildRow(c); }).join('');
    var subtaskDiv = children.length ? '<div class="subtask-list' + (collapsed ? ' hidden' : '') + '">' + childRows + '</div>' : '';
    var chevron    = children.length ? '<span class="collapse-btn' + (collapsed ? '' : ' expanded') + '" data-action="collapse" data-id="' + todo.id + '">&#x276F;</span>' : '';
    var rowOverdue = todo.done !== 2 && todo.due_date && todo.due_date < TODAY;
    var overdueChip = rowOverdue ? '<span class="overdue-chip">' + dateLabel(todo.due_date) + '</span>' : '';
    var rowClass = 'todo-row' + (todo.done === 2 ? ' done' : todo.done === 1 ? ' in-progress' : '');

    return '<div class="' + rowClass + (rowOverdue ? ' todo-overdue' : '') + (children.length ? ' has-children' : '') + '" data-id="' + todo.id + '">' +
      '<div class="swipe-bg right"><span class="swipe-indent-icon">&#x21E5;</span></div>' +
      '<div class="swipe-bg left">&#x2192; Next</div>' +
      '<div class="todo-inner">' +
        chevron +
        (children.length || sectionCount < 2 ? '' : '<span class="drag-handle">&#x2807;</span>') +
        '<span class="todo-check' + (todo.done === 1 ? ' in-progress' : '') + '" data-action="toggle" data-id="' + todo.id + '" data-status="' + todo.done + '" data-parent="true">' + (todo.done === 2 ? '&#x2714;' : '') + '</span>' +
        '<span class="todo-text" data-action="edit" data-id="' + todo.id + '" data-text="' + esc(todo.text) + '" data-date="' + (todo.due_date || '') + '" data-url="' + esc(todo.url || '') + '">' + displayText + subHtml + overdueChip + tagChips + '</span>' +
        linkHtml + dateHtml +
        '<span class="todo-del" data-action="delete" data-id="' + todo.id + '">&#x2715;</span>' +
      '</div>' +
    '</div>' + subtaskDiv;
  }

  function buildChildRow(c) {
    return '<div class="todo-row subtask' + (c.done === 2 ? ' done' : c.done === 1 ? ' in-progress' : '') + '" data-id="' + c.id + '">' +
      '<div class="swipe-bg right"><span class="swipe-indent-icon">&#x21E5;</span></div>' +
      '<div class="swipe-bg left">&#x2192; Next</div>' +
      '<div class="todo-inner">' +
        '<span class="todo-check' + (c.done === 1 ? ' in-progress' : '') + '" data-action="toggle" data-id="' + c.id + '" data-status="' + c.done + '" data-parent="false">' + (c.done === 2 ? '&#x2714;' : '') + '</span>' +
        '<span class="todo-text" data-action="edit" data-id="' + c.id + '" data-text="' + esc(c.text) + '" data-date="' + (c.due_date || '') + '" data-url="' + esc(c.url || '') + '">' + esc(stripTags(c.text)) + parseTags(c.text).map(function(t) { return '<span class="tag-chip" data-tag="' + t + '">#' + t + '</span>'; }).join('') + '</span>' +
        (c.url ? '<a href="' + esc(c.url) + '" target="_blank" rel="noopener" class="todo-link" onclick="event.stopPropagation()">Link</a>' : '') +
        '<span class="todo-del" data-action="delete" data-id="' + c.id + '">&#x2715;</span>' +
      '</div>' +
    '</div>';
  }

  function attachListeners() {
    document.querySelectorAll('[data-toggle]').forEach(function(el) {
      el.addEventListener('click', function() {
        var key = el.dataset.toggle;
        if (key === 'today') return;
        if (key.startsWith('day-')) { expandedDays[key] = !expandedDays[key]; }
        else { expandedSections[key] = !expandedSections[key]; }
        render();
      });
    });
    document.querySelectorAll('[data-action="add"]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        openModal(null, null, el.dataset.date || null);
      });
    });
    document.querySelectorAll('[data-action="toggle"]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        var status = parseInt(el.dataset.status);
        var isParent = el.dataset.parent === 'true';
        cycleStatus(parseInt(el.dataset.id), status, isParent);
      });
    });
    document.querySelectorAll('[data-action="edit"]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        openModal(parseInt(el.dataset.id), el.dataset.text, el.dataset.date || null, el.dataset.url || '');
      });
    });
    document.querySelectorAll('[data-tag]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        var tag = el.dataset.tag;
        activeTag = (tag && tag !== activeTag) ? tag : null;
        render();
      });
    });
    document.querySelectorAll('[data-action="collapse"]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = parseInt(el.dataset.id);
        collapsedParents[id] = !collapsedParents[id];
        render();
      });
    });
    document.querySelectorAll('[data-action="delete"]').forEach(function(el) {
      el.addEventListener('click', function(e) { e.stopPropagation(); deleteTodoItem(parseInt(el.dataset.id)); });
    });
    document.querySelectorAll('.todo-row').forEach(function(row) { initSwipe(row); });
    document.querySelectorAll('.todo-row:not(.subtask)').forEach(function(row) { initDrag(row); });
  }

  function initSwipe(row) {
    var inner = row.querySelector('.todo-inner');
    var bgR   = row.querySelector('.swipe-bg.right');
    var bgL   = row.querySelector('.swipe-bg.left');
    var startX = 0, curX = 0, active = false;

    function onStart(x) { startX = x; curX = 0; active = true; inner.classList.remove('snapping'); }
    function onMove(x) {
      if (!active) return;
      curX = x - startX;
      inner.style.transform = 'translateX(' + curX + 'px)';
      var r = Math.min(Math.abs(curX) / 80, 1);
      if (curX < 0) { bgL.style.opacity = r; bgR.style.opacity = 0; }
      else {
        var id = parseInt(row.dataset.id);
        var t = todos.find(function(x) { return x.id === id; });
        var canAct = t && (t.parent_id !== null || (canIndent(id) && !hasChildren(id)));
        bgR.style.opacity = canAct ? r : r * 0.3;
        var icon = bgR.querySelector('.swipe-indent-icon');
        if (icon) icon.textContent = (t && t.parent_id !== null) ? '\u21E4' : '\u21E5';
        bgL.style.opacity = 0;
      }
    }
    function onEnd() {
      if (!active) return;
      active = false;
      inner.classList.add('snapping');
      inner.style.transform = '';
      bgR.style.opacity = 0; bgL.style.opacity = 0;
      var id = parseInt(row.dataset.id);
      var snap = curX;
      if (snap < -70) { setTimeout(function() { var t = todos.find(function(x) { return x.id === id; }); if (t) cycleStatus(id, t.done, t.subtask_count > 0); }, 150); }
      else if (snap > 70) { setTimeout(function() { swipeIndent(id); }, 150); }
    }
    inner.addEventListener('touchstart', function(e) { onStart(e.touches[0].clientX); }, { passive: true });
    inner.addEventListener('touchmove',  function(e) { e.preventDefault(); onMove(e.touches[0].clientX); }, { passive: false });
    inner.addEventListener('touchend',   onEnd);
    inner.addEventListener('mousedown',  function(e) {
      onStart(e.clientX);
      function mm(e2) { onMove(e2.clientX); }
      function mu()   { onEnd(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); }
      document.addEventListener('mousemove', mm);
      document.addEventListener('mouseup',   mu);
    });
  }

  function reorderSection() {
    var allRows = Array.from(document.querySelectorAll('.todo-row:not(.subtask)'));
    var updates = allRows.map(function(r, i) { return { id: parseInt(r.dataset.id), position: i }; });
    tf(API + '/reorder', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: updates })
    }).then(load);
  }

  function initDrag(row) {
    var handle = row.querySelector('.drag-handle');
    if (!handle) return;
    var dragRow = null, startY = 0, currentY = 0, allRows, placeholder;

    function getRows() {
      return Array.from(row.parentNode.querySelectorAll('.todo-row:not(.subtask)'));
    }

    function getRowAt(y) {
      var found = null;
      getRows().forEach(function(r) {
        if (r === dragRow) return;
        var rect = r.getBoundingClientRect();
        if (y < rect.top + rect.height / 2) { if (!found) found = r; }
      });
      return found;
    }

    function startDrag(y) {
      dragRow = row;
      startY = y;
      currentY = y;
      row.classList.add('dragging');
    }

    function onDragMove(y) {
      if (!dragRow) return;
      currentY = y;
      var dy = y - startY;
      var inner = row.querySelector('.todo-inner');
      inner.style.transform = 'translateY(' + dy + 'px)';
      inner.style.zIndex = 100;
      inner.style.position = 'relative';
      inner.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      document.querySelectorAll('.drag-above').forEach(function(r) { r.classList.remove('drag-above'); });
      var target = getRowAt(y);
      if (target) target.classList.add('drag-above');
    }

    function onDragEnd() {
      if (!dragRow) return;
      var target = getRowAt(currentY);
      var inner = row.querySelector('.todo-inner');
      inner.style.transform = '';
      inner.style.zIndex = '';
      inner.style.position = '';
      inner.style.boxShadow = '';
      row.classList.remove('dragging');
      document.querySelectorAll('.drag-above').forEach(function(r) { r.classList.remove('drag-above'); });

      if (target) {
        row.parentNode.insertBefore(row, target);
      } else {
        var last = getRows().filter(function(r) { return r !== row; }).pop();
        if (last) last.parentNode.insertBefore(row, last.nextSibling);
      }
      dragRow = null;
      reorderSection();
    }

    handle.addEventListener('touchstart', function(e) {
      e.stopPropagation();
      startDrag(e.touches[0].clientY);
      function tm(e2) { e2.preventDefault(); onDragMove(e2.touches[0].clientY); }
      function tu() { onDragEnd(); document.removeEventListener('touchmove', tm); document.removeEventListener('touchend', tu); }
      document.addEventListener('touchmove', tm, { passive: false });
      document.addEventListener('touchend', tu);
    }, { passive: true });

    handle.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      startDrag(e.clientY);
      function mm(e2) { onDragMove(e2.clientY); }
      function mu() { onDragEnd(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); }
      document.addEventListener('mousemove', mm);
      document.addEventListener('mouseup', mu);
    });
  }

  function hasChildren(id) {
    return todos.some(function(t) { return t.parent_id === id; });
  }

  function canIndent(id) {
    var rendered = document.querySelectorAll('.todo-row[data-id]');
    var ids = Array.from(rendered).map(function(el) { return parseInt(el.dataset.id); });
    var myIdx = ids.indexOf(id);
    for (var i = myIdx - 1; i >= 0; i--) {
      var t = todos.find(function(x) { return x.id === ids[i]; });
      if (t && t.parent_id === null) return true;
    }
    return false;
  }

  function swipeIndent(id) {
    var todo = todos.find(function(t) { return t.id === id; });
    if (!todo) return;

    if (todo.parent_id !== null) {
      tf(API + '/' + id, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id: null })
      }).then(load);
      return;
    }

    if (hasChildren(id)) return;

    var rendered = document.querySelectorAll('.todo-row[data-id]');
    var ids = Array.from(rendered).map(function(el) { return parseInt(el.dataset.id); });
    var myIdx = ids.indexOf(id);
    var prevId = null;
    for (var i = myIdx - 1; i >= 0; i--) {
      var t = todos.find(function(x) { return x.id === ids[i]; });
      if (t && t.parent_id === null) { prevId = ids[i]; break; }
    }
    if (!prevId) return;

    tf(API + '/' + id, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent_id: prevId })
    }).then(load);
  }

  function cycleStatus(id, status, isParent) {
    var next = (status + 1) % 3;
    tf(API + '/' + id, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: next, cascade: isParent && next === 2 })
    }).then(load);
  }

  function addTodoItem(text, date, url) {
    tf(API, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, due_date: date !== undefined ? date : null, url: url || null })
    }).then(load);
  }

  function updateTodoItem(id, text, date, url) {
    tf(API + '/' + id, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, due_date: date !== undefined ? date : null, url: url !== undefined ? url : null })
    }).then(load);
  }

  function deleteTodoItem(id) {
    var t = todos.find(function(x) { return x.id === id; });
    undoItem = t || null;
    tf(API + '/' + id, { method: 'DELETE', credentials: 'include' }).then(load);
    showToast('Task deleted');
  }

  function openModal(id, text, date, url) {
    editingId  = id || null;
    modalDate  = (id && date === null) ? null : (date || TODAY);
    var input   = document.getElementById('modal-input');
    var title   = document.getElementById('modal-title');
    var saveBtn = document.getElementById('modal-save');
    input.value         = text || '';
    document.getElementById('modal-url').value = url || '';
    title.textContent   = id ? 'Edit Task' : 'Add Todo';
    saveBtn.textContent = id ? 'Save'      : 'Add';
    syncDateBtns();
    document.getElementById('modal').classList.add('show');
    setTimeout(function() { input.focus(); if (text) input.select(); }, 50);
  }

  function closeModal() { document.getElementById('modal').classList.remove('show'); editingId = null; }

  function saveModal() {
    var text = document.getElementById('modal-input').value.trim();
    if (!text) return;
    var date = (modalDate === null || modalDate === 'someday') ? null : modalDate;
    var url  = document.getElementById('modal-url').value.trim() || null;
    if (editingId) { updateTodoItem(editingId, text, date, url); }
    else           { addTodoItem(text, date, url); }
    closeModal();
  }

  function syncDateBtns() {
    var isCustom = modalDate && modalDate !== TODAY && modalDate !== TOMORROW;
    document.querySelectorAll('.date-btn').forEach(function(btn) {
      var d = btn.dataset.date;
      var active = !isCustom && (
        (d === 'today'    && modalDate === TODAY)    ||
        (d === 'tomorrow' && modalDate === TOMORROW) ||
        (d === 'someday'  && !modalDate)
      );
      btn.classList.toggle('active', active);
    });
    var dateInput = document.getElementById('modal-date');
    if (dateInput) dateInput.value = isCustom ? modalDate : '';
  }

  function showToast(msg) {
    if (undoTimer) clearTimeout(undoTimer);
    document.getElementById('toast-msg').textContent = msg;
    document.getElementById('toast').classList.add('show');
    undoTimer = setTimeout(function() {
      document.getElementById('toast').classList.remove('show');
      undoItem = null;
    }, 3500);
  }

  document.addEventListener('keydown', function(e) {
    var tag = document.activeElement.tagName;
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault(); openModal(null, null, TODAY);
    }
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById('hdr-add').addEventListener('click', function() { openModal(null, null, TODAY); });
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-save').addEventListener('click', saveModal);
  document.getElementById('modal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
  document.getElementById('modal-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') saveModal(); });

  document.querySelectorAll('.date-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      modalDate = btn.dataset.date === 'today' ? TODAY : btn.dataset.date === 'tomorrow' ? TOMORROW : null;
      document.getElementById('modal-date').value = '';
      syncDateBtns();
    });
  });

  document.getElementById('modal-date').addEventListener('change', function() {
    if (this.value) { modalDate = this.value; syncDateBtns(); }
  });

  document.getElementById('toast-undo').addEventListener('click', function() {
    if (undoItem) {
      addTodoItem(undoItem.text, undoItem.due_date);
      undoItem = null;
      clearTimeout(undoTimer);
      document.getElementById('toast').classList.remove('show');
    }
  });

  // ── Pull to refresh ──────────────────────────────────────────────────
  (function() {
    var ptr      = document.getElementById('ptr');
    var THRESHOLD = 72;
    var startY   = 0, dist = 0, active = false;

    document.addEventListener('touchstart', function(e) {
      if (window.scrollY === 0) { startY = e.touches[0].clientY; active = true; }
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (!active) return;
      dist = e.touches[0].clientY - startY;
      if (dist <= 0) return;
      var pull = Math.min(dist, THRESHOLD * 1.4);
      var progress = pull / THRESHOLD;
      ptr.style.transform = 'translateX(-50%) translateY(' + (Math.min(pull, THRESHOLD) - 56) + 'px)';
      ptr.textContent = dist >= THRESHOLD ? 'Release to refresh' : 'Pull to refresh';
    }, { passive: true });

    document.addEventListener('touchend', function() {
      if (!active) return;
      active = false;
      if (dist >= THRESHOLD) {
        ptr.textContent = 'Refreshing\u2026';
        ptr.style.transform = 'translateX(-50%) translateY(-8px)';
        load();
        setTimeout(function() { ptr.style.transform = 'translateX(-50%) translateY(-56px)'; }, 1000);
      } else {
        ptr.style.transform = 'translateX(-50%) translateY(-56px)';
      }
      dist = 0;
    }, { passive: true });
  })();

  load();
})();
</script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const path   = url.pathname;
    const method = request.method;
    const origin = request.headers.get('Origin') || '';

    // Public assets (no auth needed)
    if (url.hostname === 'api.hicke.se' && url.pathname === '/favicon.png') {
      const buf = Uint8Array.from(atob(FAVICON_PNG_B64), c => c.charCodeAt(0));
      return new Response(buf, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } });
    }
    if (url.hostname === 'api.hicke.se' && url.pathname === '/manifest.json') {
      return new Response(MANIFEST_JSON, { headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*' } });
    }
    if (url.hostname === 'api.hicke.se' && url.pathname === '/icon.png') {
      const buf = Uint8Array.from(atob(ICON_PNG_B64), c => c.charCodeAt(0));
      return new Response(buf, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } });
    }

    // Install script
    if (url.hostname === 'api.hicke.se' && url.pathname === '/install.sh') {
      return new Response(INSTALL_SH, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    // Serve standalone todo app
    if (url.hostname === 'todo.hicke.se' || url.hostname.endsWith('.workers.dev')) {
      if (path === '/icon.svg') {
        return new Response(ICON_SVG, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } });
      }
      const html = TODO_APP_HTML.replace('__API_KEY__', env.API_KEY || '');
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const ALLOWED  = [env.DOCS_ORIGIN, env.APP_ORIGIN].filter(Boolean);
    const originOk = ALLOWED.includes(origin) || origin.endsWith('.workers.dev');

    // CORS preflight
    if (method === 'OPTIONS') {
      return originOk
        ? new Response(null, { status: 204, headers: corsHeaders(origin) })
        : new Response('Forbidden', { status: 403 });
    }

    // API key check
    if (request.headers.get('X-API-Key') !== env.API_KEY) {
      const res = json({ error: 'Forbidden' }, 403);
      if (originOk) {
        const h = new Headers(res.headers);
        for (const [k, v] of Object.entries(corsHeaders(origin))) h.set(k, v);
        return new Response(res.body, { status: 403, headers: h });
      }
      return res;
    }

    // Write operations restricted to browser web origins (CLI and extensions are OK with valid API key)
    if (['POST', 'PATCH', 'DELETE'].includes(method) && origin.startsWith('http') && !originOk) {
      return json({ error: 'Forbidden' }, 403);
    }

    let response;
    try {
      if (method === 'GET' && path === '/api/todos') {
        response = await listTodos(env);
      } else if (method === 'POST' && path === '/api/todos/reorder') {
        response = await reorderTodos(request, env);
      } else if (method === 'POST' && path === '/api/todos') {
        response = await createTodo(request, env);
      } else if (method === 'PATCH' && /^\/api\/todos\/\d+$/.test(path)) {
        response = await updateTodo(request, env, parseInt(path.split('/')[3]));
      } else if (method === 'DELETE' && /^\/api\/todos\/\d+$/.test(path)) {
        const id = parseInt(path.split('/')[3]);
        const keepSubtasks = url.searchParams.get('keep_subtasks') === 'true';
        response = await deleteTodo(env, id, keepSubtasks);
      } else {
        response = json({ error: 'Not found' }, 404);
      }
    } catch (err) {
      console.error(err);
      response = json({ error: 'Internal error' }, 500);
    }

    if (originOk) {
      const headers = new Headers(response.headers);
      for (const [k, v] of Object.entries(corsHeaders(origin))) headers.set(k, v);
      return new Response(response.body, { status: response.status, headers });
    }
    return response;
  }
};

// ─── CRUD ────────────────────────────────────────────────────────────────────

async function listTodos(env) {
  const { results } = await env.hicke_todos.prepare(
    'SELECT * FROM todos ORDER BY position ASC, id ASC'
  ).all();

  const countMap = {}, doneMap = {};
  results.forEach(t => {
    if (t.parent_id !== null) {
      countMap[t.parent_id] = (countMap[t.parent_id] || 0) + 1;
      if (t.done === 2) doneMap[t.parent_id] = (doneMap[t.parent_id] || 0) + 1;
    }
  });

  return json(results.map(t => ({
    ...t,
    done:          t.done,
    subtask_count: countMap[t.id] || 0,
    subtasks_done: doneMap[t.id]  || 0,
  })));
}

async function createTodo(request, env) {
  const { text, parent_id = null, due_date = null, url = null } = await request.json();
  if (!text?.trim()) return json({ error: 'text required' }, 400);

  if (parent_id !== null) {
    const parent = await env.hicke_todos.prepare('SELECT parent_id FROM todos WHERE id = ?').bind(parent_id).first();
    if (!parent || parent.parent_id !== null) return json({ error: 'Parent must be a top-level task' }, 400);
  }

  const indent_level = parent_id !== null ? 1 : 0;
  await env.hicke_todos.prepare('UPDATE todos SET position = position + 1').run();
  await env.hicke_todos.prepare(
    'INSERT INTO todos (text, done, position, parent_id, indent_level, due_date, url) VALUES (?, 0, 0, ?, ?, ?, ?)'
  ).bind(text.trim(), parent_id, indent_level, due_date, url).run();

  return listTodos(env);
}

async function updateTodo(request, env, id) {
  const body = await request.json();
  const { text, done, parent_id, cascade, due_date, url } = body;

  if (text !== undefined) {
    await env.hicke_todos.prepare('UPDATE todos SET text = ? WHERE id = ?').bind(text.trim(), id).run();
  }

  if ('due_date' in body) {
    await env.hicke_todos.prepare('UPDATE todos SET due_date = ? WHERE id = ?').bind(due_date, id).run();
  }

  if ('url' in body) {
    await env.hicke_todos.prepare('UPDATE todos SET url = ? WHERE id = ?').bind(url, id).run();
  }

  if (done !== undefined) {
    await env.hicke_todos.prepare('UPDATE todos SET done = ? WHERE id = ?').bind(done, id).run();
    if (cascade && done === 2) {
      await env.hicke_todos.prepare('UPDATE todos SET done = 2 WHERE parent_id = ?').bind(id).run();
    }
    const todo = await env.hicke_todos.prepare('SELECT parent_id FROM todos WHERE id = ?').bind(id).first();
    if (todo?.parent_id !== null && todo?.parent_id !== undefined) {
      const { results: siblings } = await env.hicke_todos.prepare(
        'SELECT done FROM todos WHERE parent_id = ?'
      ).bind(todo.parent_id).all();
      if (siblings.length > 0) {
        const derivedStatus = siblings.every(s => s.done === 2) ? 2 : siblings.some(s => s.done >= 1) ? 1 : 0;
        await env.hicke_todos.prepare('UPDATE todos SET done = ? WHERE id = ?').bind(derivedStatus, todo.parent_id).run();
      }
    }
  }

  if ('parent_id' in body) {
    const newParentId = parent_id ?? null;
    const newLevel    = newParentId !== null ? 1 : 0;
    if (newParentId !== null) {
      const parent = await env.hicke_todos.prepare('SELECT parent_id FROM todos WHERE id = ?').bind(newParentId).first();
      if (!parent || parent.parent_id !== null) return json({ error: 'Parent must be a top-level task' }, 400);
    }
    await env.hicke_todos.prepare(
      'UPDATE todos SET parent_id = ?, indent_level = ? WHERE id = ?'
    ).bind(newParentId, newLevel, id).run();
  }

  return listTodos(env);
}

async function deleteTodo(env, id, keepSubtasks) {
  const { results: subtasks } = await env.hicke_todos.prepare(
    'SELECT id, done FROM todos WHERE parent_id = ?'
  ).bind(id).all();

  if (keepSubtasks && subtasks.some(t => !t.done)) {
    await env.hicke_todos.prepare(
      'UPDATE todos SET parent_id = NULL, indent_level = 0 WHERE parent_id = ? AND done = 0'
    ).bind(id).run();
    await env.hicke_todos.prepare('DELETE FROM todos WHERE parent_id = ? AND done = 1').bind(id).run();
  } else {
    await env.hicke_todos.prepare('DELETE FROM todos WHERE parent_id = ?').bind(id).run();
  }

  await env.hicke_todos.prepare('DELETE FROM todos WHERE id = ?').bind(id).run();
  return listTodos(env);
}

async function reorderTodos(request, env) {
  const { updates } = await request.json();
  const stmt = env.hicke_todos.prepare('UPDATE todos SET position = ? WHERE id = ?');
  await env.hicke_todos.batch(updates.map(({ id, position }) => stmt.bind(position, id)));
  return listTodos(env);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin':      origin,
    'Access-Control-Allow-Methods':     'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':     'Content-Type, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
  };
}
