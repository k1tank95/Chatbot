export function register() {
  if (!('serviceWorker' in navigator)) return;
  if (process.env.NODE_ENV !== 'production') return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        reg.onupdatefound = () => {
          const w = reg.installing;
          if (!w) return;
          w.onstatechange = () => {
            if (w.state === 'installed' && navigator.serviceWorker.controller) {
              w.postMessage('SKIP_WAITING');
            }
          };
        };
      })
      .catch((err) => console.warn('SW 등록 실패:', err));
  });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => reg.unregister())
      .catch(() => {});
  }
}
