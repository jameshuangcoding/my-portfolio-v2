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
        // Slightly off-white shades
        light: {
          primary: '#FAFAFA',    // Main background
          secondary: '#F5F5F5',  // Secondary background
          accent: '#FFFFFF',     // Pure white for contrast when needed
          tertiary: '#FF6B35',   // Neon orange accent
        },
        // Rich blacks (avoiding pure black)
        dark: {
          primary: '#121212',    // Main background
          secondary: '#1A1A1A',  // Secondary background
          accent: '#242424',     // Lighter dark for contrast
          tertiary: '#FF8C5A',   // Lighter neon orange for dark mode
        },
        // Sophisticated grays
        gray: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],  // Body text
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],  // Headlines
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} satisfies Config;
