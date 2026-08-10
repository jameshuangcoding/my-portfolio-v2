'use client';

import { useEffect, useRef, useState } from 'react';
import { FaGlobe } from 'react-icons/fa';
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  setWorkerUrl,
  type LngLatBoundsLike,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { visitedCountries } from '../data/visitedCountries';
import { pins, PIN_CATEGORIES, type Pin, type PinCategory } from '../data/pins';

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

const PIN_CATEGORY_LIST = Object.keys(PIN_CATEGORIES) as PinCategory[];

// Minimum zoom to fly to when a pin is clicked — never zooms out if the
// user is already closer than this.
const PIN_FOCUS_ZOOM = 7;

// Lng/lat box spanning the inhabited world (poles excluded). The map fits
// this on load/resize instead of a hand-tuned zoom constant, so the initial
// view — and the furthest users can zoom out — adapts to the container's
// actual size and aspect ratio (e.g. a narrow, tall mobile viewport vs. a
// wide 16:9 desktop one).
const WORLD_BOUNDS: LngLatBoundsLike = [
  [-169, -56],
  [190, 75],
];
const WORLD_FIT_PADDING = 24;

// Vertical breathing room between the reset-view button and whatever's
// below it (the attribution control), in pixels.
const RESET_BUTTON_GAP = 10;

// Active-state border/text per category toggle button. Kept separate from
// PIN_CATEGORIES' hex colors (used for the marker dots) since these are
// static Tailwind classes and must appear literally for the JIT scanner.
const PIN_BUTTON_STYLES: Record<PinCategory, string> = {
  travel:
    'border-sky-700/40 dark:border-sky-400/40 text-sky-700 dark:text-sky-400',
};

const isDarkMode = () => document.documentElement.classList.contains('dark');

const buildPopupContent = (pin: Pin) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'w-52 space-y-2';

  const img = document.createElement('img');
  img.src = pin.photo;
  img.alt = pin.title;
  img.loading = 'lazy';
  img.className = 'h-28 w-full rounded-md object-cover';
  wrapper.appendChild(img);

  const title = document.createElement('p');
  title.textContent = pin.title;
  title.className =
    'font-display text-[length:var(--step--1)] font-medium text-gray-900 dark:text-gray-50';
  wrapper.appendChild(title);

  const caption = document.createElement('p');
  caption.textContent = pin.caption;
  caption.className =
    'font-sans text-[length:var(--step--2)] text-gray-600 dark:text-gray-400';
  wrapper.appendChild(caption);

  return wrapper;
};

