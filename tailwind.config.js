/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'holo-blue': '#0070f3',
        'holo-lightblue': '#79bcfc',
        'holo-text': '#333333',
        'holo-secondary-text': '#555555',
      }
    },
  },
  plugins: [],
} 