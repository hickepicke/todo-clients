chrome.storage.sync.get('apiKey', d => {
  if (d.apiKey) document.getElementById('key').value = d.apiKey;
});

document.getElementById('save').addEventListener('click', () => {
  const key = document.getElementById('key').value.trim();
  chrome.storage.sync.set({ apiKey: key }, () => {
    const s = document.getElementById('status');
    s.textContent = 'Saved.';
    setTimeout(() => { s.textContent = ''; }, 2000);
    chrome.runtime.sendMessage('refresh');
  });
});