const Map = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [showVisited, setShowVisited] = useState(true);
  const showVisitedRef = useRef(showVisited);
  const [activeCategories, setActiveCategories] = useState<Set<PinCategory>>(
    () => new Set(PIN_CATEGORY_LIST),
  );
  const activeCategoriesRef = useRef(activeCategories);
  const markersRef = useRef<
    { marker: Marker; el: HTMLElement; category: PinCategory; popup: Popup }[]
  >([]);
  const activePopupRef = useRef<Popup | null>(null);
  // Bumped on every pin click so a stale flyTo (superseded by a second,
  // faster click elsewhere) can't open its popup after the fact.
  const pinClickTokenRef = useRef(0);
  // How far the reset-view button sits from the container's bottom edge.
  // Tracks the attribution control's actual rendered height rather than
  // assuming it — on narrow viewports it starts expanded (wraps to two
  // lines) and only collapses to its compact "i" icon once the map is
  // dragged, so a fixed offset would let the two controls overlap.
  const [resetButtonInset, setResetButtonInset] = useState(
    24 + RESET_BUTTON_GAP,
  );

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
        firstSymbolLayerId,
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
        firstSymbolLayerId,
      );
    };

    const addPinMarkers = (map: MapLibreMap, dark: boolean) => {
      pins.forEach((pin) => {
        const color = PIN_CATEGORIES[pin.category].color;

        const el = document.createElement('button');
        el.type = 'button';
        el.setAttribute('aria-label', pin.title);
        el.className =
          'block h-3.5 w-3.5 rounded-full border-2 border-light-accent dark:border-dark-accent shadow-sm cursor-pointer transition-transform duration-150 hover:scale-125';
        el.style.backgroundColor = dark ? color.dark : color.light;

        const popup = new Popup({
          offset: 14,
          closeButton: true,
          maxWidth: '240px',
        }).setDOMContent(buildPopupContent(pin));

        const marker = new Marker({ element: el }).setLngLat([
          pin.lng,
          pin.lat,
        ]);

        // Not bound via marker.setPopup() — clicking should fly to the pin
        // first and only reveal the popup once that camera move settles.
        el.addEventListener('click', () => {
          activePopupRef.current?.remove();
          const token = ++pinClickTokenRef.current;

          map.flyTo({
            center: [pin.lng, pin.lat],
            zoom: Math.max(map.getZoom(), PIN_FOCUS_ZOOM),
          });

          map.once('moveend', () => {
            if (pinClickTokenRef.current !== token) return;
            popup.setLngLat([pin.lng, pin.lat]).addTo(map);
            activePopupRef.current = popup;
          });
        });

        markersRef.current.push({ marker, el, category: pin.category, popup });

        if (activeCategoriesRef.current.has(pin.category)) {
          marker.addTo(map);
        }
      });
    };

    // Marker elements are plain DOM nodes independent of the map style, so
    // recoloring them on a theme switch is enough — no need to recreate.
    const recolorPinMarkers = (dark: boolean) => {
      markersRef.current.forEach(({ el, category }) => {
        const color = PIN_CATEGORIES[category].color;
        el.style.backgroundColor = dark ? color.dark : color.light;
      });
    };

    const dark = isDarkMode();
    const map = new MapLibreMap({
      container: containerRef.current,
      style: dark ? DARK_STYLE : LIGHT_STYLE,
      bounds: WORLD_BOUNDS,
      fitBoundsOptions: { padding: WORLD_FIT_PADDING },
      // renderWorldCopies: false,
    });
    mapRef.current = map;

    map.on('load', () => {
      addCountryLayers(map, isDarkMode());
      addPinMarkers(map, isDarkMode());
      // Fitted zoom becomes the floor so users can't zoom out past the
      // full-world view that was just computed for this container.
      map.setMinZoom(map.getZoom());
    });

    // The site's dark-mode toggle just flips a class on <html>; watch for
    // that so the map swaps style/colors live instead of only on refresh.
    const observer = new MutationObserver(() => {
      const nowDark = isDarkMode();
      map.setStyle(nowDark ? DARK_STYLE : LIGHT_STYLE);
      map.once('style.load', () => addCountryLayers(map, nowDark));
      recolorPinMarkers(nowDark);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // The container's height now comes from flex layout (fills the
    // viewport on mobile) rather than a fixed aspect ratio, so it can
    // still shift after mount — e.g. once the custom fonts swap in and
    // change the nav/footer heights. MapLibre only measures its container
    // once at construction, so without this the canvas is left stuck at
    // whatever size existed at that first paint.
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      // Re-fit the min-zoom floor to the new container dimensions — e.g.
      // rotating a phone or resizing the window changes what zoom level
      // shows the whole world, so the old floor could leave it zoomed in
      // too far (or let it zoom out past the world) after the resize.
      const fitted = map.cameraForBounds(WORLD_BOUNDS, {
        padding: WORLD_FIT_PADDING,
      });
      if (fitted?.zoom != null) map.setMinZoom(fitted.zoom);
    });
    resizeObserver.observe(containerRef.current);

    // The attribution control resizes itself independently of the map
    // container (expanding/collapsing its text, or wrapping differently as
    // the container width changes), so its footprint is tracked separately
    // and used to keep the reset-view button from overlapping it.
    const attribEl = containerRef.current.querySelector<HTMLElement>(
      '.maplibregl-ctrl-bottom-right',
    );
    const attribResizeObserver = new ResizeObserver(([entry]) => {
      setResetButtonInset(entry.contentRect.height + RESET_BUTTON_GAP);
    });
    if (attribEl) attribResizeObserver.observe(attribEl);

    return () => {
      attribResizeObserver.disconnect();
      resizeObserver.disconnect();
      observer.disconnect();
      markersRef.current.forEach(({ marker, popup }) => {
        marker.remove();
        popup.remove();
      });
      markersRef.current = [];
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

  useEffect(() => {
    activeCategoriesRef.current = activeCategories;

    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(({ marker, category }) => {
      marker.remove();
      if (activeCategories.has(category)) {
        marker.addTo(map);
      }
    });
  }, [activeCategories]);

  const toggleCategory = (category: PinCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const resetView = () => {
    const map = mapRef.current;
    if (!map) return;

    activePopupRef.current?.remove();
    map.fitBounds(WORLD_BOUNDS, { padding: WORLD_FIT_PADDING });
  };

  return (
    <div className='absolute inset-0'>
      <div ref={containerRef} className='h-full w-full' />
      <div className='absolute top-3 right-3 z-10 flex flex-col items-end gap-2'>
        <button
          onClick={() => setShowVisited((prev) => !prev)}
          aria-pressed={showVisited}
          className={`rounded-full border px-3 py-1.5 font-sans text-[length:var(--step--2)] backdrop-blur-sm transition-colors duration-200 cursor-pointer bg-light-accent/90 dark:bg-dark-accent/90 ${
            showVisited
              ? 'border-light-tertiary/40 dark:border-dark-tertiary/40 text-light-tertiary dark:text-dark-tertiary'
              : 'border-gray-300/60 dark:border-gray-600/60 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
          }`}
        >
          Visited countries
        </button>
        {PIN_CATEGORY_LIST.map((category) => {
          const active = activeCategories.has(category);
          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 font-sans text-[length:var(--step--2)] backdrop-blur-sm transition-colors duration-200 cursor-pointer bg-light-accent/90 dark:bg-dark-accent/90 ${
                active
                  ? PIN_BUTTON_STYLES[category]
                  : 'border-gray-300/60 dark:border-gray-600/60 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
              }`}
            >
              {PIN_CATEGORIES[category].label}
            </button>
          );
        })}
      </div>
      <button
        onClick={resetView}
        aria-label='Reset to global view'
        title='Reset to global view'
        style={{ bottom: resetButtonInset }}
        className='absolute right-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300/60 dark:border-gray-600/60 text-gray-500 dark:text-gray-400 backdrop-blur-sm transition-[transform,color,background-color] duration-200 cursor-pointer bg-light-accent/90 dark:bg-dark-accent/90 hover:text-gray-900 dark:hover:text-gray-50 hover:scale-110'
      >
        <FaGlobe className='h-3 w-3' />
      </button>
    </div>
  );
};

export default Map;
