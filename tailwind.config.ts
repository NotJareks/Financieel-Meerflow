import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#11110f",
        foreground: "#f3f0e8",
        surface: "#191916",
        "surface-light": "#22221e",
        "surface-lighter": "#292923",
        card: {
          DEFAULT: "#191916",
          foreground: "#f3f0e8",
        },
        popover: {
          DEFAULT: "#1e1e1a",
          foreground: "#f3f0e8",
        },
        primary: {
          DEFAULT: "#c7b28a",
          foreground: "#171612",
        },
        secondary: {
          DEFAULT: "#22221e",
          foreground: "#f3f0e8",
        },
        muted: {
          DEFAULT: "#23231f",
          foreground: "#a8a59c",
        },
        accent: {
          DEFAULT: "#c7b28a",
          light: "#e1d2b3",
          foreground: "#171612",
        },
        destructive: {
          DEFAULT: "#b87878",
          foreground: "#f3f0e8",
        },
        danger: {
          DEFAULT: "#b87878",
          foreground: "#f3f0e8",
        },
        success: "#9eae91",
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.1)",
        ring: "#c7b28a",
      },
      borderRadius: {
        lg: "18px",
        md: "12px",
        sm: "8px",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      keyframes: {
        "page-fade": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "page-fade": "page-fade 0.35s ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
