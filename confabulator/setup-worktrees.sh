#!/bin/bash
#
# Git Worktree Setup Script
# Project: LLYI
# Repository: https://github.com/ksimons29/learnthelanguageyoulivein
# Generated: 2026-01-12T17:40:08.738Z
#
# This script creates separate git worktrees for each task and epic,
# enabling parallel development without branch conflicts.
#

set -e  # Exit on error

echo "🌳 Setting up git worktrees for parallel development..."
echo ""

# ================================================
# EPICS
# ================================================

# Epic #11: Phrase Capture
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #11..."
git worktree add ../epic-11-worktree -b epic/11-phrase-capture 2>/dev/null || echo "  Worktree already exists"

# Epic #12: Smart Card Management
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #12..."
git worktree add ../epic-12-worktree -b epic/12-smart-card-management 2>/dev/null || echo "  Worktree already exists"

# Epic #13: Spaced Repetition System
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #13..."
git worktree add ../epic-13-worktree -b epic/13-spaced-repetition-system 2>/dev/null || echo "  Worktree already exists"

# Epic #14: Tagging and Collections
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #14..."
git worktree add ../epic-14-worktree -b epic/14-tagging-and-collections 2>/dev/null || echo "  Worktree already exists"

# Epic #15: Basic Progress Overview
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #15..."
git worktree add ../epic-15-worktree -b epic/15-basic-progress-overview 2>/dev/null || echo "  Worktree already exists"

echo ""
echo "✅ Worktree setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. View all worktrees: git worktree list"
echo "2. Check dependencies: ./confabulator/worktree-status.sh"
echo "3. Start working: cd <worktree-directory>"
echo ""
echo "🔀 Recommended merge order (dependencies first):"
echo "  1. #11 - Phrase Capture"
echo "  2. #12 - Smart Card Management"
echo "  3. #13 - Spaced Repetition System"
echo "  4. #14 - Tagging and Collections"
echo "  5. #15 - Basic Progress Overview"
echo ""
echo "To cleanup all worktrees: ./confabulator/cleanup-worktrees.sh"
