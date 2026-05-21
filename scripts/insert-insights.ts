console.log('Starting script...');

import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { initDb, closeDb, insertCodeInsight, listCodeInsights } from '../src/modules/graph.ts';
import { updateArchaeologistState } from '../src/modules/code-insight.ts';

console.log('Imports loaded');

async function main() {
  console.log('main() started');
  const dbPath = path.join(process.cwd(), '.venusos', '.meta', 'graph.lbug');
  console.log('DB path:', dbPath);
  await initDb(dbPath);
  console.log('DB initialized');
  
  function fileHash(p: string) {
    return crypto.createHash('sha256').update(fs.readFileSync(p, 'utf-8')).digest('hex');
  }
  
  const commitHash = '3d9c62398fca4771323e64bc1ea131b50c8c05f1';
  
  const insights = [
    { id: 'ci-graph-arch1', title: 'Venus Knowledge Graph Architecture', query: 'How does Venus store and query knowledge entities?', summary: 'Venus uses LadybugDB to store 15 entity types with specialized schemas. Relationships stored in VenusRel table with type edges.', domain: 'graph', source_files: ['src/modules/graph.ts'] },
    { id: 'ci-sync-flow2', title: 'Venus Sync Pipeline Flow', query: 'How does the sync pipeline synchronize markdown files?', summary: 'Two modes: full/incremental. Flow: discoverFiles, parseAndUpsert, resolveRelationships, pruneStaleNodes, regenerateIndex.', domain: 'sync', source_files: ['src/modules/sync.ts'] },
    { id: 'ci-context-asm3', title: 'Venus Context Assembly for Agents', query: 'How does Venus assemble context packs?', summary: 'assemblePack() loads anchor task, rules/conventions, active memory, graph relations, BM25 fallback.', domain: 'context', source_files: ['src/modules/context.ts'] },
    { id: 'ci-mcp-arch4', title: 'Venus MCP Tool Architecture', query: 'How are MCP tools wired?', summary: 'MCP server uses @modelcontextprotocol/sdk with StdioServerTransport. Tools proxy to HTTP server.', domain: 'mcp', source_files: ['src/mcp/server.ts'] },
    { id: 'ci-arch-life5', title: 'CodeInsight Archaeologist Lifecycle', query: 'How does archaeologist track state?', summary: 'State file archaeologist-state.json. createInsight generates ID with file hashes.', domain: 'memory', source_files: ['src/modules/code-insight.ts'] },
  ];
  
  for (const insight of insights) {
    console.log('Inserting:', insight.id);
    const source_files_json = JSON.stringify(insight.source_files.map(p => ({ path: p, content_hash: fileHash(p) })));
    await insertCodeInsight({ id: insight.id, title: insight.title, query: insight.query, summary: insight.summary, domain: insight.domain, source_files_json, staleness: 'fresh' });
    console.log('Created:', insight.id);
  }
  
  await updateArchaeologistState(process.cwd(), commitHash);
  console.log('Updated archaeologist state to', commitHash);
  
  const all = await listCodeInsights();
  console.log('Total CodeInsights:', all.length);
  all.forEach(i => console.log('  -', i.id, ':', i.title));
  
  await closeDb();
  console.log('Done');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
