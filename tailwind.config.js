/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#71717a',
          600: '#52525b',
          700: '#27272a',
          800: '#18181b',
          850: '#121214',
          900: '#09090b',
          950: '#000000',
        },
        forest: {
          DEFAULT: '#1A3827',
          light: '#255038',
          dark: '#102217',
          soft: '#EAF0EC',
        },
        lime: {
          DEFAULT: '#A3E635',
          light: '#BEF264',
          dark: '#84CC16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
