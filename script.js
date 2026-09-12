const MAX_RPS = 5;
const MAX_CONCURRENCY = 3;
const MAX_DURATION = 30;
const REQUEST_TIMEOUT_MS = 5000;
const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

const $ = (id) => document.getElementById(id);
const form = $('testForm');
const startBtn = $('startBtn');
const stopBtn = $('stopBtn');
const exportBtn = $('exportBtn');
const statusPill = $('statusPill');
const errorBox = $('errorBox');
const logRows = $('logRows');
const sparkline = $('sparkline');

let run = null;
let lastReport = null;

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

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
}

function stats() {
  const latencies = run?.latencies || [];
  const total = run?.total || 0;
  const errors = run?.errors || 0;
  const avg = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
  return {
    avg,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    errorRate: total ? (errors / total) * 100 : 0,
  };
}

function currentRps() {
  if (!run) return 0;
  const elapsed = Math.max(0, (performance.now() - run.startedAt) / 1000);
  const progress = Math.min(1, elapsed / run.duration);
  if (run.profile === 'ramp') return Math.min(run.rps, Math.max(1, Math.ceil(progress * run.rps)));
  if (run.profile === 'step') {
    const stage = progress < 1 / 3 ? 1 : progress < 2 / 3 ? 2 : 3;
    return Math.min(run.rps, Math.max(1, Math.ceil((run.rps * stage) / 3)));
  }
  return run.rps;
}

function resetMetrics() {
  ['total', 'success', 'errors'].forEach((id) => $(id).textContent = '0');
  ['latency', 'p50', 'p95', 'p99'].forEach((id) => $(id).textContent = '0 ms');
  $('errorRate').textContent = '0%';
  $('elapsed').textContent = '0.0s';
  $('effectiveRps').textContent = '0';
  $('activeRequests').textContent = '0';
  $('stopReason').textContent = '—';
  $('progressBar').style.width = '0%';
  sparkline.innerHTML = '';
  logRows.innerHTML = '<tr class="placeholder"><td colspan="5">No requests yet.</td></tr>';
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
  const s = stats();
  $('total').textContent = String(run.total);
  $('success').textContent = String(run.success);
  $('errors').textContent = String(run.errors);
  $('errorRate').textContent = `${s.errorRate.toFixed(1)}%`;
  $('latency').textContent = `${Math.round(s.avg)} ms`;
  $('p50').textContent = `${Math.round(s.p50)} ms`;
  $('p95').textContent = `${Math.round(s.p95)} ms`;
  $('p99').textContent = `${Math.round(s.p99)} ms`;
  $('elapsed').textContent = `${elapsed.toFixed(1)}s`;
  $('effectiveRps').textContent = String(currentRps());
  $('activeRequests').textContent = String(run.active);
  $('progressBar').style.width = `${Math.min(100, (elapsed / run.duration) * 100)}%`;

  const samples = run.latencies.slice(-40);
  const peak = Math.max(1, ...samples);
  sparkline.innerHTML = samples.map((ms) => `<i class="bar" style="height:${Math.max(4, Math.round(ms / peak * 100))}%" title="${Math.round(ms)} ms"></i>`).join('');
}

function addLog(status, latency, rps) {
  if (logRows.querySelector('.placeholder')) logRows.innerHTML = '';
  const tr = document.createElement('tr');
  const ok = status >= 200 && status < 400;
  tr.innerHTML = `<td>${run.total}</td><td class="${ok ? 'ok' : 'bad'}">${status || 'ERR'}</td><td>${Math.round(latency)} ms</td><td>${rps}</td><td>${new Date().toLocaleTimeString()}</td>`;
  logRows.prepend(tr);
  while (logRows.children.length > 30) logRows.lastElementChild.remove();
}

function checkThresholds() {
  if (!run || run.total < 5 || run.stopped) return;
  const s = stats();
  if (s.errorRate >= run.maxErrorRate) {
    stopRun(`Auto-stop: error rate ${s.errorRate.toFixed(1)}%`);
    return;
  }
  if (s.p95 >= run.maxP95) {
    stopRun(`Auto-stop: p95 ${Math.round(s.p95)} ms`);
  }
}

