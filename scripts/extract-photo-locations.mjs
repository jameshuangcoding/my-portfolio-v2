#!/usr/bin/env node
// Reads EXIF data out of a flat folder of photos and extracts GPS + date-taken.
//
// Usage: node scripts/extract-photo-locations.mjs [folder]
//   folder   defaults to scripts/photos

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import exifr from 'exifr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff']);

const targetDir = path.resolve(__dirname, process.argv[2] ?? 'photos');

const files = readdirSync(targetDir).filter((f) =>
  PHOTO_EXTENSIONS.has(path.extname(f).toLowerCase())
);

if (files.length === 0) {
  console.error(`No photos found in ${targetDir}`);
  process.exit(1);
}

const withGps = [];
const withoutGps = [];

for (const file of files) {
  const filePath = path.join(targetDir, file);
  // `pick` only recognizes raw tag names, not exifr's derived `latitude`/`longitude`
  // fields, so the raw GPS tags must be picked explicitly for `gps: true` to compute them.
  const exif = await exifr.parse(filePath, {
    gps: true,
    pick: ['DateTimeOriginal', 'CreateDate', 'GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef'],
  });

  const lat = exif?.latitude;
  const lng = exif?.longitude;
  const dateTaken = exif?.DateTimeOriginal ?? exif?.CreateDate ?? null;

  const record = { file, lat, lng, dateTaken };

  if (typeof lat === 'number' && typeof lng === 'number') {
    withGps.push(record);
  } else {
    withoutGps.push(record);
  }
}

console.log(`\nPhotos WITH GPS data (${withGps.length}):`);
for (const { file, lat, lng, dateTaken } of withGps) {
  console.log(`  ${file}  lat=${lat.toFixed(6)} lng=${lng.toFixed(6)}  date=${dateTaken?.toISOString() ?? 'unknown'}`);
}

console.log(`\nPhotos WITHOUT GPS data (${withoutGps.length}):`);
for (const { file, dateTaken } of withoutGps) {
  console.log(`  ${file}  date=${dateTaken?.toISOString() ?? 'unknown'}`);
}

console.log(`\n${withGps.length}/${files.length} photos had GPS coordinates.`);
