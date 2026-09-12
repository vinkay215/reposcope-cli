# SafeLoad Lab

SafeLoad Lab is a small browser-based load-testing utility for services you own and run locally. It is intentionally constrained to loopback targets and conservative traffic limits.

## Safety limits

- Allowed targets: `localhost`, `127.0.0.1`, `[::1]`
- Maximum requests per second: `5`
- Maximum concurrency: `3`
- Maximum test duration: `30 seconds`
- Per-request timeout: `5 seconds`
- Manual emergency stop button
- Authorization checkbox required before each run

These limits are enforced in `script.js`, not only by the form controls.

## Features

- Responsive HTML/CSS dashboard
- Live request, success, error, and latency metrics
- Small latency sparkline
- Latest-request log
- Automatic stop at the configured duration
- AbortController-based request timeout and emergency stop
- No build step and no third-party JavaScript dependencies

## Run locally

Serve the repository with any static HTTP server, for example:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Start a separate local service that you are authorized to test, enter its loopback URL, choose a bounded profile, confirm authorization, and start the run.

## Project structure

```text
.
├── index.html
├── styles.css
├── script.js
├── README.md
├── CONTRIBUTING.md
└── CHANGELOG.md
```

## Scope

SafeLoad Lab is designed for development and educational testing of local services. It intentionally refuses remote hosts and is not intended for stress testing third-party infrastructure.
