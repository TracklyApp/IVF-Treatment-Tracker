(() => {
  'use strict';
  const install = document.getElementById('installApp');
  const help = document.getElementById('installHelp');
  const status = document.getElementById('pwaStatus');
  const updateStatus = document.getElementById('pwaUpdateStatus');
  const check = document.getElementById('checkAppUpdate');
  const standalone = matchMedia('(display-mode: standalone)');
  let promptEvent;
  let registration;
  let offlineReady = false;
  function showStatus() {
    status.textContent = offlineReady
      ? (navigator.onLine ? 'Offline ready · local data stays on this device.' : 'Offline · local tracker available.')
      : 'Offline setup pending. Open the HTTPS app online first.';
  }
  function installedState() {
    install.textContent = standalone.matches || navigator.standalone ? 'App installed · Help' : 'Install App';
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    promptEvent = event;
  });
  window.addEventListener('appinstalled', () => { promptEvent = null; install.textContent = 'App installed · Help'; });
  standalone.addEventListener('change', installedState);
  install.addEventListener('click', async () => {
    if (promptEvent) {
      const current = promptEvent;
      promptEvent = null;
      try { await current.prompt(); await current.userChoice; } catch { help.showModal(); }
    } else { help.showModal(); }
  });
  document.getElementById('closeInstallHelp').onclick = () => help.close();
  help.addEventListener('click', event => { if (event.target === help) help.close(); });
  window.addEventListener('online', showStatus);
  window.addEventListener('offline', showStatus);
  installedState();
  showStatus();
  if (!window.isSecureContext || !('serviceWorker' in navigator) || location.protocol === 'file:') {
    status.textContent = 'Installation and offline mode require an HTTPS website (not a local HTML file).';
    check.disabled = true;
    return;
  }
  function waitingMessage() {
    updateStatus.textContent = 'Update ready. Save your entries, then close every tracker tab and app window. The new version opens next time.';
  }
  function observeWorker(worker) {
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && registration.waiting) waitingMessage();
      if (worker.state === 'redundant') updateStatus.textContent = 'Download failed. The existing version remains available. Try again online.';
    });
  }
  check.addEventListener('click', async () => {
    if (!registration) return;
    check.disabled = true;
    updateStatus.textContent = 'Checking for updates…';
    try {
      await registration.update();
      if (registration.waiting) waitingMessage();
      else updateStatus.textContent = registration.installing ? 'Downloading update…' : 'No new update found.';
    } catch { updateStatus.textContent = 'Could not check for updates. Try again online.'; }
    finally { check.disabled = false; }
  });
  check.disabled = true;
  navigator.serviceWorker.register('./sw.js', {scope: './', updateViaCache: 'none'}).then(reg => {
    registration = reg;
    check.disabled = false;
    if (reg.waiting) waitingMessage();
    observeWorker(reg.installing);
    reg.addEventListener('updatefound', () => observeWorker(reg.installing));
    navigator.serviceWorker.ready.then(() => { offlineReady = true; showStatus(); });
  }).catch(() => {
    status.textContent = 'Offline setup failed. Reopen online or check the HTTPS hosting configuration.';
  });
})();
