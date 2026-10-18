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
        cinema: {
          page: "var(--surface-page)",
          panel: "var(--surface-panel)",
          elevated: "var(--surface-elevated)",
          subtle: "var(--text-subtle)",
          muted: "var(--text-muted)",
          primary: "var(--text-primary)",
          brand: "var(--brand-500)",
          "brand-soft": "var(--brand-300)",
          "brand-strong": "var(--brand-600)",
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
          hot: "var(--hot)",
        },
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        cinematic: "var(--shadow-cinematic)",
        "brand-glow": "var(--shadow-brand)",
      },
      fontFamily: {
        sans: ["PingFang SC", "Microsoft YaHei", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
