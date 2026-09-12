# SafeLoad Pro

SafeLoad Pro is the next iteration of SafeLoad Lab focused on controlled, authorized benchmark testing.

## Planned improvements

- Multiple load profiles: constant, ramp-up, step and short spike tests.
- Live latency percentiles: p50, p95 and p99.
- Error-rate thresholds with automatic stop conditions.
- Multi-endpoint scenarios for localhost services.
- JSON/CSV report export.
- Safer request customization for methods, headers and request bodies.
- Hard-coded request ceilings and loopback/private-lab allowlists.
- Emergency stop and per-request timeout controls.

## Safety boundary

SafeLoad Pro is intended for services you own or are explicitly authorized to test. It is not designed for denial-of-service use. The implementation should preserve hard caps on request rate, concurrency and duration, and should reject non-approved targets.
