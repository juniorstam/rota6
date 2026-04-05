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
        background: "#F8FAFC",
        surface: "#FFFFFF",
        surfaceAlt: "#EEF2F7",
        border: "#D7DEE8",
        text: "#0F172A",
        muted: "#64748B",
        accent: "#F97316",
        accentSoft: "#C2410C",
        success: "#22C55E",
        danger: "#F87171"
      },
      boxShadow: {
        glow: "0 20px 50px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(249, 115, 22, 0.14), transparent 28%), radial-gradient(circle at top right, rgba(15, 23, 42, 0.08), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.6))"
      }
    }
  },
  plugins: []
};

export default config;
