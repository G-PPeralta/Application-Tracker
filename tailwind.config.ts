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
        status: {
          applied: "#EAB308",
          interview: "#3B82F6",
          rejected: "#EF4444",
          offer: "#22C55E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
