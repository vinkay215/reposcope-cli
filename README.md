<div align="center">

# 🧪 SafeLoad

**A compact, browser-based load-testing dashboard for services you own and run locally.**

Built with plain **HTML, CSS, and JavaScript**. No build step. No third-party runtime dependencies.

![Status](https://img.shields.io/badge/status-active-22c55e?style=flat-square)
![Frontend](https://img.shields.io/badge/frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-0ea5e9?style=flat-square)
![Safety](https://img.shields.io/badge/safety-loopback%20only-f59e0b?style=flat-square)
![License](https://img.shields.io/badge/use-authorized%20testing%20only-ef4444?style=flat-square)

</div>

---

## ✨ Overview

SafeLoad Lab is designed for small, controlled performance checks during local development. It helps you observe request throughput, response status, latency, and failures without needing a heavy benchmarking stack.

The current implementation intentionally limits traffic and only allows loopback targets so the project stays focused on safe development and educational testing.

## 🚀 Features

- Live request, success, and error counters
- Average latency tracking
- Lightweight latency sparkline
- Latest-request activity log
- Configurable requests per second
- Configurable concurrency
- Configurable test duration
- Automatic per-request timeout
- Emergency stop with `AbortController`
- Responsive dark dashboard
- Zero build tooling
- Zero third-party JavaScript dependencies

## 🛡️ Safety boundaries

The browser enforces the following limits in `script.js`:

| Limit | Value |
| --- | ---: |
| Allowed hosts | `localhost`, `127.0.0.1`, `[::1]` |
| Maximum RPS | `5` |
| Maximum concurrency | `3` |
| Maximum duration | `30 seconds` |
| Request timeout | `5 seconds` |
| Authorization confirmation | Required |
| Manual emergency stop | Available |

> SafeLoad Lab is intended for services you own or are explicitly authorized to test. Remote third-party targets are rejected by design.

## 🖥️ Quick start

Clone the repository and serve it with any static HTTP server.

```bash
git clone https://github.com/vinkay215/reposcope-cli.git
cd reposcope-cli
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Start a separate local service, for example on port `3000`, then enter its URL in SafeLoad Lab:

```text
http://localhost:3000/
```

Choose a bounded profile, confirm authorization, and start the test.

## 📁 Project structure

```text
.
├── index.html          # Dashboard UI
├── styles.css          # Responsive dark interface
├── script.js           # Validation, scheduler, metrics and safety limits
├── README.md           # Project documentation
├── CONTRIBUTING.md     # Contribution guide
└── CHANGELOG.md        # Release history
```

## 📊 What the dashboard shows

During a run, SafeLoad Lab displays:

| Metric | Description |
| --- | --- |
| Total | Number of completed requests |
| Success | Successful HTTP responses |
| Errors | Failed requests or non-success responses |
| Avg latency | Mean request duration |
| Progress | Current run completion |
| Request log | Recent status and latency samples |

## 🔒 Design philosophy

SafeLoad Lab favors **predictable behavior over maximum traffic generation**.

The safety model is enforced in JavaScript rather than relying only on HTML form limits. Host validation, hard caps, timeouts, and emergency cancellation are all part of the runtime logic.

## 🗺️ Roadmap

Planned improvements include:

- p50 / p95 / p99 latency metrics
- Step and ramp load profiles
- Multi-endpoint scenarios
- Threshold-based automatic stopping
- JSON / CSV report export
- Improved run history
- Better visualization of latency trends

## 🤝 Contributing

Contributions are welcome. Please keep changes focused and preserve the project's safety boundaries.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the recommended workflow.

## ⚠️ Responsible use

Use this project only on systems you own or have explicit permission to test. Do not modify the safety controls to target third-party infrastructure or generate abusive traffic.

---

<div align="center">

**SafeLoad Lab** · Small, observable, controlled load testing for local development.

</div>
