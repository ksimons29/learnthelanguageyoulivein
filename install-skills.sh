#!/bin/bash

# Install Custom Claude Skills
# Usage: ./install-skills.sh [target-directory]
#
# If no target directory is provided, it will try common Claude skills locations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Skills to install
SKILLS=(
    "apple-reminders-system"
    "linkedin-optimizer"
    "content-writer"
    "email-newsletter-writer"
    "user-research-synthesizer"
    "prd-generator"
    "api-documentation"
    "changelog-generator"
    "technical-spec-writer"
    "code-review"
    "commit-message-generator"
    "test-generator"
    "database-query-helper"
)

# Determine target directory
if [ -n "$1" ]; then
    TARGET_DIR="$1"
elif [ -d "$HOME/.claude/skills" ]; then
    TARGET_DIR="$HOME/.claude/skills"
elif [ -d "$HOME/Library/Application Support/Claude/skills" ]; then
    TARGET_DIR="$HOME/Library/Application Support/Claude/skills"
else
    echo "Could not find Claude skills directory."
    echo ""
    echo "Usage: $0 <target-directory>"
    echo ""
    echo "Common locations:"
    echo "  macOS: ~/Library/Application Support/Claude/skills"
    echo "  Linux: ~/.claude/skills"
    echo "  Or specify your custom skills folder"
    exit 1
fi

echo "Installing skills to: $TARGET_DIR"
echo ""

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy each skill
installed=0
skipped=0

for skill in "${SKILLS[@]}"; do
    src="$SCRIPT_DIR/$skill"
    dest="$TARGET_DIR/$skill"
    
    if [ -d "$src" ]; then
        if [ -d "$dest" ]; then
            echo "⚠️  $skill already exists, skipping (use --force to overwrite)"
            ((skipped++))
        else
            cp -r "$src" "$dest"
            echo "✅ Installed: $skill"
            ((installed++))
        fi
    else
        echo "❌ Not found: $skill"
    fi
done

echo ""
echo "Done! Installed $installed skills, skipped $skipped."
echo ""
echo "To use these skills, restart Claude or reload your skills."
