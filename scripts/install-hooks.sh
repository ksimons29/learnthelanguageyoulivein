#!/bin/bash

# Install git hooks for LLYLI project
# Run this after cloning the repo: ./scripts/install-hooks.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(dirname "$SCRIPT_DIR")/.git/hooks"

echo "Installing git hooks..."

# Copy pre-commit hook
cp "$SCRIPT_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Pre-commit hook installed"
echo ""
echo "The hook will remind you to update CHANGELOG.md when making commits"
echo "with more than 2 significant file changes."
