#!/usr/bin/env node
// Regenerates the 16 visited-country features in public/data/countries.geojson
// from OSM boundary relations (via Overpass), instead of Natural Earth.
//
// Why: Natural Earth's admin-0 polygons are an independently-surveyed
// coastline, digitized at world-map scale — they can never pixel-align with
// the OpenFreeMap/OSM-derived basemap's own coastline, and are far too
// coarse for street-level zoom (e.g. Bermuda's old polygon was 8 points).
// OSM boundary relations are drawn from the *same* coastline data the
// basemap renders from, so they align at any zoom.
//
// Usage: npm run fetch-country-boundaries [-- --refresh]
//   --refresh   ignore the cached Overpass response and re-fetch

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import osmtogeojson from 'osmtogeojson';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'overpass-response.json');
const COUNTRIES_GEOJSON = path.join(ROOT, 'public/data/countries.geojson');
const MAPSHAPER_BIN = path.join(ROOT, 'node_modules/.bin/mapshaper');
const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

const REFRESH = process.argv.includes('--refresh');

// Overpass selector tags + output properties for each visited entity.
// Tagging is NOT uniform across OSM (confirmed by direct querying): most
// sovereign countries are ISO3166-1 + admin_level=2, but Hong Kong is
// admin_level=3, and US territories (Puerto Rico, USVI) are admin_level=4
// tagged via ISO3166-2 under the United States. Every entry below was
// verified live against Overpass before being hardcoded here.
const ENTITIES = [
  { adm0_a3: 'KOR', name: 'South Korea', iso_a2: 'KR', tags: { 'ISO3166-1': 'KR', admin_level: '2' } },
  { adm0_a3: 'JPN', name: 'Japan', iso_a2: 'JP', tags: { 'ISO3166-1': 'JP', admin_level: '2' } },
  { adm0_a3: 'CHN', name: 'China', iso_a2: 'CN', tags: { 'ISO3166-1': 'CN', admin_level: '2' } },
  { adm0_a3: 'DOM', name: 'Dominican Rep.', iso_a2: 'DO', tags: { 'ISO3166-1': 'DO', admin_level: '2' } },
  { adm0_a3: 'FRA', name: 'France', iso_a2: 'FR', tags: { 'ISO3166-1': 'FR', admin_level: '2' } },
  { adm0_a3: 'NLD', name: 'Netherlands', iso_a2: 'NL', tags: { 'ISO3166-1': 'NL', admin_level: '2' } },
  { adm0_a3: 'ISL', name: 'Iceland', iso_a2: 'IS', tags: { 'ISO3166-1': 'IS', admin_level: '2' } },
  { adm0_a3: 'MEX', name: 'Mexico', iso_a2: 'MX', tags: { 'ISO3166-1': 'MX', admin_level: '2' } },
  { adm0_a3: 'GBR', name: 'United Kingdom', iso_a2: 'GB', tags: { 'ISO3166-1': 'GB', admin_level: '2' } },
  { adm0_a3: 'CAN', name: 'Canada', iso_a2: 'CA', tags: { 'ISO3166-1': 'CA', admin_level: '2' } },
  { adm0_a3: 'USA', name: 'United States of America', iso_a2: 'US', tags: { 'ISO3166-1': 'US', admin_level: '2' } },
  { adm0_a3: 'TWN', name: 'Taiwan', iso_a2: 'TW', tags: { 'ISO3166-1': 'TW', admin_level: '2' } },
  { adm0_a3: 'HKG', name: 'Hong Kong', iso_a2: 'HK', tags: { 'ISO3166-2': 'CN-HK', admin_level: '3' } },
  { adm0_a3: 'PRI', name: 'Puerto Rico', iso_a2: 'PR', tags: { 'ISO3166-2': 'US-PR', admin_level: '4' } },
  { adm0_a3: 'VIR', name: 'U.S. Virgin Islands', iso_a2: 'VI', tags: { 'ISO3166-2': 'US-VI', admin_level: '4' } },
  { adm0_a3: 'BMU', name: 'Bermuda', iso_a2: 'BM', tags: { 'ISO3166-1': 'BM', admin_level: '2' } },
];

// OSM's top-level country relations are sovereignty-based, so they include
// the full landmass of dependent territories that have their own separate
// relation too (unlike Natural Earth's admin-0 "map units", which carve
// these out as non-overlapping polygons). Confirmed with shapely: CHN's
// fetched polygon contains 100% of HKG's area, USA's contains 100% of both
// PRI's and VIR's. Left alone, both the parent and child render their own
// translucent fill on that same patch of ground, doubling the opacity and
// showing up as a visibly darker blotch. Erase the child's shape out of the
// parent's before simplifying.
const ERASURES = {
  CHN: ['HKG'],
  USA: ['PRI', 'VIR'],
};

