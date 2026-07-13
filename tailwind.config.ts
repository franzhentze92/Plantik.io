import type { Config } from "tailwindcss";

// Brand tokens for the current "Plantik" identity.
// Kept in one place so the brand can be swapped later without touching components.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: "#1F5E3B",
          moss: "#5F8F68",
          sage: "#EAF3E8",
          cream: "#F7F4ED",
          beige: "#E9E0D2",
          terracotta: "#B76E4D",
          carbon: "#202421",
        },
        // Vivid, tech-forward palette for the public marketing site.
        tech: {
          canopy: "#0A1F16",
          canopy2: "#0F2B1E",
          ink: "#0D1712",
          lime: "#A6FF3C",
          limedeep: "#7BDB1E",
          teal: "#17E9B0",
          violet: "#8B7CFF",
          mist: "#EAF6EF",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "Georgia", "serif"],
        grotesk: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(32, 36, 33, 0.06)",
        card: "0 4px 24px rgba(32, 36, 33, 0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.55", filter: "blur(60px)" },
          "50%": { opacity: "0.9", filter: "blur(72px)" },
        },
        "dash": {
          to: { strokeDashoffset: "0" },
        },
        "scan-line": {
          "0%": { top: "-8%", opacity: "0" },
          "12%": { opacity: "1" },
          "88%": { opacity: "1" },
          "100%": { top: "108%", opacity: "0" },
        },
        "reticle": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
        "ping-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        pulse2: "pulse2 1.6s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        glow: "glow 6s ease-in-out infinite",
        dash: "dash 2.4s ease-out forwards",
        "scan-line": "scan-line 3.6s ease-in-out infinite",
        reticle: "reticle 2.4s ease-in-out infinite",
        "ping-ring": "ping-ring 2.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
