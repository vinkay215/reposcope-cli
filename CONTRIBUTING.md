# Contributing

Thanks for contributing to RepoScope CLI.

## Workflow

1. Create a branch from `main`.
2. Keep each change focused on one purpose.
3. Run the CLI locally before opening a pull request.
4. Use a descriptive commit and PR title.
5. Explain what changed and how it was verified.

## Quick verification

```bash
python github_inspector.py python/cpython
python github_inspector.py python/cpython --json
python -m py_compile github_inspector.py
```

## Collaboration

When a commit genuinely has multiple authors, GitHub's standard `Co-authored-by` trailer may be used to preserve attribution.
