// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        cursive: ['var(--font-great-vibes)', 'cursive'],
      },
      colors: {
        quickSolutionBlue: '#000000',
      },
    },
  },
  plugins: [],
};
