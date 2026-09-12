# Output Format

RepoScope CLI supports two output modes: a human-readable terminal summary and a JSON representation intended for scripts and automation.

## Terminal output

The default command prints a compact repository summary:

```bash
python github_inspector.py python/cpython
```

Typical fields include:

- Repository name
- Description
- Primary language
- Star count
- Fork count
- Open issue count
- Default branch
- License

Example:

```text
Repository : python/cpython
Description: The Python programming language
Language   : Python
Stars      : ...
Forks      : ...
Open issues: ...
Branch     : main
License    : Python-2.0
```

## JSON output

Use `--json` when RepoScope is called from another program or shell pipeline:

```bash
python github_inspector.py python/cpython --json
```

JSON output is useful for:

- CI scripts
- Shell automation
- Data collection
- Piping repository metadata into other tools

Consumers should avoid depending on terminal spacing or labels when machine-readable output is required. Prefer the JSON mode instead.

## Error behavior

RepoScope reports basic network and GitHub API errors rather than silently returning incomplete repository information. Callers should treat failed requests separately from successful repository summaries.

## Compatibility

The project is designed for Python 3.9 or newer and uses only the Python standard library.
