'use strict';

/**
 * Atomic file write utilities.
 *
 * Uses write-to-temp + fs.renameSync — atomic on any POSIX filesystem
 * and on Windows (same volume). Prevents truncated/corrupt state files
 * if the process is killed mid-write.
 */

const fs   = require('fs');
const path = require('path');

/**
 * Write content to filePath atomically.
 * Creates parent directories if needed.
 */
function writeAtomic(filePath, content) {
  const tmp = filePath + '.tmp';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

/**
 * Append a line to filePath atomically (read → append → write).
 * Creates the file if it doesn't exist.
 */
function appendAtomic(filePath, line) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  let existing = '';
  try { existing = fs.readFileSync(filePath, 'utf8'); } catch { /* new file */ }
  writeAtomic(filePath, existing + line);
}

module.exports = { writeAtomic, appendAtomic };