// Simplification tiers for `mapshaper -simplify`. Small/coastally-complex
// entities keep near-full OSM detail (cheap, and exactly what looked worst
// under Natural Earth); large landmasses get simplified harder to keep the
// bundle size sane.
const SIMPLIFY_TIERS = [
  { pct: '12%', codes: ['USA', 'CHN'] },
  // Canada's raw OSM relation isn't nearly as point-dense as USA/China's
  // (~32k vs ~140-150k), so the same aggressive tier would under-simplify
  // it relative to what it actually needs and leave it coarser than the
  // original Natural Earth data — give it its own lighter tier instead.
  { pct: '40%', codes: ['CAN'] },
  { pct: '25%', codes: ['KOR', 'JPN', 'NLD', 'GBR', 'MEX', 'FRA'] },
  { pct: '60%', codes: ['BMU', 'HKG', 'TWN', 'PRI', 'VIR', 'DOM', 'ISL'] },
];

function buildOverpassQuery() {
  const clauses = ENTITIES.map(({ tags }) => {
    const filters = Object.entries(tags)
      .map(([k, v]) => `["${k}"="${v}"]`)
      .join('');
    return `  relation${filters};`;
  }).join('\n');
  return `[out:json][timeout:900];\n(\n${clauses}\n);\nout geom;`;
}

async function fetchOverpassData() {
  if (!REFRESH && existsSync(CACHE_FILE)) {
    console.log(`Using cached Overpass response at ${path.relative(ROOT, CACHE_FILE)} (pass --refresh to re-fetch)`);
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
  }

  const query = buildOverpassQuery();
  console.log('Querying Overpass API (single combined request for all 16 entities)...');
  const res = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    body: query,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*',
      'User-Agent': 'my-portfolio-v2/fetch-country-boundaries (one-off script)',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Overpass request failed: ${res.status} ${res.statusText}\n${body.slice(0, 500)}`);
  }
  const data = await res.json();

  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(data));
  console.log(`Cached raw response to ${path.relative(ROOT, CACHE_FILE)}`);
  return data;
}

function tagsMatch(featureTags, entityTags) {
  return Object.entries(entityTags).every(([k, v]) => featureTags?.[k] === v);
}

function countVertices(geometry) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.reduce(
      (sum, poly) => sum + poly.reduce((s, ring) => s + ring.length, 0),
      0,
    );
  }
  return 0;
}

function extractEntityFeatures(overpassData) {
  const collection = osmtogeojson(overpassData);
  const relationFeatures = collection.features.filter(
    (f) =>
      f.properties.type === 'relation' &&
      (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'),
  );

  const results = [];
  for (const entity of ENTITIES) {
    const matches = relationFeatures.filter((f) => tagsMatch(f.properties.tags, entity.tags));
    if (matches.length !== 1) {
      throw new Error(
        `Expected exactly 1 relation matching ${entity.adm0_a3} (${JSON.stringify(entity.tags)}), found ${matches.length}`,
      );
    }
    const [match] = matches;
    if (match.properties.tainted) {
      console.warn(`  Warning: ${entity.adm0_a3}'s OSM geometry is flagged "tainted" (incomplete) by osmtogeojson`);
    }
    results.push({
      type: 'Feature',
      properties: { name: entity.name, adm0_a3: entity.adm0_a3, iso_a2: entity.iso_a2 },
      geometry: match.geometry,
      __oldVertices: countVertices(match.geometry),
    });
  }
  return results;
}

// Runs before simplification (on full-detail raw geometry) so the cut edge
// is as clean as possible; the parent and child are simplified separately
// afterward regardless, so their boundaries won't align to the pixel, but
// that's an imperceptible sliver next to the double-fill it replaces.
function eraseContainedTerritories(rawFeatures) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const byCode = new Map(rawFeatures.map((f) => [f.properties.adm0_a3, f]));
  const stripInternal = ({ __oldVertices, ...clean }) => clean;

  for (const [parentCode, childCodes] of Object.entries(ERASURES)) {
    const parent = byCode.get(parentCode);
    if (!parent) continue;

    let currentPath = path.join(CACHE_DIR, `erase-${parentCode}-0.geojson`);
    writeFileSync(currentPath, JSON.stringify({ type: 'FeatureCollection', features: [stripInternal(parent)] }));

    childCodes.forEach((childCode, i) => {
      const child = byCode.get(childCode);
      if (!child) return;
      const maskPath = path.join(CACHE_DIR, `erase-mask-${childCode}.geojson`);
      writeFileSync(maskPath, JSON.stringify({ type: 'FeatureCollection', features: [stripInternal(child)] }));

      const nextPath = path.join(CACHE_DIR, `erase-${parentCode}-${i + 1}.geojson`);
      console.log(`Erasing ${childCode} out of ${parentCode}...`);
      execFileSync(
        MAPSHAPER_BIN,
        [currentPath, '-erase', maskPath, '-o', nextPath, 'format=geojson', 'force'],
        { stdio: 'inherit' },
      );
      rmSync(currentPath, { force: true });
      rmSync(maskPath, { force: true });
      currentPath = nextPath;
    });

    const result = JSON.parse(readFileSync(currentPath, 'utf8'));
    parent.geometry = result.features[0].geometry;
    rmSync(currentPath, { force: true });
  }
}

