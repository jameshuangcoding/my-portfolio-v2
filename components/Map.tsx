'use client';

import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  setWorkerUrl,
  type LngLatBoundsLike,
} from 'maplibre-gl';
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

// Photo pins are sourced from a single Cloudinary folder (portfolio-map/photos,
// see scripts/generate-photo-geojson.mjs), so there's just one visual
// treatment to theme — no per-category config needed.
const PHOTO_COLOR = { light: '#0369A1', dark: '#38BDF8' } as const; // Tailwind sky-700 / sky-400

const PHOTOS_URL = '/data/photos.geojson';

interface PhotoProperties {
  title: string;
  photo: string;
  photoFull: string;
  publicId: string;
}

interface PhotoFeatureCollection {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: PhotoProperties;
  }[];
}

// Map markers are plain DOM elements (maplibre-gl owns them, not React), so
// the FaMapMarkerAlt glyph used for the "Travel" toggle button is inlined
// here as raw SVG rather than rendered as a component — same path/viewBox,
// just set via innerHTML so pins on the map match the toggle icon exactly.
const PIN_MARKER_ICON =
  '<svg viewBox="0 0 384 512" fill="currentColor" width="100%" height="100%">' +
  '<path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>' +
  '</svg>';

// Minimum zoom to fly to when a pin is clicked — city/neighborhood scale,
// close enough to actually place the photo, not just the metro area. Never
// zooms out if the user is already closer than this.
const PIN_FOCUS_ZOOM = 12;

// flyTo/fitBounds's default speed (1.2) makes camera moves — pin-click
// focus and the reset-to-world-view button — feel sluggish, especially
// flying across continents. Pick up the pace.
const FLY_SPEED = 3;

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
const RESET_BUTTON_GAP = 2.5;

// Active-state border/text for the "Travel" toggle button. Kept separate
// from PHOTO_COLOR (used for the marker icons) since these are static
// Tailwind classes and must appear literally for the JIT scanner.
const PHOTO_BUTTON_STYLE =
  'border-sky-700/40 dark:border-sky-400/40 text-sky-700 dark:text-sky-400';

const isDarkMode = () => document.documentElement.classList.contains('dark');

const buildPopupContent = ({ title, photo }: PhotoProperties) => {
  // No padding/gap: the image runs flush to the card's edges (clipped to its
  // rounded corners by .maplibregl-popup-content in globals.css) and the
  // button sits directly beneath as a bottom tab, separated only by its own
  // top border.
  const wrapper = document.createElement('div');
  wrapper.className = 'w-40';

  // Fixed 4:3 landscape box matching the smart-cropped source image (see
  // generate-photo-geojson.mjs) so every popup has the same shape. object-cover
  // is just a safety net for the box's own aspect rounding — Cloudinary's
  // gravity: 'auto' crop already picked the interesting region server-side.
  const img = document.createElement('img');
  img.src = photo;
  img.alt = title;
  img.loading = 'lazy';
  img.className =
    'block aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800 object-cover';
  wrapper.appendChild(img);

  // Placeholder trigger for a future full-image modal — not wired up yet.
  // Held back until the image finishes loading so it doesn't appear before
  // there's anything to view.
  const viewButton = document.createElement('button');
  viewButton.type = 'button';
  viewButton.textContent = 'View Image';
  viewButton.className =
    'block w-full cursor-pointer border-t border-gray-300/60 dark:border-gray-600/60 py-1 text-center font-sans text-[length:var(--step--1)] text-light-tertiary dark:text-dark-tertiary opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-gray-100 dark:hover:bg-gray-800';
  wrapper.appendChild(viewButton);

  const revealButton = () => viewButton.classList.remove('opacity-0');
  if (img.complete) revealButton();
  else img.addEventListener('load', revealButton, { once: true });

  return wrapper;
};

