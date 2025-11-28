import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Purple + Electric Teal palette (Notion/Figma/Stripe vibe)
        brand: {
          purple: {
            50: "#faf5ff",
            100: "#f3e8ff",
            200: "#e9d5ff",
            300: "#d8b4fe",
            400: "#c084fc",
            500: "#a855f7",
            600: "#9333ea", // Main purple
            700: "#7e22ce",
            800: "#6b21a8",
            900: "#581c87",
            950: "#3b0764",
          },
          teal: {
            50: "#f0fdfa",
            100: "#ccfbf1",
            200: "#99f6e4",
            300: "#5eead4",
            400: "#2dd4bf", // Electric teal
            500: "#14b8a6",
            600: "#0d9488",
            700: "#0f766e",
            800: "#115e59",
            900: "#134e4a",
            950: "#042f2e",
          },
        },
        background: {
          light: "#fafafa", // Off-white
          dark: "#0a0a0a", // Very dark gray
          card: "#ffffff",
        },
        border: {
          light: "#e5e5e5",
          DEFAULT: "#d4d4d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }], // 40px
        h2: ["1.75rem", { lineHeight: "1.3", fontWeight: "600" }], // 28px
        h3: ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }], // 20px
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }], // 16px
        small: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }], // 14px
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
