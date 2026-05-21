import { initDb, insertCodeInsight, listCodeInsights } from '../src/modules/graph.ts';
import { updateArchaeologistState } from '../src/modules/code-insight.ts';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

async function main() {
  const dbPath = path.join(process.cwd(), '.venusos', '.meta', 'graph.lbug');
  await initDb(dbPath);
  
  const commitHash = '3d9c62398fca4771323e64bc1ea131b50c8c05f1';
  
  function fileHash(p: string) {
    return crypto.createHash('sha256').update(fs.readFileSync(p, 'utf-8')).digest('hex');
  }
  
  // Insight 1: Knowledge Graph Architecture
  await insertCodeInsight({
    id: 'ci-graph-arch1',
    title: 'Venus Knowledge Graph Architecture',
    query: 'How does Venus store and query knowledge entities?',
    summary: 'Venus uses LadybugDB to store 15 entity types with specialized schemas. Generic types share common fields; specialized types have custom fields like extraction_status, content_hash. Relationships stored in VenusRel table with type edges. DAG edges have cycle detection. FTS indexes with Porter stemmer. Schema v9.0.',
    domain: 'graph',
    source_files_json: JSON.stringify([{path: 'src/modules/graph.ts', content_hash: fileHash('src/modules/graph.ts')}]),
    staleness: 'fresh',
  });
  console.log('Created insight 1');
  
  // Insight 2: Sync Pipeline
  await insertCodeInsight({
    id: 'ci-sync-flow2',
    title: 'Venus Sync Pipeline Flow',
    query: 'How does the sync pipeline synchronize markdown files to the knowledge graph?',
    summary: 'Two modes: full/incremental. discoverFiles() globs markdown, parseAndUpsert() upserts nodes, resolveRelationships() creates edges, Document entities get Section/Revision nodes, pruneStaleNodes() deletes orphans, regenerateIndex() + rebuildFTS() complete. DB-primary nodes protected.',
    domain: 'sync',
    source_files_json: JSON.stringify([{path: 'src/modules/sync.ts', content_hash: fileHash('src/modules/sync.ts')}]),
    staleness: 'fresh',
  });
  console.log('Created insight 2');
  
  // Insight 3: Context Assembly
  await insertCodeInsight({
    id: 'ci-context-asm3',
    title: 'Venus Context Assembly for Agents',
    query: 'How does Venus assemble context packs for AI agents?',
    summary: 'assemblePack() loads anchor task, mandatory rules/conventions, active memory, graph relations, BM25 fallback. assemblePrecedenceContextPack() includes all governance plus sorted SectionRevisions.',
    domain: 'context',
    source_files_json: JSON.stringify([{path: 'src/modules/context.ts', content_hash: fileHash('src/modules/context.ts')}]),
    staleness: 'fresh',
  });
  console.log('Created insight 3');
  
  // Insight 4: MCP Tool Architecture
  await insertCodeInsight({
    id: 'ci-mcp-arch4',
    title: 'Venus MCP Tool Architecture',
    query: 'How are MCP tools wired in the Venus server?',
    summary: 'MCP server uses @modelcontextprotocol/sdk with StdioServerTransport. Tools proxy to HTTP via fetchApi(). Tier 1 + CRUD tools. CodeInsight tools at lines 1526-1629. Resources + Prompts guide workflows.',
    domain: 'mcp',
    source_files_json: JSON.stringify([{path: 'src/mcp/server.ts', content_hash: fileHash('src/mcp/server.ts')}]),
    staleness: 'fresh',
  });
  console.log('Created insight 4');
  
  // Insight 5: Archaeologist Lifecycle
  await insertCodeInsight({
    id: 'ci-arch-life5',
    title: 'CodeInsight Archaeologist Lifecycle',
    query: 'How does the archaeologist track code analysis state and staleness?',
    summary: 'State file archaeologist-state.json. createInsight() generates ID with file hashes. checkStaleness() updates staleness. checkAnalysisNeeded() returns needed status. updateArchaeologistState() writes state.',
    domain: 'memory',
    source_files_json: JSON.stringify([{path: 'src/modules/code-insight.ts', content_hash: fileHash('src/modules/code-insight.ts')}]),
    staleness: 'fresh',
  });
  console.log('Created insight 5');
  
  await updateArchaeologistState(process.cwd(), commitHash);
  console.log('Updated archaeologist state');
  
  const all = await listCodeInsights();
  console.log('Total:', all.length);
  all.forEach(i => console.log('  -', i.id));
}

main().catch(console.error);
