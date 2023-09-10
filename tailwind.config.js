/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'fluid': 'repeat(auto-fit, minmax(150px, 250px))',
        'fluid-sm': 'repeat(auto-fit, minmax(250px, 1fr))',
        'fluid-lg': 'repeat(auto-fit, minmax(350px, 1fr))',
      },
    },
  },
  plugins: [],
}