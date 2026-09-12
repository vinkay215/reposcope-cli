#!/usr/bin/env python3
"""Small CLI for inspecting a public GitHub repository without dependencies."""

import argparse
import json
import urllib.error
import urllib.request


def fetch_repo(repo: str) -> dict:
    url = f"https://api.github.com/repos/{repo}"
    request = urllib.request.Request(
        url,
        headers={"Accept": "application/vnd.github+json", "User-Agent": "RepoScope-CLI"},
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"GitHub returned HTTP {exc.code} for {repo}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Unable to reach GitHub: {exc.reason}") from exc


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect a public GitHub repository")
    parser.add_argument("repo", help="Repository in owner/name format")
    parser.add_argument("--json", action="store_true", help="Print selected data as JSON")
    args = parser.parse_args()

    if args.repo.count("/") != 1:
        parser.error("repo must use owner/name format")

    data = fetch_repo(args.repo)
    summary = {
        "repository": data.get("full_name"),
        "description": data.get("description"),
        "stars": data.get("stargazers_count"),
        "forks": data.get("forks_count"),
        "open_issues": data.get("open_issues_count"),
        "language": data.get("language"),
        "default_branch": data.get("default_branch"),
        "license": (data.get("license") or {}).get("spdx_id"),
    }

    if args.json:
        print(json.dumps(summary, indent=2, ensure_ascii=False))
        return

    print(f"Repository : {summary['repository']}")
    print(f"Description: {summary['description'] or '-'}")
    print(f"Language   : {summary['language'] or '-'}")
    print(f"Stars      : {summary['stars']}")
    print(f"Forks      : {summary['forks']}")
    print(f"Open issues: {summary['open_issues']}")
    print(f"Branch     : {summary['default_branch']}")
    print(f"License    : {summary['license'] or '-'}")


if __name__ == "__main__":
    main()
