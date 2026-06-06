/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD600',
          black: '#000000',
          surface: '#0D0D0D',
          card: '#141414',
          border: '#1F1F1F',
          muted: '#5A5A5A',
          text: '#FFFFFF',
          sub: '#8A8A8A',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
