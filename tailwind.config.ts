import type { Config } from "tailwindcss";

// White backgrounds and the grey scales resolve through optional CSS variables
// (RGB channels) so a site theme can remap them — e.g. the Halloween theme
// inverts light and dark. Unset, each falls back to Tailwind's stock value.
// Black, text-white and the darkest grey backgrounds are left alone: they're
// image scrims, modal backdrops and dark chips that should stay dark.
const themable = (name: string, rgb: string) => `rgb(var(--tw-${name}, ${rgb}) / <alpha-value>)`;

const NEUTRAL: Record<string, string> = {
  50: "250 250 250", 100: "245 245 245", 200: "229 229 229", 300: "212 212 212",
  400: "163 163 163", 500: "115 115 115", 600: "82 82 82", 700: "64 64 64",
  800: "38 38 38", 900: "23 23 23", 950: "10 10 10",
};

const SLATE: Record<string, string> = {
  50: "248 250 252", 100: "241 245 249", 200: "226 232 240", 300: "203 213 225",
  400: "148 163 184", 500: "100 116 139", 600: "71 85 105", 700: "51 65 85",
  800: "30 41 59", 900: "15 23 42", 950: "2 6 23",
};

// Both scales share one set of overrides (--tw-gray-*), keyed by shade.
const greyScale = (stock: Record<string, string>, keepFrom = Infinity) =>
  Object.fromEntries(
    Object.entries(stock).map(([shade, rgb]) => [
      shade,
      Number(shade) >= keepFrom ? `rgb(${rgb} / <alpha-value>)` : themable(`gray-${shade}`, rgb),
    ]),
  );

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: greyScale(NEUTRAL),
        slate: greyScale(SLATE),
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
      backgroundColor: {
        white: themable("white", "255 255 255"),
        neutral: greyScale(NEUTRAL, 800),
        slate: greyScale(SLATE, 800),
      },
      gradientColorStops: {
        neutral: greyScale(NEUTRAL, 800),
        slate: greyScale(SLATE, 800),
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
      animation: {
        "fade-in": "fadeIn var(--transition-normal) ease-out forwards",
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
        "float": "float 6s ease-in-out infinite",
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
          "50%": { boxShadow: "0 0 25px var(--color-accent), 0 0 10px rgba(200, 35, 51, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
