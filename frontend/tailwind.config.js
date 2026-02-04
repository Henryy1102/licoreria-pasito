/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Montserrat", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Inter", "system-ui", "serif"],
      },
      colors: {
        fondo: "#0f172a",
        primary: "#d4af37",
        secondary: "#1e293b",
        accent: "#94a3b8",
        purple: "#1e293b",
        card: "#1e293b",
        textMain: "#f8fafc",
        subtext: "#a7b1c2",
        borderColor: "#334155",
      },
      borderRadius: {
        'card': '8px',
      },
    },
  },
  plugins: [],
}