// Each tier is run as its own mapshaper process, on a FeatureCollection
// containing only that tier's countries. mapshaper builds one shared arc
// pool per `-i` import and a `-simplify` call's threshold applies to the
// *entire* pool (not just its `target=` layers — confirmed by mapshaper
// itself logging "Also simplified non-target layers from the same
// dataset"), so running all three tiers in one session with different
// percentages silently over/under-simplifies unrelated countries. Isolating
// each tier in its own process sidesteps that entirely.
function runMapshaper(rawFeatures) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const byCode = new Map(rawFeatures.map((f) => [f.properties.adm0_a3, f]));
  const allSimplified = [];

  for (const { pct, codes } of SIMPLIFY_TIERS) {
    const tierFeatures = codes.map((code) => {
      const feature = byCode.get(code);
      if (!feature) throw new Error(`No fetched feature for ${code} (tier ${pct})`);
      const { __oldVertices, ...clean } = feature;
      return clean;
    });

    const inputPath = path.join(CACHE_DIR, `tier-${pct}.geojson`);
    const outputPath = path.join(CACHE_DIR, `tier-${pct}-out.geojson`);
    writeFileSync(inputPath, JSON.stringify({ type: 'FeatureCollection', features: tierFeatures }));

    console.log(`Running mapshaper simplification (tier ${pct}: ${codes.join(', ')})...`);
    execFileSync(
      MAPSHAPER_BIN,
      [inputPath, '-simplify', 'visvalingam', 'keep-shapes', pct, '-o', outputPath, 'format=geojson', 'force'],
      { stdio: 'inherit' },
    );

    const result = JSON.parse(readFileSync(outputPath, 'utf8'));
    allSimplified.push(...result.features);
    rmSync(inputPath, { force: true });
    rmSync(outputPath, { force: true });
  }

  return allSimplified;
}

function mergeIntoCountriesGeojson(simplifiedFeatures, rawVerticesByCode) {
  const current = JSON.parse(readFileSync(COUNTRIES_GEOJSON, 'utf8'));
  const visitedCodes = new Set(ENTITIES.map((e) => e.adm0_a3));

  const previousVerticesByCode = Object.fromEntries(
    current.features
      .filter((f) => visitedCodes.has(f.properties.adm0_a3))
      .map((f) => [f.properties.adm0_a3, countVertices(f.geometry)]),
  );

  const keptFeatures = current.features.filter((f) => !visitedCodes.has(f.properties.adm0_a3));
  const beforeCount = current.features.length;

  const merged = {
    ...current,
    features: [...keptFeatures, ...simplifiedFeatures],
  };

  writeFileSync(COUNTRIES_GEOJSON, JSON.stringify(merged));

  console.log(
    `\n${'adm0_a3'.padEnd(8)}${'previous'.padEnd(10)}${'raw OSM'.padEnd(10)}${'simplified'.padEnd(10)}`,
  );
  for (const entity of ENTITIES) {
    const feature = simplifiedFeatures.find((f) => f.properties.adm0_a3 === entity.adm0_a3);
    const newVertices = feature ? countVertices(feature.geometry) : 0;
    console.log(
      `${entity.adm0_a3.padEnd(8)}${String(previousVerticesByCode[entity.adm0_a3] ?? '?').padEnd(10)}${String(rawVerticesByCode[entity.adm0_a3] ?? '?').padEnd(10)}${String(newVertices).padEnd(10)}`,
    );
  }

  console.log(`\nFeature count: ${beforeCount} -> ${merged.features.length} (should be unchanged)`);
}

async function main() {
  const overpassData = await fetchOverpassData();
  const rawFeatures = extractEntityFeatures(overpassData);

  const rawVerticesByCode = Object.fromEntries(
    rawFeatures.map((f) => [f.properties.adm0_a3, f.__oldVertices]),
  );

  eraseContainedTerritories(rawFeatures);

  const beforeSize = existsSync(COUNTRIES_GEOJSON)
    ? readFileSync(COUNTRIES_GEOJSON, 'utf8').length
    : 0;

  const simplified = runMapshaper(rawFeatures);

  mergeIntoCountriesGeojson(simplified, rawVerticesByCode);

  const afterSize = readFileSync(COUNTRIES_GEOJSON, 'utf8').length;
  console.log(`\nFile size: ${(beforeSize / 1024).toFixed(0)} KB -> ${(afterSize / 1024).toFixed(0)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
