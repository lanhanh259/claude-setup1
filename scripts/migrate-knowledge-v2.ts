import * as fs from 'fs/promises'
import * as path from 'path'

const VENUSOS = path.join(process.cwd(), '.venusos')
const DOCS_DIR = path.join(VENUSOS, 'documents')

// Explicit migration map from old doc IDs to new type-specific IDs and directories
const MIGRATIONS: Array<{ oldId: string; newId: string; destDir: string }> = [
  { oldId: 'doc-global-001-coding-standards',                    newId: 'rule-global-rule-001-coding-standards',               destDir: 'rules' },
  { oldId: 'doc-global-002-commit-conventions',                  newId: 'rule-global-rule-002-commit-conventions',             destDir: 'rules' },
  { oldId: 'doc-api-003-api-design-rules',                       newId: 'rule-api-rule-001-api-design-rules',                  destDir: 'rules' },
  { oldId: 'doc-testing-004-testing-rules',                      newId: 'rule-testing-rule-001-testing-rules',                 destDir: 'rules' },
  { oldId: 'doc-global-005-security-rules',                      newId: 'rule-global-rule-003-security-rules',                 destDir: 'rules' },
  { oldId: 'doc-global-006-file-naming',                         newId: 'convention-global-conv-001-file-naming',              destDir: 'conventions' },
  { oldId: 'doc-global-007-task-workflow',                       newId: 'convention-global-conv-002-task-workflow',            destDir: 'conventions' },
  { oldId: 'doc-global-008-domain-usage',                        newId: 'convention-global-conv-003-domain-usage',             destDir: 'conventions' },
  { oldId: 'doc-global-009-agent-conventions',                   newId: 'convention-global-conv-004-agent-conventions',       destDir: 'conventions' },
  { oldId: 'doc-architecture-010-context-pack-assembly-decision', newId: 'decision-architecture-dec-001-context-pack-assembly', destDir: 'decisions' },
]

const API_BASE = process.env.VENUS_API_BASE ?? 'http://localhost:3737/api/projects/venus-osmobp20dy'

async function migrate() {
  let moved = 0
  let skipped = 0
  let errors = 0

  for (const { oldId, newId, destDir } of MIGRATIONS) {
    const oldPath = path.join(DOCS_DIR, `${oldId}.md`)
    const destDirPath = path.join(VENUSOS, destDir)
    const newPath = path.join(destDirPath, `${newId}.md`)

    try {
      await fs.access(oldPath)
    } catch {
      console.log(`⚠  SKIP (not found): ${oldId}.md`)
      skipped++
      continue
    }

    try {
      await fs.mkdir(destDirPath, { recursive: true })
      let content = await fs.readFile(oldPath, 'utf-8')
      content = content.replace(/^id:\s*.+$/m, `id: ${newId}`)
      await fs.writeFile(newPath, content, 'utf-8')
      await fs.unlink(oldPath)
      console.log(`✓ ${oldId} → ${destDir}/${newId}`)
      moved++
    } catch (err: any) {
      console.error(`✗ ERROR: ${oldId} — ${err.message}`)
      errors++
    }
  }

  console.log(`\nMigration: ${moved} moved, ${skipped} skipped, ${errors} errors`)

  if (moved > 0) {
    console.log('\nRunning sync...')
    try {
      const res = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'full' }),
      })
      const result = await res.json() as any
      console.log(`Sync: created=${result.created} updated=${result.updated} deleted=${result.deleted} errors=${result.errors?.length ?? 0}`)
    } catch (err: any) {
      console.warn(`Sync skipped (server not running): ${err.message}`)
    }
  }
}

await migrate()
