#!/usr/bin/env node

// This script generates a manifest.json listing all files and directories in the repository.
// Run it from the repository root to refresh the file list used by index.html.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const outFile = path.join(root, 'manifest.json');

const ignoreNames = new Set(['.git', 'node_modules', 'manifest.json', 'generate-manifest.js']);

function isHidden(name) {
  return name.startsWith('.') && name !== '.git';
}

function walk(dir) {
  const entries = [];
  const dirents = fs.readdirSync(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    if (ignoreNames.has(dirent.name)) continue;
    if (isHidden(dirent.name)) continue;

    const fullPath = path.join(dir, dirent.name);
    const relPath = path.relative(root, fullPath).replace(/\\\\/g, '/');

    try {
      const stats = fs.statSync(fullPath);
      if (dirent.isDirectory()) {
        entries.push({
          name: dirent.name,
          path: relPath || '.',
          type: 'dir',
          size: 0,
          mtime: stats.mtimeMs,
          extension: '',
        });
        entries.push(...walk(fullPath));
      } else if (dirent.isFile()) {
        const ext = path.extname(dirent.name).replace('.', '').toLowerCase();
        entries.push({
          name: dirent.name,
          path: relPath,
          type: 'file',
          size: stats.size,
          mtime: stats.mtimeMs,
          extension: ext,
        });
      }
    } catch (err) {
      // ignore permission errors
    }
  }

  return entries;
}

function main() {
  const manifest = walk(root);
  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log(`Generated ${manifest.length} items in ${outFile}`);
}

main();
