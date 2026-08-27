import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
    "./index.html",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        satya: {
          primary: "#475853",
          dark: "#283733",
          gold: "#DBCEB1",
          ivory: "#FDF6F0",
          cream: "#FCF5EE",
          sage: "#71807A",
          white: "#FFFFFF",
        },
        brand: {
          DEFAULT: "#0FA891",
          hover: "#0D8F7B",
          subtle: "rgba(15, 168, 145, 0.08)",
        },
        "brand-hover": "#0D8F7B",
        "brand-subtle": "rgba(15, 168, 145, 0.08)",
        "text-primary": "#0F172A",
        "text-secondary": "#334155",
        "text-tertiary": "#64748B",
        "bg-primary": "#FFFFFF",
        "bg-secondary": "#F8FAFC",
        "border-subtle": "#E2E8F0",
        "verdict-pass": "#059669",
        "verdict-review": "#D97706",
        "verdict-fail": "#DC2626",
        status: {
          pass: "#2F7D5A",
          review: "#C58A32",
          fail: "#B84A4A",
          info: "#527A8C",
          processing: "#64748B",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Roboto Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
