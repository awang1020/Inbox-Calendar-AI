import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))"
      },
      borderRadius: {
        xl: "1rem"
      },
      boxShadow: {
        card: "0 20px 45px -20px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
