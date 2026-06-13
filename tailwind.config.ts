import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        "surface-hover": "var(--color-surface-hover)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        accent: {
          DEFAULT: "var(--color-accent)",
          muted: "var(--color-accent-muted)",
          hover: "var(--color-accent-hover)",
          foreground: "var(--color-accent-foreground)",
        },
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        neon: "var(--shadow-neon)",
      },
      animation: {
        "fade-in": "fadeIn var(--transition-normal) ease-out forwards",
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
        "float": "float 6s ease-in-out infinite",
        "chaos-vibe": "chaosVibe 0.5s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px var(--color-accent)" },
          "50%": { boxShadow: "0 0 25px var(--color-accent), 0 0 10px rgba(168, 85, 247, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        chaosVibe: {
          "0%, 100%": { transform: "skew(0deg) translate(0px, 0px)" },
          "25%": { transform: "skew(1deg) translate(1px, -1px)" },
          "50%": { transform: "skew(-1deg) translate(-1px, 1px)" },
          "75%": { transform: "skew(0.5deg) translate(-1px, -1px)" },
        }
      },
    },
  },
  plugins: [],
};
export default config;
