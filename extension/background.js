const API = 'https://api.hicke.se/api/todos';

async function getKey() {
  return new Promise(resolve => {
    chrome.storage.sync.get('apiKey', d => resolve(d.apiKey || ''));
  });
}

async function updateBadge() {
  const key = await getKey();
  if (!key) { chrome.action.setBadgeText({ text: '' }); return; }

  try {
    const r = await fetch(API, { headers: { 'X-API-Key': key } });
    if (!r.ok) { chrome.action.setBadgeText({ text: '' }); return; }
    const todos = await r.json();
    const today = new Date().toISOString().slice(0, 10);
    const count = todos.filter(t => !t.done && t.due_date === today && t.parent_id === null).length;
    chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
  } catch {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Refresh badge every 5 minutes
chrome.alarms.create('badge', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(a => { if (a.name === 'badge') updateBadge(); });

// Refresh on install and startup
chrome.runtime.onInstalled.addListener(updateBadge);
chrome.runtime.onStartup.addListener(updateBadge);

// Allow popup to trigger a badge refresh
chrome.runtime.onMessage.addListener(msg => {
  if (msg === 'refresh') updateBadge();
});
