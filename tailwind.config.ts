import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        gov: {
          navy: "#0B2545",
          navyDark: "#05162b",
          navyLight: "#133E87",
          saffron: "#C05621",
          saffronLight: "#D97706",
          green: "#1A3D2F",
          greenLight: "#2D6A4F",
          ashoka: "#000080",
          gold: "#B45309",
        },
        forest: {
          DEFAULT: "#1A3D2F",
          900: "#0F261D",
          800: "#1A3D2F",
          700: "#245340",
          600: "#2D6A4F",
          500: "#40916C",
          100: "#D8F3DC",
          50: "#EBF8EE",
        },
        leaf: {
          DEFAULT: "#2D6A4F",
          light: "#52B788",
          dark: "#1B4332",
        },
        earth: {
          DEFAULT: "#8D7B68",
          50: "#FDFBF9",
          100: "#F7F3EE",
          200: "#EFE8DF",
          300: "#DDD2C3",
          400: "#C4B29E",
          500: "#8D7B68",
          600: "#706050",
          700: "#55483B",
          800: "#3D3329",
          900: "#272019",
        },
        cream: {
          DEFAULT: "#FAF7F2",
          50: "#FCFAF7",
          100: "#F7F3EB",
          200: "#EFE8DA",
          300: "#E4D9C3",
        },
        terracotta: {
          DEFAULT: "#C05621",
          light: "#DD6B20",
          dark: "#9C4221",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.05)" },
        },
        "badge-unlock": {
          "0%": { transform: "scale(0) rotate(-45deg)", opacity: "0" },
          "70%": { transform: "scale(1.15) rotate(5deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "badge-unlock": "badge-unlock 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "float": "float-gentle 4s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
