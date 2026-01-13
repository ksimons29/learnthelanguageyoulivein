#!/bin/bash
#
# Git Worktree Status Script
# Project: LLYI
# Generated: 2026-01-12T17:40:08.738Z
#
# Shows the status of all worktrees and their dependencies.
#

echo "📊 Worktree Status - LLYI"
echo "="
echo ""

echo "📂 Active Worktrees:"
git worktree list
echo ""

echo "🔗 Dependency Summary:"
echo ""
echo "Epics:"
echo "  ✅ #11 - Phrase Capture (no dependencies)"
echo "  ✅ #12 - Smart Card Management (no dependencies)"
echo "  ✅ #13 - Spaced Repetition System (no dependencies)"
echo "  ✅ #14 - Tagging and Collections (no dependencies)"
echo "  ✅ #15 - Basic Progress Overview (no dependencies)"
echo ""
echo "🔀 Recommended Merge Order:"
echo "  1. 📦 #11 - Phrase Capture"
echo "  2. 📦 #12 - Smart Card Management"
echo "  3. 📦 #13 - Spaced Repetition System"
echo "  4. 📦 #14 - Tagging and Collections"
echo "  5. 📦 #15 - Basic Progress Overview"
echo ""
echo "💡 Tips:"
echo "  - Work on tasks with no dependencies first"
echo "  - Merge branches in the order shown above"
echo "  - Check GitHub issues for detailed requirements"
echo ""