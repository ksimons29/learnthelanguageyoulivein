# LLYI - Parallel Development Guide

Welcome! This directory contains everything you need for efficient parallel development using git worktrees.

## 🌳 What are Git Worktrees?

Git worktrees allow you to have **multiple branches checked out simultaneously** in different directories.
This means you can:

- Work on multiple features in parallel without switching branches
- Keep different features isolated from each other
- Run tests on one feature while developing another
- No more `git stash` juggling!

## 📂 Repository Structure (and why it saves tokens)

This repo is organized to keep Claude Code and other LLM tools fast and cheap by separating:

1. **Always loaded context** (small, stable)
2. **Active work context** (small, frequently updated)
3. **Reference material** (large, opened only when needed)

The goal is simple: keep the default context minimal, and force large inputs to be explicitly requested.

### Top level folders

- `ios/`
  The iPhone app source (Xcode project, Swift, SwiftUI, tests). This is the only place where production code lives.

- `docs/`
  Documentation split into **active** vs **reference** so we never shove large docs into context by accident.
  - `docs/active/`
    The current spec packet. These files should stay short and are the default starting point for any work.
    - `spec.md` current goal, scope, acceptance criteria
    - `tasks.md` short next task list
    - `decisions.md` lightweight decision log (ADR lite)
  - `docs/product/`
    Product docs (PRD, PR FAQ, vision, business model). Reference only.
  - `docs/design/`
    Design docs (wireframes, flows, UI inventory, copy). Reference only.
  - `docs/engineering/`
    Architecture, data model, API contracts, analytics. Reference only.
  - `docs/reference/`
    Old versions, dumps, meeting notes. Archive.

- `assets/`
  Large inputs that should not be auto loaded.
  - `assets/screenshots/raw/` raw screenshots
  - `assets/screenshots/index.md` a small index describing each screenshot so the right image can be opened on demand
  - `assets/examples/` sample payloads, sample data, example images
  - `assets/examples/index.md` a small index describing each example file

- `prototypes/`
  Throwaway prototypes (for example web prototypes) that help validate flows without touching the iOS codebase.

- `scripts/`
  Local scripts (worktrees, dev helpers, CI helpers). Keeps automation out of docs and out of the main context.

- `tools/`
  Tooling config and notes (editor rules, MCP notes). This prevents random config files from being scattered across root.

- `.claude/`
  Claude Code project configuration.
  - `CLAUDE.md` kept intentionally short: durable project rules only
  - `rules/` small scoped rule files (loaded only when relevant)
  - `commands/` reusable workflows (build, test, review diffs, update spec)
  - `skills/` bigger workflows that should not inflate the default context

### How this optimizes token usage

- **Small "default context":** the repo keeps only a minimal amount of guidance always in scope (mostly `.claude/` + `docs/active/`). Everything else is pulled only when needed.
- **Active spec packet:** `docs/active/` acts as the single source of truth for current work. This reduces repeated explanations and prevents Claude from rereading long PRDs or design dumps.
- **Indexes before heavy files:** screenshots and samples live in `assets/`, with lightweight `index.md` files so the model can select the correct file before opening large content.
- **Reference isolation:** older docs and large research live in `docs/reference/` so they do not pollute day to day work unless explicitly requested.

### Working rule

If a file takes longer than 60 seconds to skim, it belongs in `docs/product/`, `docs/design/`, `docs/engineering/`, or `docs/reference/` not in `.claude/` or `docs/active/`.

## 🚀 Quick Start

### 1. Set Up All Worktrees

```bash
./confabulator/setup-worktrees.sh
```

This creates a separate directory for each epic and task, allowing you to work on them independently.

**Example directory structure after setup:**
```
your-project/              # Main repository
├── confabulator/          # Scripts and docs (you are here)
├── src/
└── ...

../epic-1-worktree/         # Separate worktree for Epic #1
../epic-2-worktree/         # Separate worktree for Epic #2
../task-5-worktree/         # Separate worktree for Task #5
```

### 2. Start Working on Multiple Features

Open multiple terminal windows and work on different features simultaneously:

**Terminal 1 - Work on Epic #1:**
```bash
cd ../epic-1-worktree
# Make changes, commit, test
git add .
git commit -m "feat: implement user authentication"
```

**Terminal 2 - Simultaneously work on Task #5:**
```bash
cd ../task-5-worktree
# Work on a different task in parallel
git add .
git commit -m "feat: add login UI component"
```

### 3. Check Status and Dependencies

```bash
./confabulator/worktree-status.sh
```

This shows:
- 📂 All active worktrees
- 🔗 Dependency relationships between tasks
- 🔀 Recommended merge order (dependencies first)
- ⚠️  Any circular dependency warnings

### 4. Understand Dependencies

```bash
cat confabulator/dependency-graph.md
# Or open in your editor/GitHub for nice rendering
```

The dependency graph shows:
- Which tasks must be completed before others
- Which tasks can be developed in parallel
- The optimal order for merging branches

### 5. Merge Branches in Correct Order

**Important:** Merge branches following the dependency order to avoid conflicts.

**Recommended merge order for this project:**

```bash
git checkout main

# 1. Merge epic #11
git merge epic/11-phrase-capture

# 2. Merge epic #12
git merge epic/12-smart-card-management

# 3. Merge epic #13
git merge epic/13-spaced-repetition-system

# 4. Merge epic #14
git merge epic/14-tagging-and-collections

# 5. Merge epic #15
git merge epic/15-basic-progress-overview

```

### 6. Cleanup When Done

After merging all your branches:

```bash
./confabulator/cleanup-worktrees.sh
```

This removes all worktree directories (after confirmation).

## 📁 File Reference

| File | Purpose |
|------|---------|
| `README.md` | This file - getting started guide |
| `setup-worktrees.sh` | Creates all worktrees for parallel development |
| `cleanup-worktrees.sh` | Removes all worktrees after merging |
| `worktree-status.sh` | Shows current status and dependencies |
| `dependency-graph.md` | Visual dependency diagram (Mermaid) |

## 🔧 Advanced Usage

### Working with Individual Worktrees

```bash
# List all worktrees
git worktree list

# Remove a specific worktree
git worktree remove ../epic-1-worktree

# Add a worktree manually
git worktree add ../my-feature -b feature/my-feature
```

## 🐛 Troubleshooting

### "Worktree already exists"
The setup script automatically skips existing worktrees. This is not an error.

### "Branch already exists"
If you need to recreate a worktree:
```bash
git worktree remove ../epic-1-worktree
git branch -D epic/1-title  # Delete the branch
./confabulator/setup-worktrees.sh  # Run setup again
```

### "fatal: not a git repository"
Make sure you're running scripts from the main repository directory.

### Merge Conflicts
If you encounter conflicts when merging:
1. Resolve conflicts in your editor
2. `git add .` to stage resolved files
3. `git commit` to complete the merge

**Tip:** Following the recommended merge order minimizes conflicts!

## 💡 Pro Tips

1. **Use descriptive commit messages** in each worktree - helps track progress
2. **Run tests in each worktree** before merging to catch issues early
3. **Check dependencies first** - work on tasks with no dependencies for fastest progress
4. **Keep worktrees focused** - one feature per worktree works best
5. **Regular status checks** - run `worktree-status.sh` to track overall progress

## 📚 Learn More

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [GitHub Issues](https://github.com/ksimons29/learnthelanguageyoulivein/issues) - View all issues with detailed requirements
- [Dependency Graph](./dependency-graph.md) - Visual representation of task dependencies

---

🤖 *Generated by [Confabulator](https://vibecodelisboa.com)*
