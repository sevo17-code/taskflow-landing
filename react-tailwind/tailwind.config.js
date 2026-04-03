/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"]
      },
      boxShadow: {
        glow: "0 30px 80px rgba(14, 165, 233, 0.18)"
      }
    }
  },
  plugins: []
};
