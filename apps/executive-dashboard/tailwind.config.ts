import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        deevo: {
          bg: "#060a14",
          surface: "#0c1222",
          elevated: "#131c30",
          border: "#1a2540",
          "border-subtle": "#141e34",
          accent: "#3b82f6",
          gold: "#d4a853",
          "gold-dim": "rgba(212, 168, 83, 0.12)",
          text: {
            primary: "#f0f4fc",
            secondary: "#8b9cc0",
            muted: "#4c5d80",
          },
          severity: {
            critical: "#ef4444",
            high: "#f97316",
            medium: "#eab308",
            low: "#22c55e",
            stable: "#3b82f6",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        arabic: ["IBM Plex Sans Arabic", "Noto Sans Arabic", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      boxShadow: {
        "glow-blue": "0 0 40px rgba(59, 130, 246, 0.06)",
        "glow-gold": "0 0 30px rgba(212, 168, 83, 0.06)",
        "glow-red": "0 0 30px rgba(239, 68, 68, 0.08)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(26, 37, 64, 1)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
