#!/usr/bin/env node

/**
 * Archive Project Log
 *
 * Automatically archives old sessions from PROJECT_LOG.md to PROJECT_LOG_ARCHIVE.md
 * when the file exceeds the size limit.
 *
 * Usage:
 *   node scripts/archive-project-log.js [--check-only]
 *
 * Options:
 *   --check-only  Only check if archiving is needed, don't perform archiving
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const LOG_FILE = path.join(PROJECT_ROOT, 'PROJECT_LOG.md');
const ARCHIVE_FILE = path.join(PROJECT_ROOT, 'PROJECT_LOG_ARCHIVE.md');

const MAX_LINES = 900;
const SESSIONS_TO_KEEP = 10;

function countLines(filePath) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

function checkLogSize() {
  const lineCount = countLines(LOG_FILE);
  console.log(`📊 PROJECT_LOG.md: ${lineCount} lines (limit: ${MAX_LINES})`);

  if (lineCount > MAX_LINES) {
    console.log(`⚠️  PROJECT_LOG.md exceeds ${MAX_LINES} lines and needs archiving`);
    return false;
  }

  console.log('✅ PROJECT_LOG.md size is acceptable');
  return true;
}

function extractSessions(content) {
  const lines = content.split('\n');
  const sessions = [];
  let currentSession = null;
  let sessionStartLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match session headers like "### Session 79 - 2026-01-23 - Title"
    const sessionMatch = line.match(/^### Session (\d+) - (.+)$/);

    if (sessionMatch) {
      // Save previous session if exists
      if (currentSession) {
        currentSession.endLine = i - 1;
        currentSession.content = lines.slice(sessionStartLine, i).join('\n');
        sessions.push(currentSession);
      }

      // Start new session
      currentSession = {
        number: parseInt(sessionMatch[1]),
        title: sessionMatch[2],
        startLine: i,
      };
      sessionStartLine = i;
    }
  }

  // Save last session
  if (currentSession) {
    currentSession.endLine = lines.length - 1;
    currentSession.content = lines.slice(sessionStartLine).join('\n');
    sessions.push(currentSession);
  }

  return sessions;
}

function compressSession(session) {
  const lines = session.content.split('\n');
  const summary = [];
  const files = [];

  // Extract focus/summary
  for (const line of lines) {
    if (line.startsWith('**Focus:**') || line.startsWith('**Summary:**')) {
      summary.push(line.replace(/^\*\*\w+:\*\* /, ''));
    }
  }

  // Extract files
  for (const line of lines) {
    if (line.includes('.ts') || line.includes('.tsx') || line.includes('.js')) {
      const fileMatch = line.match(/`([^`]+\.(ts|tsx|js|jsx|md))`/);
      if (fileMatch && !files.includes(fileMatch[1])) {
        files.push(fileMatch[1]);
      }
    }
  }

  // Extract issues
  const issues = [];
  for (const line of lines) {
    const issueMatch = line.match(/#(\d+)/g);
    if (issueMatch) {
      issues.push(...issueMatch);
    }
  }
  const uniqueIssues = [...new Set(issues)].sort();

  // Build compressed entry
  const parts = [];
  if (summary.length > 0) {
    parts.push(summary[0]);
  }
  if (files.length > 0) {
    parts.push(`Files: ${files.slice(0, 5).join(', ')}${files.length > 5 ? ', ...' : ''}`);
  }
  if (uniqueIssues.length > 0) {
    parts.push(`Issues: ${uniqueIssues.join(', ')}`);
  }

  return `**Session ${session.number}** (${session.title.split(' - ')[0]}): ${parts.join(' | ')}\n`;
}

function performArchiving() {
  console.log('\n🗂️  Starting archiving process...\n');

  // Read current log
  const logContent = fs.readFileSync(LOG_FILE, 'utf-8');
  const lines = logContent.split('\n');

  // Find "## Session Log" header
  const sessionLogIndex = lines.findIndex(line => line === '## Session Log');
  if (sessionLogIndex === -1) {
    console.error('❌ Could not find "## Session Log" header in PROJECT_LOG.md');
    process.exit(1);
  }

  // Extract header (everything before Session Log)
  const header = lines.slice(0, sessionLogIndex + 1).join('\n');

  // Extract sessions
  const sessions = extractSessions(logContent);
  console.log(`📋 Found ${sessions.length} sessions`);

  if (sessions.length <= SESSIONS_TO_KEEP) {
    console.log(`✅ Only ${sessions.length} sessions found, no archiving needed`);
    return true;
  }

  // Sort sessions by number (newest first)
  sessions.sort((a, b) => b.number - a.number);

  // Split into keep vs archive
  const sessionsToKeep = sessions.slice(0, SESSIONS_TO_KEEP);
  const sessionsToArchive = sessions.slice(SESSIONS_TO_KEEP);

  console.log(`📌 Keeping ${sessionsToKeep.length} most recent sessions (${sessionsToKeep.map(s => s.number).join(', ')})`);
  console.log(`📦 Archiving ${sessionsToArchive.length} older sessions (${sessionsToArchive.map(s => s.number).join(', ')})`);

  // Build new PROJECT_LOG.md
  const newLog = [
    header,
    '',
    ...sessionsToKeep.reverse().map(s => s.content).join('\n---\n\n').split('\n'),
  ].join('\n');

  // Build archive entries (compressed)
  const archiveEntries = sessionsToArchive
    .sort((a, b) => a.number - b.number) // Archive in chronological order
    .map(compressSession)
    .join('');

  // Read existing archive
  let archiveContent = '';
  if (fs.existsSync(ARCHIVE_FILE)) {
    archiveContent = fs.readFileSync(ARCHIVE_FILE, 'utf-8');
  } else {
    archiveContent = '# LLYLI Project Log Archive\n\n> Compressed session history for reference.\n\n';
  }

  // Append new archive entries
  const newArchive = archiveContent.trimEnd() + '\n\n' + archiveEntries;

  // Write files
  fs.writeFileSync(LOG_FILE, newLog.trimEnd() + '\n');
  fs.writeFileSync(ARCHIVE_FILE, newArchive.trimEnd() + '\n');

  // Verify
  const newLineCount = countLines(LOG_FILE);
  console.log(`\n✅ Archiving complete!`);
  console.log(`   PROJECT_LOG.md: ${newLineCount} lines (was ${lines.length})`);
  console.log(`   ${sessionsToArchive.length} sessions archived to PROJECT_LOG_ARCHIVE.md\n`);

  return true;
}

// Main execution
const args = process.argv.slice(2);
const checkOnly = args.includes('--check-only');

if (checkOnly) {
  const isOk = checkLogSize();
  process.exit(isOk ? 0 : 1);
} else {
  const lineCount = countLines(LOG_FILE);

  if (lineCount <= MAX_LINES) {
    console.log(`✅ PROJECT_LOG.md (${lineCount} lines) is within limit (${MAX_LINES})`);
    process.exit(0);
  }

  const success = performArchiving();
  process.exit(success ? 0 : 1);
}
