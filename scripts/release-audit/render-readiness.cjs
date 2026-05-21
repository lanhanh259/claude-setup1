#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const USAGE = `
Usage: node render-readiness.cjs [--dir <audit-dir>] [--readiness <path>]

Generates or updates the bug register section in RELEASE-READINESS.md
from the merged JSON artifacts.

Reads:
  <audit-dir>/all-confirmed.json    Confirmed findings (required)
  <audit-dir>/all-dismissed.json    Dismissed findings (optional)
  <audit-dir>/fix-report.json       Fix results (optional)
  <audit-dir>/gate-assessment.json  Gate results (optional)

Writes:
  Updates the bug register section in RELEASE-READINESS.md (between markers)
  Also writes <audit-dir>/report.md as standalone report

Options:
  --dir <path>        Audit artifact directory (default: .release-audit)
  --readiness <path>  Path to RELEASE-READINESS.md (default: docs/release/RELEASE-READINESS.md)
  --report-only       Only write report.md, don't touch RELEASE-READINESS.md
  --help              Show this help
`.trim();

function parseArgs(argv) {
  const args = {
    dir: '.release-audit',
    readiness: 'docs/release/RELEASE-READINESS.md',
    reportOnly: false,
  };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--help' || argv[i] === '-h') {
      console.log(USAGE);
      process.exit(0);
    }
    if (argv[i] === '--dir' && argv[i + 1]) args.dir = argv[++i];
    else if (argv[i] === '--readiness' && argv[i + 1]) args.readiness = argv[++i];
    else if (argv[i] === '--report-only') args.reportOnly = true;
  }
  return args;
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function severityEmoji(sev) {
  const map = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢' };
  return map[sev] || '⚪';
}

function pipelineLabel(p) {
  const map = { A: 'Documents', B: 'Browser', C: 'Test Gaps' };
  return map[p] || p;
}

function renderBugRegisterTable(findings) {
  if (!findings || findings.length === 0) return '*No findings.*\n';

  const lines = [];
  lines.push('| ID | Sev | Pipeline | Surface | Description | Location | Status |');
  lines.push('|----|-----|----------|---------|-------------|----------|--------|');

  for (const f of findings) {
    const sev = `${severityEmoji(f.severity)} ${f.severity}`;
    const pipeline = pipelineLabel(f.pipeline);
    const surface = f.surface || '—';
    const claim = (f.claim || '').replace(/\|/g, '\\|');
    const location = f.file ? `\`${f.file}${f.lines ? ':' + f.lines : ''}\`` : '—';
    const status = f.status || 'CONFIRMED';
    const fixRef = f.fixCommit ? ` (${f.fixCommit.slice(0, 7)})` : '';
    lines.push(`| ${f.id} | ${sev} | ${pipeline} | ${surface} | ${claim} | ${location} | **${status}**${fixRef} |`);
  }

  return lines.join('\n') + '\n';
}

function renderDismissedTable(dismissed) {
  if (!dismissed || dismissed.length === 0) return '';

  const lines = [];
  lines.push('<details>');
  lines.push(`<summary>Dismissed findings (${dismissed.length})</summary>`);
  lines.push('');
  lines.push('| ID | Pipeline | Claim | Reason |');
  lines.push('|----|----------|-------|--------|');

  for (const d of dismissed) {
    const pipeline = pipelineLabel(d.pipeline);
    const claim = (d.claim || '').replace(/\|/g, '\\|');
    const reason = (d.challengeNote || '').replace(/\|/g, '\\|');
    lines.push(`| ${d.id || '—'} | ${pipeline} | ${claim} | ${reason} |`);
  }

  lines.push('');
  lines.push('</details>');
  return lines.join('\n') + '\n';
}

