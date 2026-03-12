#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RBENV_VERSION="${RBENV_VERSION:-3.2.3}"

RBENV_VERSION="${RBENV_VERSION}" /Users/danielaronoff/.rbenv/shims/bundle exec jekyll build -d "$ROOT_DIR/docs"
touch "$ROOT_DIR/docs/.nojekyll"
