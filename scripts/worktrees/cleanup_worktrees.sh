#!/bin/bash
#
# Git Worktree Cleanup Script
# Project: LLYI
# Generated: 2026-01-12T17:40:08.738Z
#
# This script removes all worktrees created by the setup script.
#

set -e  # Exit on error

echo "🧹 Cleaning up git worktrees..."
echo ""

# Confirm before proceeding
read -p "This will remove all worktrees. Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cleanup cancelled."
  exit 0
fi

echo "Removing worktree: ../epic-11-worktree..."
git worktree remove ../epic-11-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../epic-12-worktree..."
git worktree remove ../epic-12-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../epic-13-worktree..."
git worktree remove ../epic-13-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../epic-14-worktree..."
git worktree remove ../epic-14-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../epic-15-worktree..."
git worktree remove ../epic-15-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To recreate worktrees: ./confabulator/setup-worktrees.sh"
