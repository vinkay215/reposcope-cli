# Error Handling

RepoScope CLI is designed to fail clearly when GitHub repository data cannot be retrieved.

## Common error cases

### Repository not found

If the repository does not exist, is private, or cannot be accessed through the public GitHub API, RepoScope should return a clear error instead of an empty result.

Example:

```text
Error: repository not found or not publicly accessible.
```

### Invalid repository format

Repository names should use the `owner/name` format.

Valid:

```text
python/cpython
```

Invalid:

```text
python
https://github.com/python/cpython
```

### Network timeout

RepoScope uses a request timeout so the CLI does not wait indefinitely when GitHub is unavailable or the network is unstable.

Example:

```text
Error: request timed out while contacting GitHub.
```

### GitHub API rate limit

Unauthenticated GitHub API requests are rate limited. If the limit is reached, RepoScope should report the problem clearly.

Example:

```text
Error: GitHub API rate limit exceeded. Try again later.
```

Future versions may support authenticated requests to increase the available API rate limit.

### Invalid API response

If GitHub returns malformed or unexpected data, RepoScope should avoid crashing with an unreadable traceback and instead provide a concise error message.

## Exit behavior

A successful inspection should exit normally.

Errors such as invalid input, failed network requests, or unavailable repositories should result in a non-zero exit status so RepoScope can be used reliably in shell scripts and automation.

Example:

```bash
python github_inspector.py python/cpython
echo $?
```

A value of `0` indicates success. A non-zero value indicates that the inspection failed.

## JSON mode

When `--json` is used, scripts should not assume repository fields are available after a failed request. Callers should check the process exit code before parsing the output.

## Troubleshooting

If a request fails:

1. Confirm the repository exists and is public.
2. Verify the repository name uses `owner/name` syntax.
3. Check the internet connection.
4. Retry later if the GitHub API rate limit has been reached.
5. Run the command without `--json` first if you need a more readable diagnostic message.
