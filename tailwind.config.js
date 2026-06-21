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
