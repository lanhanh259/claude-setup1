#!/usr/bin/env tsx
/**
 * dump-mcp-manifest.ts
 * Introspects the MCP server's registered tools and writes a manifest JSON.
 * Usage: npx tsx scripts/dump-mcp-manifest.ts > tests/fixtures/mcp-tool-manifest.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> = [];

const serverPath = path.join(__dirname, '../src/mcp/server.ts');
const source = fs.readFileSync(serverPath, 'utf-8');

// Extract all server.tool('name', 'description', ...) calls
const toolRegex = /server\.tool\(\s*'([^']+)'\s*,\s*'([^']+)'/g;
let match: RegExpExecArray | null;
while ((match = toolRegex.exec(source)) !== null) {
  tools.push({
    name: match[1]!,
    description: match[2]!,
    inputSchema: {},
  });
}

const manifest = {
  schemaVersion: '1',
  generatedAt: new Date().toISOString().split('T')[0],
  toolCount: tools.length,
  tools: tools.sort((a, b) => a.name.localeCompare(b.name)),
};

process.stdout.write(JSON.stringify(manifest, null, 2) + '\n');
