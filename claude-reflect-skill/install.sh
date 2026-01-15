#!/bin/bash
# Install self-improving reflect skill for Claude Code

set -e

CLAUDE_DIR="$HOME/.claude"
SKILLS_DIR="$CLAUDE_DIR/skills"
COMMANDS_DIR="$CLAUDE_DIR/commands"

echo "Installing reflect skill for Claude Code..."

# Create directories
mkdir -p "$SKILLS_DIR/reflect"
mkdir -p "$COMMANDS_DIR"

# Copy skill
cp -r skills/reflect/* "$SKILLS_DIR/reflect/"
echo "✓ Installed reflect skill"

# Copy commands
cp commands/*.md "$COMMANDS_DIR/"
echo "✓ Installed slash commands: /reflect, /reflect-on, /reflect-off, /reflect-status"

# Initialize git if not exists
if [ ! -d "$SKILLS_DIR/.git" ]; then
    cd "$SKILLS_DIR"
    git init
    git add -A
    git commit -m "Initial commit: reflect skill for self-improving memory"
    echo "✓ Initialized Git repository for version control"
else
    echo "✓ Git repository already exists"
fi

echo ""
echo "Installation complete!"
echo ""
echo "Usage:"
echo "  /reflect          - Extract learnings from current conversation"
echo "  /reflect <skill>  - Target a specific skill"
echo "  /reflect-on       - Enable semi-automatic reflection prompts"
echo "  /reflect-off      - Disable prompts"
echo "  /reflect-status   - Check current state and recent learnings"
echo ""
echo "Your skills are version-controlled in: $SKILLS_DIR"
echo "View learning history with: cd $SKILLS_DIR && git log --oneline"