function renderSummary(confirmed, dismissed) {
  const bySev = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const byPipeline = { A: 0, B: 0, C: 0 };
  const byStatus = {};

  for (const f of confirmed) {
    bySev[f.severity] = (bySev[f.severity] || 0) + 1;
    byPipeline[f.pipeline] = (byPipeline[f.pipeline] || 0) + 1;
    const st = f.status || 'CONFIRMED';
    byStatus[st] = (byStatus[st] || 0) + 1;
  }

  const totalFound = confirmed.length + (dismissed ? dismissed.length : 0);
  const dismissedCount = dismissed ? dismissed.length : 0;

  const lines = [];
  lines.push('### Pipeline Summary');
  lines.push('');
  lines.push(`| Pipeline | Found | Dismissed | Confirmed |`);
  lines.push(`|----------|-------|-----------|-----------|`);

  for (const [key, label] of [['A', 'Documents'], ['B', 'Browser'], ['C', 'Test Gaps']]) {
    const pFindings = confirmed.filter(f => f.pipeline === key).length;
    const pDismissed = dismissed ? dismissed.filter(f => f.pipeline === key).length : 0;
    const pFound = pFindings + pDismissed;
    lines.push(`| ${label} | ${pFound} | ${pDismissed} | ${pFindings} |`);
  }

  lines.push(`| **Total** | **${totalFound}** | **${dismissedCount}** | **${confirmed.length}** |`);
  lines.push('');
  lines.push(`**By severity:** CRITICAL: ${bySev.CRITICAL} | HIGH: ${bySev.HIGH} | MEDIUM: ${bySev.MEDIUM} | LOW: ${bySev.LOW}`);
  lines.push('');

  if (Object.keys(byStatus).length > 0) {
    const statusParts = Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`);
    lines.push(`**By status:** ${statusParts.join(' | ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

function renderFixReport(fixReport) {
  if (!fixReport) return '';

  const lines = [];
  lines.push('### Fix Report');
  lines.push('');
  lines.push(`- Bugs assigned: ${fixReport.summary?.bugsAssigned || 0}`);
  lines.push(`- Bugs fixed: ${fixReport.summary?.bugsFixed || 0}`);
  lines.push(`- Bugs needing larger refactor: ${fixReport.summary?.bugsNeedingLargerRefactor || 0}`);
  lines.push(`- Bugs skipped: ${fixReport.summary?.bugsSkipped || 0}`);

  if (fixReport.summary?.filesModified?.length > 0) {
    lines.push(`- Files modified: ${fixReport.summary.filesModified.join(', ')}`);
  }

  if (fixReport.fixes?.length > 0) {
    lines.push('');
    lines.push('| Bug | Severity | Files | What Changed |');
    lines.push('|-----|----------|-------|-------------|');
    for (const fix of fixReport.fixes) {
      const files = (fix.filesChanged || []).map(f => `\`${f}\``).join(', ');
      const what = (fix.whatChanged || '').replace(/\|/g, '\\|');
      lines.push(`| ${fix.bugId} | ${fix.severity} | ${files} | ${what} |`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function renderStandaloneReport(confirmed, dismissed, fixReport) {
  const lines = [];
  const now = new Date().toISOString().split('T')[0];

  lines.push(`# Release Audit Report — ${now}`);
  lines.push('');
  lines.push(renderSummary(confirmed, dismissed));
  lines.push('### Confirmed Findings');
  lines.push('');
  lines.push(renderBugRegisterTable(confirmed));
  lines.push('');
  lines.push(renderDismissedTable(dismissed));
  lines.push('');
  lines.push(renderFixReport(fixReport));

  return lines.join('\n');
}

const BUG_REGISTER_START = '<!-- AUDIT:BUG_REGISTER:START -->';
const BUG_REGISTER_END = '<!-- AUDIT:BUG_REGISTER:END -->';

function updateReadiness(readinessPath, confirmed, dismissed, fixReport) {
  if (!fs.existsSync(readinessPath)) {
    console.error(`RELEASE-READINESS.md not found at ${readinessPath}`);
    console.error('Use --report-only to generate a standalone report instead.');
    process.exit(1);
  }

  let content = fs.readFileSync(readinessPath, 'utf8');

  const startIdx = content.indexOf(BUG_REGISTER_START);
  const endIdx = content.indexOf(BUG_REGISTER_END);

  const section = [
    BUG_REGISTER_START,
    '',
    renderSummary(confirmed, dismissed),
    '### Bug Register',
    '',
    renderBugRegisterTable(confirmed),
    '',
    renderDismissedTable(dismissed),
    '',
    renderFixReport(fixReport),
    BUG_REGISTER_END,
  ].join('\n');

  if (startIdx !== -1 && endIdx !== -1) {
    content = content.slice(0, startIdx) + section + content.slice(endIdx + BUG_REGISTER_END.length);
  } else {
    content += '\n\n' + section + '\n';
  }

  fs.writeFileSync(readinessPath, content);
  console.log(`Updated: ${readinessPath}`);
}

function run() {
  const args = parseArgs(process.argv);

  const confirmed = readJsonSafe(path.join(args.dir, 'all-confirmed.json'));
  if (!confirmed) {
    console.error(`No confirmed findings found at ${path.join(args.dir, 'all-confirmed.json')}`);
    console.error('Run merge-findings.cjs first.');
    process.exit(1);
  }

  const dismissed = readJsonSafe(path.join(args.dir, 'all-dismissed.json')) || [];
  const fixReport = readJsonSafe(path.join(args.dir, 'fix-report.json'));

  const reportPath = path.join(args.dir, 'report.md');
  const report = renderStandaloneReport(confirmed, dismissed, fixReport);
  fs.writeFileSync(reportPath, report);
  console.log(`Written: ${reportPath}`);

  if (!args.reportOnly) {
    updateReadiness(args.readiness, confirmed, dismissed, fixReport);
  }

  console.log(`\n${confirmed.length} confirmed findings rendered.`);
}

run();
