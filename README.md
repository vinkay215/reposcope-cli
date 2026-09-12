<div align="center">

# ⚡ SafeLoad Lab

### Controlled local load testing with a clean real-time dashboard

**Fast to run · Easy to inspect · Safe by design**

Built with **HTML · CSS · JavaScript** — no framework, no build step, no runtime dependencies.

![Status](https://img.shields.io/badge/status-active-22c55e?style=for-the-badge)
![Runtime](https://img.shields.io/badge/runtime-browser-2563eb?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-f59e0b?style=for-the-badge)
![Safety](https://img.shields.io/badge/safety-loopback%20only-ef4444?style=for-the-badge)

<br>

> A lightweight performance-testing playground for services you own and run locally.

</div>

---

## 🧭 What is SafeLoad Lab?

SafeLoad Lab is a browser-based load-testing dashboard for **small, controlled performance checks during local development**.

It lets you generate bounded HTTP traffic against a local service while watching request volume, success/failure counts, latency, progress, and recent activity in real time.

The project deliberately prioritizes **visibility, predictability, and safety** over raw traffic generation.

---

## ✨ Current capabilities

| Area | Capability |
| --- | --- |
| 🎯 Targeting | Loopback-only targets: `localhost`, `127.0.0.1`, `[::1]` |
| ⚙️ Load controls | Configurable RPS, concurrency, and duration |
| 📊 Observability | Total, success, error, average latency, progress |
| 📈 Visualization | Lightweight latency sparkline |
| 🧾 Logging | Recent request status + latency table |
| ⏱ Reliability | Per-request timeout with `AbortController` |
| 🛑 Safety | Emergency stop button |
| ✅ Authorization | Explicit confirmation required before every run |
| 🧩 Architecture | Plain static HTML/CSS/JS |
| 📦 Dependencies | None at runtime |

---

## 🛡️ Hard safety limits

These are enforced in `script.js`, not only through HTML form attributes.

| Guardrail | Current value |
| --- | ---: |
| Allowed hosts | `localhost`, `127.0.0.1`, `[::1]` |
| Maximum requests / second | `5` |
| Maximum concurrency | `3` |
| Maximum duration | `30 seconds` |
| Per-request timeout | `5 seconds` |
| Authorization checkbox | Required |
| Emergency stop | Enabled |

> [!IMPORTANT]
> SafeLoad Lab is intended only for systems you own or are explicitly authorized to test. Remote third-party targets are rejected by design.

---

## 🔄 How a test run works

```text
┌──────────────────────┐
│  Configure profile   │
│ URL · RPS · workers  │
│      · duration      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Validate safety      │
│ loopback + hard caps │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Schedule requests    │
│ bounded concurrency  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Observe live metrics │
│ status · latency     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Complete or stop     │
│ timeout / emergency  │
└──────────────────────┘
```

---

## 🚀 Quick start

Clone the repository:

```bash
git clone https://github.com/vinkay215/reposcope-cli.git
cd reposcope-cli
```

Serve the static files:

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

Then point SafeLoad Lab at a local service you own, for example:

```text
http://localhost:3000/
```

Choose a bounded profile, confirm authorization, and start the run.

---

## 📊 Live dashboard

During a test, the interface exposes the core signals you need immediately:

| Metric | Meaning |
| --- | --- |
| **Total** | Completed requests |
| **Success** | Successful responses |
| **Errors** | Failed requests or unsuccessful responses |
| **Avg latency** | Mean request duration |
| **Progress** | Percentage of the configured run completed |
| **Request log** | Recent status and latency samples |
| **Sparkline** | Relative latency trend |

---

## 🧱 Project structure

```text
.
├── index.html          # Main dashboard interface
├── styles.css          # Responsive dark-mode styling
├── script.js           # Scheduler, metrics, validation, safety caps
├── README.md           # Project documentation
├── CONTRIBUTING.md     # Contribution workflow
└── CHANGELOG.md        # Project history
```

---

## 🧠 Design principles

SafeLoad Lab is built around four rules:

1. **Safe by default** — dangerous targets and excessive load are rejected.
2. **Observable by default** — every run should expose useful metrics while it executes.
3. **Small enough to understand** — no framework is required to inspect the implementation.
4. **Easy to stop** — tests are bounded by timeouts, duration limits, and manual cancellation.

---

## 🧪 Example local test setup

A simple development workflow might look like this:

```text
Terminal A: local app
http://localhost:3000

Terminal B: SafeLoad Lab static server
http://localhost:8080

Browser:
SafeLoad Lab → target http://localhost:3000/
```

This makes it useful for checking local API behavior, latency changes, error handling, and basic capacity regressions during development.

---

## 🔭 SafeLoad Pro roadmap

The next stage of the project is focused on deeper **authorized performance analysis**, not unrestricted traffic generation.

### Planned observability

- p50 / p95 / p99 latency
- requests-per-second timeline
- error-rate timeline
- status-code distribution
- run history
- comparative benchmark summaries

### Planned test profiles

- constant load
- ramp-up profile
- step profile
- short spike profile with bounded ceilings
- multi-endpoint scenarios

### Planned automation

- latency threshold stop
- error-rate threshold stop
- JSON report export
- CSV report export
- reusable local test profiles

### Safety stays non-negotiable

Future features should continue to preserve:

- explicit authorization
- allowlisted targets
- hard traffic ceilings
- short timeouts
- bounded duration
- emergency stop controls

---

## 🧪 Current vs planned

| Capability | Status |
| --- | :---: |
| Loopback target validation | ✅ |
| RPS control | ✅ |
| Concurrency control | ✅ |
| Duration cap | ✅ |
| Live counters | ✅ |
| Average latency | ✅ |
| Request log | ✅ |
| Emergency stop | ✅ |
| p50 / p95 / p99 | 🛠 Planned |
| Ramp / step profiles | 🛠 Planned |
| Multi-endpoint scenarios | 🛠 Planned |
| Threshold-based auto-stop | 🛠 Planned |
| JSON / CSV reports | 🛠 Planned |

---

## 🤝 Contributing

Contributions are welcome when they keep the project focused on **safe, measurable, authorized testing**.

Recommended contribution areas:

- UI/UX improvements
- metrics and visualization
- local test scenarios
- documentation
- testability
- accessibility
- safety validation

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the workflow.

---

## ⚠️ Responsible use

Use SafeLoad Lab only on infrastructure you own or have explicit permission to test.

Do not remove safety controls to target third-party systems, evade rate limits, or generate abusive traffic.

---

<div align="center">

### SafeLoad Lab

**Small footprint. Clear metrics. Controlled testing.**

Made for local development and authorized performance experiments.

</div>
