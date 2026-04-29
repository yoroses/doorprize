/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        islam: {
          deep: "#0d3a25",
          green: "#16633a",
          mid: "#1f7a48",
          light: "#2c9b5d",
          gold: "#f0c64a",
          goldDark: "#caa12d",
          cream: "#fdf3d8",
          purple: "#7b3da8",
        },
      },
      fontFamily: {
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
