#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const USAGE = `
Usage: node merge-findings.cjs [--dir <audit-dir>] [--output <path>]

Merges confirmed findings from all 3 adversarial pipelines into a single
deduplicated, severity-sorted list with final DA-XXX IDs.

Reads:
  <audit-dir>/pipeline-a-confirmed.json
  <audit-dir>/pipeline-b-confirmed.json
  <audit-dir>/pipeline-c-confirmed.json

Writes:
  <audit-dir>/all-confirmed.json   (or --output path)
  <audit-dir>/all-dismissed.json   (dismissed findings from challenges)

Options:
  --dir <path>    Audit artifact directory (default: .release-audit)
  --output <path> Output path for merged file (default: <dir>/all-confirmed.json)
  --help          Show this help
`.trim();

function parseArgs(argv) {
  const args = { dir: '.release-audit', output: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--help' || argv[i] === '-h') {
      console.log(USAGE);
      process.exit(0);
    }
    if (argv[i] === '--dir' && argv[i + 1]) {
      args.dir = argv[++i];
    } else if (argv[i] === '--output' && argv[i + 1]) {
      args.output = argv[++i];
    }
  }
  if (!args.output) args.output = path.join(args.dir, 'all-confirmed.json');
  return args;
}

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

function normalizeSeverity(s) {
  if (!s) return 'LOW';
  const upper = s.toUpperCase();
  if (upper in SEVERITY_ORDER) return upper;
  if (upper === 'MED') return 'MEDIUM';
  return 'LOW';
}

function readJsonSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function deduplicationKey(finding) {
  const file = (finding.file || '').toLowerCase().trim();
  const lines = (finding.lines || '').trim();
  return `${file}::${lines}`;
}

function mergeChallenges(findings, challenges) {
  const challengeMap = new Map();
  for (const c of challenges) {
    challengeMap.set(c.findingId, c);
  }

  const confirmed = [];
  const dismissed = [];

  for (const f of findings) {
    const challenge = challengeMap.get(f.id);
    if (!challenge) {
      confirmed.push({ ...f, challengeResult: 'UNREVIEWED', challengeNote: null });
      continue;
    }

    const response = (challenge.response || '').toUpperCase();
    if (response === 'DISMISS') {
      dismissed.push({
        ...f,
        challengeResult: 'DISMISSED',
        challengeNote: challenge.reason || null,
      });
    } else if (response === 'RECLASSIFY') {
      confirmed.push({
        ...f,
        severity: challenge.newSeverity ? normalizeSeverity(challenge.newSeverity) : f.severity,
        category: challenge.newCategory || f.category,
        challengeResult: 'RECLASSIFIED',
        challengeNote: challenge.reason || null,
      });
    } else {
      confirmed.push({
        ...f,
        challengeResult: 'CONFIRMED',
        challengeNote: challenge.reason || null,
      });
    }
  }

  return { confirmed, dismissed };
}

function run() {
  const args = parseArgs(process.argv);

  const pipelines = ['a', 'b', 'c'];
  const pipelineLabels = { a: 'Documents', b: 'Browser', c: 'Test Gaps' };

  let allConfirmed = [];
  let allDismissed = [];
  const stats = {};

  for (const p of pipelines) {
    const findingsPath = path.join(args.dir, `pipeline-${p}-findings.json`);
    const challengesPath = path.join(args.dir, `pipeline-${p}-challenges.json`);
    const confirmedPath = path.join(args.dir, `pipeline-${p}-confirmed.json`);

    let confirmed;
    let dismissed;

    const premerged = readJsonSafe(confirmedPath);
    if (premerged.length > 0) {
      confirmed = premerged;
      dismissed = [];
    } else {
      const findings = readJsonSafe(findingsPath);
      const challenges = readJsonSafe(challengesPath);
      const result = mergeChallenges(findings, challenges);
      confirmed = result.confirmed;
      dismissed = result.dismissed;

      if (confirmed.length > 0) {
        fs.writeFileSync(confirmedPath, JSON.stringify(confirmed, null, 2) + '\n');
      }
    }

    for (const f of confirmed) f.pipeline = p.toUpperCase();
    for (const d of dismissed) d.pipeline = p.toUpperCase();

    stats[p] = {
      label: pipelineLabels[p],
      found: readJsonSafe(findingsPath).length || confirmed.length,
      dismissed: dismissed.length,
      confirmed: confirmed.length,
    };

    allConfirmed.push(...confirmed);
    allDismissed.push(...dismissed);
  }

  const seen = new Map();
  const deduped = [];
  for (const f of allConfirmed) {
    const key = deduplicationKey(f);
    if (seen.has(key)) {
      const existing = seen.get(key);
      const existingSev = SEVERITY_ORDER[normalizeSeverity(existing.severity)] ?? 3;
      const newSev = SEVERITY_ORDER[normalizeSeverity(f.severity)] ?? 3;
      if (newSev < existingSev) {
        const idx = deduped.indexOf(existing);
        deduped[idx] = f;
        seen.set(key, f);
      }
    } else {
      seen.set(key, f);
      deduped.push(f);
    }
  }

  deduped.sort((a, b) => {
    const sa = SEVERITY_ORDER[normalizeSeverity(a.severity)] ?? 3;
    const sb = SEVERITY_ORDER[normalizeSeverity(b.severity)] ?? 3;
    return sa - sb;
  });

  let counter = 1;
  for (const f of deduped) {
    f.id = `DA-${String(counter).padStart(3, '0')}`;
    f.severity = normalizeSeverity(f.severity);
    f.status = f.status || 'CONFIRMED';
    counter++;
  }

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, JSON.stringify(deduped, null, 2) + '\n');

  const dismissedPath = path.join(args.dir, 'all-dismissed.json');
  fs.writeFileSync(dismissedPath, JSON.stringify(allDismissed, null, 2) + '\n');

  const dupeCount = allConfirmed.length - deduped.length;

  console.log('');
  for (const p of pipelines) {
    const s = stats[p];
    console.log(
      `Pipeline ${p.toUpperCase()} (${s.label}): ${s.found} found → ${s.dismissed} dismissed → ${s.confirmed} confirmed`
    );
  }
  console.log('─'.repeat(60));
  console.log(
    `Total: ${allConfirmed.length + allDismissed.length} found → ${allDismissed.length} dismissed → ${deduped.length} confirmed${dupeCount > 0 ? ` (${dupeCount} cross-pipeline duplicates merged)` : ''}`
  );

  const bySev = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const f of deduped) bySev[f.severity] = (bySev[f.severity] || 0) + 1;
  console.log(
    `  CRITICAL: ${bySev.CRITICAL} | HIGH: ${bySev.HIGH} | MEDIUM: ${bySev.MEDIUM} | LOW: ${bySev.LOW}`
  );
  console.log('');
  console.log(`Written: ${args.output}`);
  console.log(`Written: ${dismissedPath}`);
}

run();
