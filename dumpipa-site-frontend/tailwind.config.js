/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#496AF2',
          light: '#6B85F5',
          dark: '#3A56D4',
        },
      },
    },
  },
  plugins: [],
}

