#!/usr/bin/env node
// Uploads photos to Cloudinary. Geotagged photos go to the photos folder with
// lat/lng attached as structured metadata fields (not tags); non-geotagged
// photos go to the gallery folder with no metadata.
//
// Usage: node scripts/upload-photos-to-cloudinary.mjs [folder] [--photos-folder=portfolio-map/photos] [--gallery-folder=portfolio-map/gallery]
//   folder            defaults to scripts/photos
//   --photos-folder    Cloudinary destination for geotagged photos (default: portfolio-map/photos)
//   --gallery-folder   Cloudinary destination for non-geotagged photos (default: portfolio-map/gallery)
//
// Requires CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
// in .env.local (see repo root).

process.loadEnvFile(new URL('../.env.local', import.meta.url));

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import exifr from 'exifr';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff']);

const LATITUDE_FIELD_ID = 'latitude';
const LONGITUDE_FIELD_ID = 'longitude';

const args = process.argv.slice(2);
const photosFolderFlag = args.find((a) => a.startsWith('--photos-folder='));
const galleryFolderFlag = args.find((a) => a.startsWith('--gallery-folder='));
const photosFolder = photosFolderFlag ? photosFolderFlag.split('=')[1] : 'portfolio-map/photos';
const galleryFolder = galleryFolderFlag ? galleryFolderFlag.split('=')[1] : 'portfolio-map/gallery';
const targetDir = path.resolve(__dirname, args.find((a) => !a.startsWith('--')) ?? 'photos');

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

async function ensureMetadataFields() {
  const existing = await cloudinary.api.list_metadata_fields();
  const existingIds = new Set(existing.metadata_fields.map((f) => f.external_id));

  for (const externalId of [LATITUDE_FIELD_ID, LONGITUDE_FIELD_ID]) {
    if (existingIds.has(externalId)) continue;
    await cloudinary.api.add_metadata_field({
      external_id: externalId,
      type: 'string',
      label: externalId[0].toUpperCase() + externalId.slice(1),
      mandatory: false,
    });
    console.log(`Created structured metadata field: ${externalId}`);
  }
}

async function uploadGeotaggedPhoto(filePath, lat, lng) {
  return cloudinary.uploader.upload(filePath, {
    folder: photosFolder,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    metadata: {
      [LATITUDE_FIELD_ID]: String(lat),
      [LONGITUDE_FIELD_ID]: String(lng),
    },
  });
}

async function uploadGalleryPhoto(filePath) {
  return cloudinary.uploader.upload(filePath, {
    folder: galleryFolder,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
}

const files = readdirSync(targetDir).filter((f) =>
  PHOTO_EXTENSIONS.has(path.extname(f).toLowerCase())
);

if (files.length === 0) {
  console.error(`No photos found in ${targetDir}`);
  process.exit(1);
}

await ensureMetadataFields();

let uploadedGeotagged = 0;
let uploadedGallery = 0;
let failed = 0;

for (const file of files) {
  const filePath = path.join(targetDir, file);
  const exif = await exifr.parse(filePath, {
    gps: true,
    pick: ['GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef'],
  });

  const lat = exif?.latitude;
  const lng = exif?.longitude;
  const hasGps = typeof lat === 'number' && typeof lng === 'number';

  try {
    if (hasGps) {
      const result = await uploadGeotaggedPhoto(filePath, lat, lng);
      console.log(`  PHOTOS  ${file} -> ${result.public_id}  (lat=${lat.toFixed(6)}, lng=${lng.toFixed(6)})`);
      uploadedGeotagged++;
    } else {
      const result = await uploadGalleryPhoto(filePath);
      console.log(`  GALLERY ${file} -> ${result.public_id}`);
      uploadedGallery++;
    }
  } catch (err) {
    console.error(`  FAILED ${file}: ${err.message}`);
    failed++;
  }
}

console.log(
  `\nUploaded ${uploadedGeotagged} to ${photosFolder}, ${uploadedGallery} to ${galleryFolder}, ${failed} failed, out of ${files.length} total.`
);
