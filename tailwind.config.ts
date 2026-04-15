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
        background: "#0B0F14",
        surface: "#121820",
        surfaceAlt: "#1A2330",
        border: "#283446",
        text: "#E8EEF7",
        muted: "#93A4BA",
        accent: "#2F80ED",
        accentSoft: "#79AFFF",
        success: "#22C55E",
        danger: "#F87171"
      },
      boxShadow: {
        glow: "0 18px 40px rgba(0, 0, 0, 0.28)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(47,128,237,0.16), transparent 26%), radial-gradient(circle at top right, rgba(9,14,20,0.42), transparent 24%), linear-gradient(180deg, rgba(18,24,32,0.96), rgba(11,15,20,0.98))"
      }
    }
  },
  plugins: []
};

export default config;
