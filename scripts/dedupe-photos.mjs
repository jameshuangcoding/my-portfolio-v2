#!/usr/bin/env node
// Finds byte-identical duplicate photos in a flat folder (e.g. the same photo
// dragged out of Photos.app twice, each time under a fresh random filename)
// and moves the extras aside instead of deleting them outright.
//
// When a duplicate group contains one file already renamed by
// rename-photos-by-content.mjs (a friendly slug name) alongside raw
// camera/Photos-app export names, the slug-named file is kept.
//
// Usage: node scripts/dedupe-photos.mjs [folder] [--dry-run] [--delete]
//   folder     defaults to scripts/photos
//   --dry-run  print what would happen without moving/deleting anything
//   --delete   permanently delete duplicates instead of moving them aside
//              (default: moved into <folder>/duplicates/)

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, renameSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff']);
const ALREADY_RENAMED = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DELETE = args.includes('--delete');
const targetDir = path.resolve(__dirname, args.find((a) => !a.startsWith('--')) ?? 'photos');
const duplicatesDir = path.join(targetDir, 'duplicates');

const files = readdirSync(targetDir).filter((f) =>
  PHOTO_EXTENSIONS.has(path.extname(f).toLowerCase())
);

if (files.length === 0) {
  console.error(`No photos found in ${targetDir}`);
  process.exit(1);
}

function hashFile(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

const groups = new Map(); // hash -> [filenames]

for (const file of files) {
  const hash = hashFile(path.join(targetDir, file));
  if (!groups.has(hash)) groups.set(hash, []);
  groups.get(hash).push(file);
}

const duplicateGroups = [...groups.values()].filter((g) => g.length > 1);

if (duplicateGroups.length === 0) {
  console.log('No duplicates found.');
  process.exit(0);
}

if (!DRY_RUN && !DELETE) {
  mkdirSync(duplicatesDir, { recursive: true });
}

let removedCount = 0;

for (const group of duplicateGroups) {
  // Prefer keeping a file that's already been through rename-photos-by-content.mjs
  // (a friendly slug name) over a raw camera/Photos-app export name.
  const sorted = [...group].sort((a, b) => {
    const aNamed = ALREADY_RENAMED.test(path.basename(a, path.extname(a)));
    const bNamed = ALREADY_RENAMED.test(path.basename(b, path.extname(b)));
    if (aNamed !== bNamed) return aNamed ? -1 : 1;
    return a.localeCompare(b);
  });

  const [keep, ...duplicates] = sorted;
  console.log(`\nKeep: ${keep}`);

  for (const dupe of duplicates) {
    const action = DELETE ? 'DELETE' : 'MOVE -> duplicates/';
    console.log(`  ${action} ${dupe}`);
    removedCount++;

    if (DRY_RUN) continue;

    const srcPath = path.join(targetDir, dupe);
    if (DELETE) {
      unlinkSync(srcPath);
    } else {
      let dest = path.join(duplicatesDir, dupe);
      let counter = 2;
      while (existsSync(dest)) {
        const ext = path.extname(dupe);
        dest = path.join(duplicatesDir, `${path.basename(dupe, ext)}-${counter}${ext}`);
        counter++;
      }
      renameSync(srcPath, dest);
    }
  }
}

const fate = DELETE ? 'deleted' : `moved to ${duplicatesDir}`;
console.log(
  `\n${duplicateGroups.length} duplicate group(s) found, ${removedCount} duplicate file(s) ${
    DRY_RUN ? `would be ${fate}` : fate
  }.`
);
