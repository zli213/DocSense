/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  important: true,

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        0.6: "0.150rem",
      },
      colors: {
        "primary-background": "#F8F7F6",
        "secondary-background": "#F3F3F3",
        "tertiary-background": "#ECECEC",
        "primary-color": "#12666C",
        "secondary-color": "#57C3BA",
        "tertiary-color": "#89D3B9",
        "error-red": "#EC4646",
        "warning-yellow": "#F1E046",
        "cross-color": "#58c3b8",
        // Dark mode color
        "dark-primary-background": "#36434e",
        "dark-secondary-background": "#5a6771",
        "dark-tertiary-background": "#1d2f3e",
        "dark-primary-color": "#0A9396", //not use
        "dark-secondary-color": "#94D2BD", //not use
        "dark-tertiary-color": "#E9D8A6", //not use
        "dark-error-red": "#EF476F", //not use
        "dark-warning-yellow": "#FFD166", //not use
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      typography: {
        DEFAULT: {
          css: {
            ul: {
              listStyleType: "disc",
              paddingLeft: "1rem",
              paddingRight: "1rem",
            },
            li: {
              marginBottom: "0.5rem",
            },
          },
        },
      },
      transitionProperty: {
        spacing: "margin, padding",
        opacity: "opacity",
        transform: "transform",
      },
      transitionDuration: {
        300: "300ms", // Duration of the animation
        500: "500ms",
      },
    },
  },
  plugins: [
    require("daisyui"),
    // require("@tailwindcss/line-clamp"),
    require("tailwindcss-textshadow"),
    require("@tailwindcss/typography"),
  ],
};
