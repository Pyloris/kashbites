/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: {
            DEFAULT: '#143E26',
            deep: '#0A2416',
            darker: '#0A2416',
            dark: '#0E331E',
            forest: '#103822',
            medium: '#1F5435',
            light: '#E1EBE3',
            tint: '#EAF2EC',
          },
          gold: {
            DEFAULT: '#C59432',
            dark: '#6D4906',
            deep: '#9E6D0E',
            bright: '#DFB248',
            light: '#DFB248',
            subtle: '#FAF0D6',
            tint: '#FAF4E6',
          },
          sand: {
            DEFAULT: '#E8DEC8',
            border: '#E8DEC8',
            medium: '#D5CABB',
            light: '#F2ECE1',
            surface: '#F5EFE6',
            subtle: '#F5EFE6',
            track: '#F4EFE6',
            divider: '#EFE8DC',
            dark: '#D5CABB',
          },
          canvas: {
            DEFAULT: '#FAF7F2',
            page: '#FAF7F2',
            card: '#FCFAF5',
            white: '#FFFFFF',
          },
          text: {
            DEFAULT: '#1E2E21',
            primary: '#0E331E',
            display: '#0E331E',
            main: '#1E2E21',
            body: '#2F4435',
            muted: '#526356',
            subtle: '#7A8E7F',
            light: '#FAF7F2',
          },
          status: {
            success: '#2D7A46',
            danger: '#B91C1C',
            warning: '#D97706',
            info: '#2563EB',
          },
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        sans: ["'Plus Jakarta Sans'", 'system-ui', '-apple-system', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        cardHover: '0 12px 24px -4px rgba(20, 62, 38, 0.12)',
      },
    },
  },
  plugins: [],
};