const Map = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [showVisited, setShowVisited] = useState(true);
  const showVisitedRef = useRef(showVisited);
  const [showPhotos, setShowPhotos] = useState(true);
  const showPhotosRef = useRef(showPhotos);
  const markersRef = useRef<
    { marker: Marker; el: HTMLElement; popup: Popup }[]
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

      // Insert below the basemap's own water layer (not just below labels)
      // so its authoritative coastline — drawn from the same OSM data as
      // everything else in the style — paints over any part of our fill
      // that oversteps into the sea, instead of our highlight bleeding
      // visibly into water. Falls back to the first label layer if the
      // style's water layer can't be found (defensive; both bundled styles
      // have one).
      const styleLayers = map.getStyle()?.layers;
      const waterLayerId = styleLayers?.find(
        (layer) => layer.id === 'water',
      )?.id;
      const firstSymbolLayerId = styleLayers?.find(
        (layer) => layer.type === 'symbol',
      )?.id;
      const beforeId = waterLayerId ?? firstSymbolLayerId;

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
        beforeId,
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
        beforeId,
      );
    };

    // Every photo always gets its own marker — no bubble/count clustering.
    // When several are geographically close they simply overlap on screen
    // (later markers stack on top in DOM order), and clicking whichever is
    // on top flies straight to its exact coordinates. Markers are plain DOM
    // nodes independent of the map style, so this only needs to run once on
    // initial load, not on every style reload.
    const addPhotoMarkers = async (map: MapLibreMap) => {
      const data: PhotoFeatureCollection = await fetch(PHOTOS_URL).then((r) =>
        r.json(),
      );
      const dark = isDarkMode();

      data.features.forEach(({ geometry, properties }) => {
        const [lng, lat] = geometry.coordinates;

        const el = document.createElement('button');
        el.type = 'button';
        el.setAttribute('aria-label', properties.title);
        el.className =
          'block h-5 w-5 origin-bottom cursor-pointer drop-shadow-sm transition-transform duration-150 hover:scale-125';
        el.style.color = dark ? PHOTO_COLOR.dark : PHOTO_COLOR.light;
        el.innerHTML = PIN_MARKER_ICON;

        const popup = new Popup({
          offset: 20,
          closeButton: false,
          maxWidth: '160px',
        }).setDOMContent(buildPopupContent(properties));

        // Anchored at the icon's bottom tip (not its center) so the pin
        // points exactly at the pin's coordinates, matching how the
        // FaMapMarkerAlt teardrop shape is meant to sit on a map.
        const marker = new Marker({ element: el, anchor: 'bottom' }).setLngLat(
          [lng, lat],
        );

        // Not bound via marker.setPopup() — clicking should fly to the pin
        // first and only reveal the popup once that camera move settles.
        // But if the pin is already comfortably in view (already zoomed to
        // city level and on screen), skip the flyTo entirely — re-centering
        // the map on every click of a visible pin is disorienting busywork;
        // the popup alone is enough to show which pin was picked.
        el.addEventListener('click', (event) => {
          // Marker buttons sit inside the map container, so an unstopped
          // click bubbles up to it — and Popup's default closeOnClick
          // listens for exactly that, closing whatever popup was just
          // opened in the same tick. The flyTo branch dodges this by luck
          // (its popup.addTo happens later, on 'moveend'), but the
          // already-in-view branch adds the popup synchronously and needs
          // this to not immediately self-close.
          event.stopPropagation();
          activePopupRef.current?.remove();

          const alreadyInView =
            map.getZoom() >= PIN_FOCUS_ZOOM &&
            map.getBounds().contains([lng, lat]);

          if (alreadyInView) {
            popup.setLngLat([lng, lat]).addTo(map);
            activePopupRef.current = popup;
            return;
          }

          const token = ++pinClickTokenRef.current;

          map.flyTo({
            center: [lng, lat],
            zoom: Math.max(map.getZoom(), PIN_FOCUS_ZOOM),
            speed: FLY_SPEED,
          });

          map.once('moveend', () => {
            if (pinClickTokenRef.current !== token) return;
            popup.setLngLat([lng, lat]).addTo(map);
            activePopupRef.current = popup;
          });
        });

        markersRef.current.push({ marker, el, popup });
        if (showPhotosRef.current) marker.addTo(map);
      });
    };

    // Marker elements are plain DOM nodes independent of the map style, so
    // recoloring them on a theme switch is enough — no need to recreate.
    const recolorPhotoMarkers = (dark: boolean) => {
      const color = dark ? PHOTO_COLOR.dark : PHOTO_COLOR.light;
      markersRef.current.forEach(({ el }) => {
        el.style.color = color;
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

    // Popups are added manually (see addPhotoMarkers) rather than bound via
    // marker.setPopup(), so none of maplibre's built-in auto-close behavior
    // applies to them — dragging or zooming away otherwise leaves the popup
    // floating over an unrelated part of the map.
    const closeActivePopup = () => {
      activePopupRef.current?.remove();
      activePopupRef.current = null;
    };
    map.on('dragstart', closeActivePopup);
    map.on('zoomstart', closeActivePopup);

    map.on('load', () => {
      addCountryLayers(map, isDarkMode());
      addPhotoMarkers(map);
      // Fitted zoom becomes the floor so users can't zoom out past the
      // full-world view that was just computed for this container.
      map.setMinZoom(map.getZoom());
    });

    // The site's dark-mode toggle just flips a class on <html>; watch for
    // that so the map swaps style/colors live instead of only on refresh.
    // Photo markers are plain DOM overlays independent of the style, so
    // they just need recoloring here, not recreating.
    const observer = new MutationObserver(() => {
      const nowDark = isDarkMode();
      map.setStyle(nowDark ? DARK_STYLE : LIGHT_STYLE);
      map.once('style.load', () => addCountryLayers(map, nowDark));
      recolorPhotoMarkers(nowDark);
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
    showPhotosRef.current = showPhotos;

    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(({ marker, popup }) => {
      marker.remove();
      if (showPhotos) {
        marker.addTo(map);
      } else if (activePopupRef.current === popup) {
        // The pin behind this open popup was just hidden — the popup would
        // otherwise be left floating with no marker under it.
        popup.remove();
        activePopupRef.current = null;
      }
    });
  }, [showPhotos]);

  const resetView = () => {
    const map = mapRef.current;
    if (!map) return;

    activePopupRef.current?.remove();
    map.fitBounds(WORLD_BOUNDS, {
      padding: WORLD_FIT_PADDING,
      speed: FLY_SPEED,
    });
  };

  return (
    <div className='absolute inset-0'>
      <div ref={containerRef} className='h-full w-full' />
      <div className='absolute top-3 right-2.5 z-10 flex flex-col items-end gap-2'>
        <button
          onClick={() => setShowVisited((prev) => !prev)}
          aria-pressed={showVisited}
          aria-label='Toggle visited countries'
          title='Visited countries'
          className={`flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-sm transition-[transform,color,background-color] duration-200 cursor-pointer bg-light-accent/90 dark:bg-dark-accent/90 hover:scale-110 ${
            showVisited
              ? 'border-light-tertiary/40 dark:border-dark-tertiary/40 text-light-tertiary dark:text-dark-tertiary'
              : 'border-gray-300/60 dark:border-gray-600/60 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
          }`}
        >
          <FaCheck className='h-3 w-3' />
        </button>
        <button
          onClick={() => setShowPhotos((prev) => !prev)}
          aria-pressed={showPhotos}
          aria-label='Toggle travel pins'
          title='Travel'
          className={`flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-sm transition-[transform,color,background-color] duration-200 cursor-pointer bg-light-accent/90 dark:bg-dark-accent/90 hover:scale-110 ${
            showPhotos
              ? PHOTO_BUTTON_STYLE
              : 'border-gray-300/60 dark:border-gray-600/60 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
          }`}
        >
          <FaMapMarkerAlt className='h-3 w-3' />
        </button>
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
