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
        "background-dark": "var(--color-background-dark)",
        "background-crimson": "var(--color-background-crimson)",
        "background-cream": "var(--color-background-cream)",
        "background-light": "var(--color-background-light)",
        foreground: "var(--color-foreground)",
        surface: "var(--color-surface)",
        "surface-dark": "var(--color-surface-dark)",
        "surface-raised": "var(--color-surface-raised)",
        "surface-hover": "var(--color-surface-hover)",
        text: "var(--color-text)",
        "text-dark": "var(--color-text-dark)",
        "text-muted": "var(--color-text-muted)",
        "text-muted-dark": "var(--color-text-muted-dark)",
        border: "var(--color-border)",
        "border-dark": "var(--color-border-dark)",
        accent: {
          DEFAULT: "var(--color-accent)",
          muted: "var(--color-accent-muted)",
          hover: "var(--color-accent-hover)",
          foreground: "var(--color-accent-foreground)",
          gold: {
            DEFAULT: "var(--color-accent-gold)",
            hover: "var(--color-accent-gold-hover)",
            muted: "var(--color-accent-gold-muted)",
          },
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
        serif: ["var(--font-serif)"],
        display: ["var(--font-display)"],
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
        "slide-up": "slideUp var(--transition-normal) ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
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
