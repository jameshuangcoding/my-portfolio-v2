#!/usr/bin/env node
// Builds public/data/photos.geojson (one Feature per geotagged photo) from
// the lat/lng structured metadata that upload-photos-to-cloudinary.mjs
// attaches to everything in the Cloudinary photos folder. Map.tsx loads the
// output as a clustered GeoJSON source, so no manual coordinate-grouping
// happens here — MapLibre's supercluster handles that dynamically at render
// time.
//
// Usage: node scripts/generate-photo-geojson.mjs [--photos-folder=portfolio-map/photos] [--out=public/data/photos.geojson]

process.loadEnvFile(new URL('../.env.local', import.meta.url));

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const LATITUDE_FIELD_ID = 'latitude';
const LONGITUDE_FIELD_ID = 'longitude';

const args = process.argv.slice(2);
const photosFolderFlag = args.find((a) => a.startsWith('--photos-folder='));
const outFlag = args.find((a) => a.startsWith('--out='));
const photosFolder = photosFolderFlag ? photosFolderFlag.split('=')[1] : 'portfolio-map/photos';
const outPath = path.resolve(ROOT, outFlag ? outFlag.split('=')[1] : 'public/data/photos.geojson');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

for (const [name, value] of Object.entries({
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
})) {
  if (!value) {
    console.error(`Missing ${name} in .env.local`);
    process.exit(1);
  }
}

// public_id basenames are the descriptive slugs rename-photos-by-content.mjs
// produces, e.g. "sunset-over-waikiki-beach" -> "Sunset Over Waikiki Beach".
function titleFromPublicId(publicId) {
  const base = publicId.split('/').pop();
  return base
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

async function fetchAllResources() {
  const resources = [];
  let nextCursor;

  do {
    const page = await cloudinary.api.resources({
      type: 'upload',
      prefix: `${photosFolder}/`,
      max_results: 500,
      metadata: true,
      next_cursor: nextCursor,
    });
    resources.push(...page.resources);
    nextCursor = page.next_cursor;
  } while (nextCursor);

  return resources;
}

const resources = await fetchAllResources();

if (resources.length === 0) {
  console.error(`No resources found under ${photosFolder}`);
  process.exit(1);
}

const features = [];
let skipped = 0;

for (const resource of resources) {
  const lat = Number(resource.metadata?.[LATITUDE_FIELD_ID]);
  const lng = Number(resource.metadata?.[LONGITUDE_FIELD_ID]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error(`  SKIP ${resource.public_id}: missing/invalid lat-lng metadata`);
    skipped++;
    continue;
  }

  // Map popup thumbnail: a uniform 4:3 landscape crop. 'auto' gravity uses
  // Cloudinary's saliency/object detection to center the crop box on the
  // photo's most interesting region instead of a naive center-crop, so an
  // off-center subject doesn't get clipped.
  const photo = cloudinary.url(resource.public_id, {
    secure: true,
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
    analytics: false, // keep the committed geojson's URLs stable/diff-free
  });

  // Uncropped fallback for future full-image use (e.g. the popup's stubbed
  // "View Image" button) — scales down to fit within the box without
  // cropping, so portrait and landscape photos both keep their real aspect
  // ratio (a hard 'fill' crop would force every photo into a square box).
  const photoFull = cloudinary.url(resource.public_id, {
    secure: true,
    width: 1200,
    height: 1200,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
    analytics: false,
  });

  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: {
      title: titleFromPublicId(resource.public_id),
      photo,
      photoFull,
      publicId: resource.public_id,
    },
  });
}

const geojson = { type: 'FeatureCollection', features };

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(geojson, null, 2));

console.log(
  `\nWrote ${features.length} photo pin(s) to ${path.relative(ROOT, outPath)} (${skipped} skipped: missing coordinates), out of ${resources.length} total.`
);
