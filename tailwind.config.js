/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/component/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        secondary: "#000",
        error: "#F44336",
        warning: "#FFC107",
        primary: "#3941e3",
      },
      backgroundImage: {
        "soft-primary-gradient":
          "linear-gradient(to right, rgba(169, 123, 80, 0.1), #ffffff)",
        "form-header-gradient":
          "linear-gradient(to right, rgba(57, 65, 227, 0.5), rgba(229, 231, 235, 0.5))",
      },
      fontFamily: {
        gilroy: ["Manrope", "sans-serif"], // using Manrope as a free alternative
      },
    },
  },
  plugins: [],
};

