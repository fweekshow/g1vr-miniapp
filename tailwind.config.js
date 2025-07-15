/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DB64F',
        'primary-dark': '#118c3a',
        terminal: '#1DB64F',
        'terminal-bg': '#000000',
        'terminal-card': '#181A1B',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['Fira Mono', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} 