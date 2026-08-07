'use client';

import { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { visitedCountries } from '../data/visitedCountries';

// maplibre-gl-worker.mjs imports a sibling maplibre-gl-shared.mjs at runtime;
// Turbopack's asset pipeline only copies the file we reference and doesn't
// follow that import, so the sibling 404s. Serving both verbatim from
// public/maplibre (see postinstall script) sidesteps the bundler entirely.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/bright';
// OpenFreeMap's "Dark" style recolored onto the site's own warm palette
// (see tailwind.config.ts) — self-hosted since it's a one-off local edit.
const DARK_STYLE = '/styles/ofm-dark-warm.json';

const PALETTE = {
  light: {
    visited: '#E2531E', // light.tertiary
    unvisited: '#F1EBDF', // gray-100
    outline: '#A89D8A', // gray-400
  },
  dark: {
    visited: '#FF8C5A', // dark.tertiary
    unvisited: '#2E2820', // gray-800
    outline: '#5E554A', // gray-600
  },
} as const;

const FILL_LAYER_ID = 'visited-countries-fill';
const OUTLINE_LAYER_ID = 'visited-countries-outline';

const isDarkMode = () => document.documentElement.classList.contains('dark');

const Map = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [showVisited, setShowVisited] = useState(true);
  const showVisitedRef = useRef(showVisited);

  useEffect(() => {
    if (!containerRef.current) return;

    const addCountryLayers = (map: MapLibreMap, dark: boolean) => {
      const colors = dark ? PALETTE.dark : PALETTE.light;
      const visibility = showVisitedRef.current ? 'visible' : 'none';

      map.addSource('countries', {
        type: 'geojson',
        data: '/data/countries.geojson',
      });

      // Insert below the first label layer so place names stay readable.
      const firstSymbolLayerId = map
        .getStyle()
        ?.layers?.find((layer) => layer.type === 'symbol')?.id;

      map.addLayer(
        {
          id: FILL_LAYER_ID,
          type: 'fill',
          source: 'countries',
          layout: { visibility },
          paint: {
            'fill-color': [
              'match',
              ['get', 'adm0_a3'],
              visitedCountries,
              colors.visited,
              colors.unvisited,
            ],
            'fill-opacity': 0.5,
          },
        },
        firstSymbolLayerId
      );

      map.addLayer(
        {
          id: OUTLINE_LAYER_ID,
          type: 'line',
          source: 'countries',
          layout: { visibility },
          paint: {
            'line-color': colors.outline,
            'line-width': 0.5,
          },
        },
        firstSymbolLayerId
      );
    };

    const dark = isDarkMode();
    const map = new MapLibreMap({
      container: containerRef.current,
      style: dark ? DARK_STYLE : LIGHT_STYLE,
      center: [0, 20],
      zoom: 1.5,
    });
    mapRef.current = map;

    map.on('load', () => addCountryLayers(map, isDarkMode()));

    // The site's dark-mode toggle just flips a class on <html>; watch for
    // that so the map swaps style/colors live instead of only on refresh.
    const observer = new MutationObserver(() => {
      const nowDark = isDarkMode();
      map.setStyle(nowDark ? DARK_STYLE : LIGHT_STYLE);
      map.once('style.load', () => addCountryLayers(map, nowDark));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    showVisitedRef.current = showVisited;

    const map = mapRef.current;
    if (!map) return;

    const visibility = showVisited ? 'visible' : 'none';
    const applyVisibility = () => {
      if (map.getLayer(FILL_LAYER_ID)) {
        map.setLayoutProperty(FILL_LAYER_ID, 'visibility', visibility);
      }
      if (map.getLayer(OUTLINE_LAYER_ID)) {
        map.setLayoutProperty(OUTLINE_LAYER_ID, 'visibility', visibility);
      }
    };

    if (map.isStyleLoaded()) {
      applyVisibility();
    } else {
      map.once('load', applyVisibility);
    }
  }, [showVisited]);

  return (
    <div className='relative h-full w-full'>
      <div ref={containerRef} className='h-full w-full' />
      <button
        onClick={() => setShowVisited((prev) => !prev)}
        aria-pressed={showVisited}
        className={`absolute top-3 right-3 z-10 rounded-full border px-3 py-1.5 font-sans text-[length:var(--step--2)] backdrop-blur-sm transition-colors duration-200 cursor-pointer bg-light-accent/90 dark:bg-dark-accent/90 ${
          showVisited
            ? 'border-light-tertiary/40 dark:border-dark-tertiary/40 text-light-tertiary dark:text-dark-tertiary'
            : 'border-gray-300/60 dark:border-gray-600/60 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
        }`}
      >
        Visited countries
      </button>
    </div>
  );
};

export default Map;
