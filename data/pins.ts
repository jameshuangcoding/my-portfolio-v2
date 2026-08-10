export type PinCategory = 'travel';

export interface Pin {
  lat: number;
  lng: number;
  category: PinCategory;
  title: string;
  caption: string;
  photo: string; // path under /public, e.g. '/photos/travel/kyoto.jpg'
}

// Adding a new category here — and giving some pins that category below —
// is all a future pin type needs; Map.tsx derives its toggle buttons and
// marker colors from this object.
export const PIN_CATEGORIES: Record<
  PinCategory,
  { label: string; color: { light: string; dark: string } }
> = {
  travel: {
    label: 'Travel',
    color: { light: '#0369A1', dark: '#38BDF8' }, // Tailwind sky-700 / sky-400
  },
};

// TODO: replace with your own pins.
export const pins: Pin[] = [
  {
    lat: 35.0116,
    lng: 135.7681,
    category: 'travel',
    title: 'Kyoto, Japan',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/kyoto/400/300',
  },
  {
    lat: 48.8566,
    lng: 2.3522,
    category: 'travel',
    title: 'Paris, France',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/paris/400/300',
  },
  {
    lat: -33.8688,
    lng: 151.2093,
    category: 'travel',
    title: 'Sydney, Australia',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/sydney/400/300',
  },
  {
    lat: 40.7128,
    lng: -74.006,
    category: 'travel',
    title: 'New York City, USA',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/nyc/400/300',
  },
  {
    lat: -13.1631,
    lng: -72.545,
    category: 'travel',
    title: 'Machu Picchu, Peru',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/machupicchu/400/300',
  },
  {
    lat: 64.1466,
    lng: -21.9426,
    category: 'travel',
    title: 'Reykjavik, Iceland',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/reykjavik/400/300',
  },
  {
    lat: 30.0444,
    lng: 31.2357,
    category: 'travel',
    title: 'Cairo, Egypt',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/cairo/400/300',
  },
  {
    lat: 1.3521,
    lng: 103.8198,
    category: 'travel',
    title: 'Singapore',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/singapore/400/300',
  },
  {
    lat: -22.9068,
    lng: -43.1729,
    category: 'travel',
    title: 'Rio de Janeiro, Brazil',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/rio/400/300',
  },
  {
    lat: 51.5072,
    lng: -0.1276,
    category: 'travel',
    title: 'London, UK',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/london/400/300',
  },
  {
    lat: 28.6139,
    lng: 77.209,
    category: 'travel',
    title: 'New Delhi, India',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/delhi/400/300',
  },
  {
    lat: -1.2921,
    lng: 36.8219,
    category: 'travel',
    title: 'Nairobi, Kenya',
    caption: 'Replace with your own caption.',
    photo: 'https://picsum.photos/seed/nairobi/400/300',
  },
];
