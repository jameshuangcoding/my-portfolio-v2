import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm ivory / paper shades
        light: {
          primary: '#FBF8F1',    // Warm ivory — main background
          secondary: '#F3EDE0',  // Deeper paper — secondary surfaces
          accent: '#FFFDF8',     // Near-white for raised contrast
          tertiary: '#E2531E',   // Refined vermillion-orange accent
        },
        // Warm near-blacks (tinted warm, avoiding pure black)
        dark: {
          primary: '#16130F',    // Warm near-black — main background
          secondary: '#1E1A14',  // Secondary surfaces
          accent: '#2A251D',     // Raised contrast
          tertiary: '#FF8C5A',   // Lighter warm orange for dark mode
        },
        // Warm taupe-tinted gray scale
        gray: {
          50:  '#FAF7F0',
          100: '#F1EBDF',
          200: '#E2DACB',
          300: '#CABFAC',
          400: '#A89D8A',
          500: '#7C7263',
          600: '#5E554A',
          700: '#473F36',
          800: '#2E2820',
          900: '#1C1812',
        },
      },
      fontFamily: {
        sans: ['var(--font-newsreader)', 'Georgia', 'serif'],   // Body text
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],  // Headlines
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} satisfies Config;
