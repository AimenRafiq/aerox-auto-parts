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
        brand: {
          ink: "#202522",
          navy: "#202522",
          "navy-dark": "#151916",
          accent: "#A85D32",
          "accent-hover": "#884624",
          "accent-light": "#F4E8DF",
          bg: "#F5F3EF",
          surface: "#FFFFFF",
          muted: "#71766F",
          border: "#E5E1D9",
          "border-dark": "#CFC9BF",
          success: "#247A52",
          "success-light": "#E9F5EF",
          warning: "#A96812",
          "warning-light": "#FEF7EC",
          error: "#B42318",
          "error-light": "#FDF2F1",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "0.625rem",
        sm: "0.375rem",
        md: "0.625rem",
        lg: "0.875rem",
      },
      maxWidth: {
        store: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
