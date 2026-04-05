import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#090B10",
        surface: "#111723",
        surfaceAlt: "#182233",
        border: "#2B3648",
        text: "#F5F7FA",
        muted: "#9EABBC",
        accent: "#F59E0B",
        accentSoft: "#F4C15D",
        success: "#22C55E",
        danger: "#F87171"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(8, 12, 22, 0.45)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(245, 158, 11, 0.18), transparent 28%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))"
      }
    }
  },
  plugins: []
};

export default config;
