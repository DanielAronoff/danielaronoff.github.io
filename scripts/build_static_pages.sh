#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RBENV_VERSION="${RBENV_VERSION:-3.2.3}"
BUNDLE_BIN="/Users/danielaronoff/.rbenv/shims/bundle"

"$BUNDLE_BIN" exec jekyll build -d "$ROOT_DIR/docs"
touch "$ROOT_DIR/docs/.nojekyll"
