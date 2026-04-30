/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
      colors: {
        brand: {
          50: "#faf5f9",
          100: "#f0e4ed",
          200: "#dfc5db",
          300: "#c9a0c3",
          400: "#a970a1",
          500: "#8B6085",
          600: "#6B2D68",
          700: "#4A1942",
          800: "#3B1536",
          900: "#2D1B2E",
          950: "#1A0E1C",
        },
        surface: {
          base: "var(--bg-base)",
          raised: "var(--bg-raised)",
          overlay: "var(--bg-overlay)",
          hover: "var(--bg-hover)",
        },
        almond: {
          50: "#FAF5EF",
          100: "#F5EDE3",
          200: "#EDE4D8",
          300: "#E5DCD0",
          400: "#D4C8B8",
          500: "#C4B8AB",
          600: "#A89B8E",
          700: "#8A7F75",
          800: "#6B6259",
          900: "#4A433C",
        },
        charcoal: {
          50: "#F0EDED",
          100: "#D9D6D6",
          200: "#B0ABAB",
          300: "#878080",
          400: "#5E5858",
          500: "#3A3636",
          600: "#302D2D",
          700: "#262424",
          800: "#1A1818",
          900: "#0F0E0E",
        },
      },
      borderColor: {
        glass: "var(--border)",
      },
      backgroundColor: {
        glass: "rgba(238, 229, 218, 0.03)",
        "glass-hover": "rgba(238, 229, 218, 0.06)",
      },
      boxShadow: {
        glow: "0 0 20px var(--brand-glow)",
        "glow-lg": "0 0 40px var(--brand-glow)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
