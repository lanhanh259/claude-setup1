import * as path from 'path';
import * as graph from '../src/modules/graph.ts';

const dbPath = path.join(process.cwd(), '.venusos', '.meta', 'graph.lbug');
console.log('Initializing DB at', dbPath);
await graph.initDb(dbPath);
console.log('DB initialized');
const stats = await graph.getStats();
console.log('Stats:', JSON.stringify(stats, null, 2));
const all = await graph.listCodeInsights();
console.log('CodeInsights:', all.length);
