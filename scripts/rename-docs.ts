import * as fs from 'fs/promises'
import * as path from 'path'

const DOCS = '/Users/phucld/workspace/venus/.venusos/documents'

const renames: [string, string][] = [
  ['rule-global-doc-001-CodingS.md',           'doc-global-001-coding-standards.md'],
  ['rule-global-doc-002-CommitC.md',            'doc-global-002-commit-conventions.md'],
  ['rule-api-doc-001-APIDesi.md',               'doc-api-003-api-design-rules.md'],
  ['rule-testing-doc-001-Testing.md',           'doc-testing-004-testing-rules.md'],
  ['rule-global-doc-003-Security.md',           'doc-global-005-security-rules.md'],
  ['convention-global-doc-001-FileNam.md',      'doc-global-006-file-naming.md'],
  ['convention-global-doc-002-TaskWor.md',      'doc-global-007-task-workflow.md'],
  ['convention-global-doc-003-DomainU.md',      'doc-global-008-domain-usage.md'],
  ['convention-global-doc-004-AgentCo.md',      'doc-global-009-agent-conventions.md'],
  ['decision-architecture-doc-001-Context.md',  'doc-architecture-010-context-pack-assembly-decision.md'],
]

for (const [oldName, newName] of renames) {
  const oldPath = path.join(DOCS, oldName)
  const newPath = path.join(DOCS, newName)
  const newId = newName.replace('.md', '')

  let content = await fs.readFile(oldPath, 'utf8')
  // Fix the id in frontmatter
  content = content.replace(/^id:\s*.+$/m, `id: ${newId}`)

  await fs.writeFile(newPath, content, 'utf8')
  await fs.unlink(oldPath)
  console.log(`✓ ${oldName} → ${newName}`)
}

// Sync
const res = await fetch('http://localhost:3737/api/projects/venus-osmobp20dy/sync', { method: 'POST' })
const result = await res.json() as any
console.log(`\nSync: created=${result.created} updated=${result.updated} deleted=${result.deleted} errors=${result.errors?.length ?? 0}`)
