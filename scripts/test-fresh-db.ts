console.log('Testing fresh DB...');
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { initDb, closeDb } from '../src/modules/graph.ts';

async function test() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'venus-test-'));
  const dbPath = path.join(tmpDir, 'test.lbug');
  console.log('Creating fresh DB at', dbPath);
  await initDb(dbPath);
  console.log('DB initialized successfully');
  await closeDb();
  console.log('DB closed');
  fs.rmSync(tmpDir, { recursive: true });
  console.log('Done');
}

test().catch(err => { console.error('Error:', err); process.exit(1); });
