const BASE = 'http://localhost:3737/api/projects/venus-osmobp20dy'

const migrations: [string, string][] = [
  ['rule-global-doc-001-CodingS',           'doc-global-001-coding-standards'],
  ['rule-global-doc-002-CommitC',           'doc-global-002-commit-conventions'],
  ['rule-api-doc-001-APIDesi',              'doc-api-003-api-design-rules'],
  ['rule-testing-doc-001-Testing',          'doc-testing-004-testing-rules'],
  ['rule-global-doc-003-Security',          'doc-global-005-security-rules'],
  ['convention-global-doc-001-FileNam',     'doc-global-006-file-naming'],
  ['convention-global-doc-002-TaskWor',     'doc-global-007-task-workflow'],
  ['convention-global-doc-003-DomainU',     'doc-global-008-domain-usage'],
  ['convention-global-doc-004-AgentCo',     'doc-global-009-agent-conventions'],
  ['decision-architecture-doc-001-Context', 'doc-architecture-010-context-pack-assembly-decision'],
]

for (const [oldId, newId] of migrations) {
  const doc = await fetch(`${BASE}/documents/${oldId}`).then(r => r.json()) as any
  if (!doc?.id) { console.log(`✗ NOT FOUND: ${oldId}`); continue }

  const payload = {
    id: newId,
    type: doc.type,
    title: doc.title,
    domain: doc.domain,
    status: 'active',
    updated_at: '2026-04-24T00:00:00Z',
    tags: doc.tags ?? [],
    content: doc.rawBody ?? '',
  }

  const created = await fetch(`${BASE}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(r => r.json()) as any

  if (created?.id === newId) {
    await fetch(`${BASE}/documents/${oldId}`, { method: 'DELETE' })
    console.log(`✓ ${oldId} → ${newId}`)
  } else {
    console.log(`✗ FAILED: ${oldId} — ${JSON.stringify(created)}`)
  }
}

await fetch(`${BASE}/sync`, { method: 'POST' })
console.log('\nSync done.')
