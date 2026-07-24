import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#050608",
        graphite: "#111317",
        chrome: "#d9e2e8",
        signal: "#6fffe9",
        pulse: "#ff7ab6",
        ember: "#f8c66d",
        leaf: "#78f2b3"
      },
      boxShadow: {
        glow: "0 0 40px rgba(111, 255, 233, 0.24)",
        gold: "0 0 36px rgba(248, 198, 109, 0.2)"
      },
      backgroundImage: {
        "glass-line":
          "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))"
      }
    }
  },
  plugins: []
} satisfies Config;
