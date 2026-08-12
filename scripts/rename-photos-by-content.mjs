#!/usr/bin/env node
// Renames a flat folder of photos based on their visual content, using the
// Claude Code CLI in headless mode (`claude -p`) so it runs under the
// existing Claude subscription login instead of needing a separate API key.
//
// Usage: node scripts/rename-photos-by-content.mjs [folder] [--dry-run]
//   folder    defaults to scripts/photos
//   --dry-run print the planned renames without touching any files

import { execFileSync } from 'node:child_process';
import { readdirSync, renameSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff']);
// Matches exactly what the slugify step below produces (lowercase, hyphen-separated).
// Raw camera/Photos-app export names (UUIDs, IMG_1234, etc.) never match this.
const ALREADY_RENAMED = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const targetDir = path.resolve(__dirname, args.find((a) => !a.startsWith('--')) ?? 'photos');

const files = readdirSync(targetDir).filter((f) =>
  PHOTO_EXTENSIONS.has(path.extname(f).toLowerCase())
);

if (files.length === 0) {
  console.error(`No photos found in ${targetDir}`);
  process.exit(1);
}

function describeSlug(filePath) {
  const prompt = `Read the image at "${filePath}" and respond with ONLY a short descriptive filename summarizing what is shown (3-6 words, lowercase, hyphen-separated, no file extension, no other text). Example: "sunset-over-waikiki-beach".`;

  const raw = execFileSync(
    'claude',
    [
      '-p', prompt,
      '--output-format', 'json',
      '--allowedTools', 'Read',
      '--model', 'haiku',
      '--system-prompt', 'You are a helpful assistant that describes images concisely.',
    ],
    { encoding: 'utf-8' }
  );

  const { result } = JSON.parse(raw);
  const slug = result
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || null;
}

function uniquePath(dir, slug, ext, taken) {
  let candidate = `${slug}${ext}`;
  let counter = 2;
  while (taken.has(candidate) || existsSync(path.join(dir, candidate))) {
    candidate = `${slug}-${counter}${ext}`;
    counter++;
  }
  return candidate;
}

const takenNames = new Set();
let renamed = 0;
let alreadyNamed = 0;

for (const file of files) {
  const filePath = path.join(targetDir, file);
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);

  if (ALREADY_RENAMED.test(base)) {
    console.log(`  SKIP (already named) ${file}`);
    takenNames.add(file);
    alreadyNamed++;
    continue;
  }

  let slug;
  try {
    slug = describeSlug(filePath);
  } catch (err) {
    console.error(`  SKIP ${file}: ${err.message}`);
    continue;
  }

  if (!slug) {
    console.error(`  SKIP ${file}: model returned no usable description`);
    continue;
  }

  const newName = uniquePath(targetDir, slug, ext, takenNames);
  takenNames.add(newName);

  console.log(`${file}  ->  ${newName}`);

  if (!DRY_RUN) {
    renameSync(filePath, path.join(targetDir, newName));
    renamed++;
  }
}

console.log(
  DRY_RUN
    ? `\nDry run: ${files.length - alreadyNamed}/${files.length} photo(s) would be renamed (${alreadyNamed} already named).`
    : `\nRenamed ${renamed}/${files.length} photo(s) (${alreadyNamed} already named, skipped).`
);