async function sendOne() {
  if (!run || run.stopped || run.active >= run.concurrency) return;
  const rpsAtDispatch = currentRps();
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
      headers: { 'X-SafeLoad-Pro': 'authorized-local-test' },
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
    run.samples.push({ index: run.total, status, latency: Math.round(latency), rps: rpsAtDispatch, at: new Date().toISOString() });
    addLog(status, latency, rpsAtDispatch);
    updateUi();
    checkThresholds();
  }
}

function scheduleTick() {
  if (!run || run.stopped) return;
  const desired = currentRps();
  const now = performance.now();
  const elapsed = now - run.lastDispatchAt;
  const intervalMs = 1000 / desired;
  if (elapsed >= intervalMs) {
    run.lastDispatchAt = now;
    sendOne();
  }
}

function buildReport(reason) {
  if (!run) return null;
  const s = stats();
  return {
    tool: 'SafeLoad Pro',
    generatedAt: new Date().toISOString(),
    target: run.url.toString(),
    profile: run.profile,
    limits: { maxRps: MAX_RPS, maxConcurrency: MAX_CONCURRENCY, maxDurationSeconds: MAX_DURATION },
    configuration: {
      requestedRps: run.rps,
      concurrency: run.concurrency,
      durationSeconds: run.duration,
      maxErrorRatePercent: run.maxErrorRate,
      maxP95Milliseconds: run.maxP95,
    },
    result: {
      reason,
      total: run.total,
      success: run.success,
      errors: run.errors,
      errorRatePercent: Number(s.errorRate.toFixed(2)),
      averageLatencyMs: Math.round(s.avg),
      p50LatencyMs: Math.round(s.p50),
      p95LatencyMs: Math.round(s.p95),
      p99LatencyMs: Math.round(s.p99),
    },
    samples: run.samples,
  };
}

function stopRun(reason = 'Stopped') {
  if (!run || run.stopped) return;
  run.stopped = true;
  clearInterval(run.scheduler);
  clearInterval(run.uiTimer);
  clearTimeout(run.finishTimer);
  for (const controller of run.controllers) controller.abort();
  setRunning(false);
  $('stopReason').textContent = reason;
  statusPill.textContent = reason;
  lastReport = buildReport(reason);
  exportBtn.disabled = !lastReport;
  const finishedRun = run;
  setTimeout(() => {
    if (run === finishedRun) statusPill.textContent = 'Idle';
  }, 2000);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorBox.textContent = '';
  try {
    if (!$('ownership').checked) throw new Error('Confirm authorization before running a test.');
    const url = parseSafeUrl($('target').value);
    const profile = $('profile').value;
    if (!['constant', 'ramp', 'step'].includes(profile)) throw new Error('Unsupported profile.');
    const rps = boundedInt('rps', 1, MAX_RPS);
    const concurrency = boundedInt('concurrency', 1, MAX_CONCURRENCY);
    const duration = boundedInt('duration', 1, MAX_DURATION);
    const maxErrorRate = boundedInt('maxErrorRate', 5, 100);
    const maxP95 = boundedInt('maxP95', 100, REQUEST_TIMEOUT_MS);

    if (run && !run.stopped) stopRun('Restarting');
    resetMetrics();
    lastReport = null;
    exportBtn.disabled = true;
    run = {
      url, profile, rps, concurrency, duration, maxErrorRate, maxP95,
      total: 0, success: 0, errors: 0, active: 0,
      latencies: [], samples: [], controllers: new Set(), stopped: false,
      startedAt: performance.now(), lastDispatchAt: 0,
      scheduler: null, uiTimer: null, finishTimer: null,
    };

    setRunning(true);
    run.scheduler = setInterval(scheduleTick, 50);
    run.uiTimer = setInterval(updateUi, 100);
    run.finishTimer = setTimeout(() => stopRun('Complete'), duration * 1000);
    scheduleTick();
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

stopBtn.addEventListener('click', () => stopRun('Stopped manually'));
$('clearLogs').addEventListener('click', () => {
  logRows.innerHTML = '<tr class="placeholder"><td colspan="5">No requests yet.</td></tr>';
  sparkline.innerHTML = '';
});
$('profile').addEventListener('change', () => {
  $('profileHint').textContent = $('profile').selectedOptions[0].textContent;
});
exportBtn.addEventListener('click', () => {
  if (!lastReport) return;
  const blob = new Blob([JSON.stringify(lastReport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `safeload-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

resetMetrics();
setRunning(false);
