/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e11d48", // A modern rose/red for booking CTAs
        secondary: "#1e293b", // Slate 800 for dark text/headers
      }
    },
  },
  plugins: [],
}