(function () {
  let worker = null, nextId = 0;
  const pending = new Map();
  function cancel() {
    worker?.terminate(); worker = null;
    for (const { resolve, timer } of pending.values()) { clearTimeout(timer); resolve({ status: 'cancelled' }); }
    pending.clear();
  }
  window.RoutePlanner = { cancel, plan(stops) {
    return new Promise(resolve => {
      if (!window.Worker) { resolve({ status: 'unsupported' }); return; }
      try {
        if (!worker) {
          worker = new Worker('route-worker.js?v=20260905-3');
          worker.onmessage = ({ data }) => { const job = pending.get(data.id); if (!job) return; clearTimeout(job.timer); pending.delete(data.id); job.resolve(data.result); };
          worker.onerror = () => {
            for (const job of pending.values()) { clearTimeout(job.timer); job.resolve({ status: 'load-error' }); }
            pending.clear(); worker?.terminate(); worker = null;
          };
        }
        const id = ++nextId;
        const timer = setTimeout(() => { resolve({ status: 'timeout' }); cancel(); }, 15000);
        pending.set(id, { resolve, timer }); worker.postMessage({ id, stops });
      } catch { resolve({ status: 'load-error' }); cancel(); }
    });
  } };
})();
