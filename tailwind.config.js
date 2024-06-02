const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    screens: {
      xxs: "360px",
      xs: "475px",
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        gray: {
          850: "hsl(217deg 32% 14%)",
          950: "hsl(222deg 42% 10%)",
        },
      },
      fontFamily: {
        sans: ["Aestetico", ...defaultTheme.fontFamily.sans],
        mono: ["Space Mono", ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        xxs: "0.625rem",
      },
      flex: {
        2: "2 2 0%",
      },
    },
  },
  variants: {
    extend: {
      display: ["dark"],
      backgroundColor: ["disabled"],
      cursor: ["disabled"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
