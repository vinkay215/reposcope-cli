const MAX_RPS = 5;
const MAX_CONCURRENCY = 3;
const MAX_DURATION = 30;
const REQUEST_TIMEOUT_MS = 5000;
const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

const $ = (id) => document.getElementById(id);
const form = $('testForm');
const startBtn = $('startBtn');
const stopBtn = $('stopBtn');
const statusPill = $('statusPill');
const errorBox = $('errorBox');
const logRows = $('logRows');
const sparkline = $('sparkline');

let run = null;

function parseSafeUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Enter a valid URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS are supported.');
  if (!ALLOWED_HOSTS.has(url.hostname)) throw new Error('Only localhost / loopback targets are allowed.');
  return url;
}

function boundedInt(id, min, max) {
  const value = Number.parseInt($(id).value, 10);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${id} must be between ${min} and ${max}.`);
  }
  return value;
}

function resetMetrics() {
  ['total', 'success', 'errors'].forEach((id) => $(id).textContent = '0');
  $('latency').textContent = '0 ms';
  $('elapsed').textContent = '0.0s';
  $('progressBar').style.width = '0%';
  sparkline.innerHTML = '';
  logRows.innerHTML = '<tr class="placeholder"><td colspan="4">No requests yet.</td></tr>';
}

function setRunning(value) {
  startBtn.disabled = value;
  stopBtn.disabled = !value;
  statusPill.textContent = value ? 'Running' : 'Idle';
  statusPill.classList.toggle('running', value);
}

function updateUi() {
  if (!run) return;
  const elapsed = Math.min((performance.now() - run.startedAt) / 1000, run.duration);
  $('total').textContent = String(run.total);
  $('success').textContent = String(run.success);
  $('errors').textContent = String(run.errors);
  $('latency').textContent = `${run.latencies.length ? Math.round(run.latencies.reduce((a, b) => a + b, 0) / run.latencies.length) : 0} ms`;
  $('elapsed').textContent = `${elapsed.toFixed(1)}s`;
  $('progressBar').style.width = `${Math.min(100, (elapsed / run.duration) * 100)}%`;

  const samples = run.latencies.slice(-30);
  const peak = Math.max(1, ...samples);
  sparkline.innerHTML = samples.map((ms) => `<i class="bar" style="height:${Math.max(4, Math.round(ms / peak * 100))}%" title="${Math.round(ms)} ms"></i>`).join('');
}

function addLog(status, latency) {
  if (logRows.querySelector('.placeholder')) logRows.innerHTML = '';
  const tr = document.createElement('tr');
  const ok = status >= 200 && status < 400;
  tr.innerHTML = `<td>${run.total}</td><td class="${ok ? 'ok' : 'bad'}">${status || 'ERR'}</td><td>${Math.round(latency)} ms</td><td>${new Date().toLocaleTimeString()}</td>`;
  logRows.prepend(tr);
  while (logRows.children.length > 20) logRows.lastElementChild.remove();
}

async function sendOne() {
  if (!run || run.stopped || run.active >= run.concurrency) return;
  run.active += 1;
  const controller = new AbortController();
  run.controllers.add(controller);
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  let status = 0;
  try {
    const response = await fetch(run.url.toString(), {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
      headers: { 'X-SafeLoad-Lab': 'local-test' },
    });
    status = response.status;
    run.success += response.ok ? 1 : 0;
    run.errors += response.ok ? 0 : 1;
  } catch {
    run.errors += 1;
  } finally {
    clearTimeout(timeout);
    run.controllers.delete(controller);
    run.active -= 1;
    const latency = performance.now() - started;
    run.total += 1;
    run.latencies.push(latency);
    addLog(status, latency);
    updateUi();
  }
}

function stopRun(reason = 'Stopped') {
  if (!run) return;
  run.stopped = true;
  clearInterval(run.scheduler);
  clearInterval(run.uiTimer);
  clearTimeout(run.finishTimer);
  for (const controller of run.controllers) controller.abort();
  setRunning(false);
  statusPill.textContent = reason;
  const finishedRun = run;
  setTimeout(() => {
    if (run === finishedRun) statusPill.textContent = 'Idle';
  }, 1500);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorBox.textContent = '';
  try {
    if (!$('ownership').checked) throw new Error('Confirm authorization before running a test.');
    const url = parseSafeUrl($('target').value);
    const rps = boundedInt('rps', 1, MAX_RPS);
    const concurrency = boundedInt('concurrency', 1, MAX_CONCURRENCY);
    const duration = boundedInt('duration', 1, MAX_DURATION);

    if (run && !run.stopped) stopRun('Restarting');
    resetMetrics();
    run = {
      url, rps, concurrency, duration,
      total: 0, success: 0, errors: 0, active: 0,
      latencies: [], controllers: new Set(), stopped: false,
      startedAt: performance.now(), scheduler: null, uiTimer: null, finishTimer: null,
    };

    setRunning(true);
    const intervalMs = Math.max(200, Math.ceil(1000 / rps));
    run.scheduler = setInterval(() => sendOne(), intervalMs);
    run.uiTimer = setInterval(updateUi, 100);
    run.finishTimer = setTimeout(() => stopRun('Complete'), duration * 1000);
    sendOne();
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

stopBtn.addEventListener('click', () => stopRun('Stopped'));
$('clearLogs').addEventListener('click', () => {
  logRows.innerHTML = '<tr class="placeholder"><td colspan="4">No requests yet.</td></tr>';
  sparkline.innerHTML = '';
});

resetMetrics();
setRunning(false);
