/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF6B00',
          hover: '#FF7A00',
          glow: 'rgba(255, 107, 0, 0.45)',
        },
        surface: {
          dark: '#0B0E14',
          card: 'rgba(18, 22, 32, 0.65)',
        }
      },
      backdropBlur: {
        glass: '14px',
      }
    },
  },
  plugins: [],
}
