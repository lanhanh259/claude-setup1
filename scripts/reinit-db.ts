import * as path from 'path';
import { initDb, closeDb } from '../src/modules/graph.ts';
const dbPath = path.join(process.cwd(), '.venusos', '.meta', 'graph.lbug');
console.log('Reinitializing DB at', dbPath);
await initDb(dbPath);
console.log('DB reinitialized');
await closeDb();
console.log('Done');
