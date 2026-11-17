import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#164E63", dark: "#0E3443", soft: "#E3F0F3" },
        secondary: { DEFAULT: "#5EEAD4", soft: "#D5FAF3" },
        ink: "#0B2F3B",
        paper: "#F4F9F9",
        line: "#CFE2E5",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        press: "0 4px 0 0 #0E3443",
        "press-sm": "0 2px 0 0 #0E3443",
      },
    },
  },
  plugins: [],
} satisfies Config;
