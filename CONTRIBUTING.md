# Contributing to SafeLoad Lab

Thanks for contributing.

## Project rules

SafeLoad Lab is intentionally limited to local, authorized testing. Changes must preserve the safety boundaries in `script.js`.

Do not remove or weaken:

- loopback-only target validation,
- maximum 5 requests/second,
- maximum concurrency of 3,
- maximum duration of 30 seconds,
- request timeout and emergency stop behavior.

## Workflow

1. Create a branch from `main`.
2. Keep each change focused.
3. Test the UI with a local HTTP service.
4. Verify remote hosts remain rejected.
5. Verify form values above the hard limits remain rejected.
6. Open a pull request describing the behavior tested.

## Suggested verification

Run a local target, for example:

```bash
python3 -m http.server 3000
```

Then serve SafeLoad Lab separately and verify both a normal run and the emergency stop button.
