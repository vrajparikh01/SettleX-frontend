/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        warning: "#FF99001A",
        page: "#FAFAFB",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(70.86deg, #3EDD59 12.88%, #CCF566 87.12%)",
        "light-gradient":
          "linear-gradient(70.86deg, rgba(62, 221, 89, 0.28) 12.88%, rgba(204, 245, 102, 0.28) 87.12%)",
        "red-gradient": "linear-gradient(90deg, #C30202 0%, #FF0000 100%)",
        "dot-bg": "url('../src/assets/images/DotBg-Light.png')",
        "open-bg": "url('../src/assets/images/BGOpenMarket.svg')",
        "light-gradientDark":
          "linear-gradient(70.86deg, #002D08 12.88%, #00550F 87.12%)",
      },
      fontFamily: {
        "openmarket-general-sans": ["General Sans"],
      },
      gridTemplateColumns: {
        13: "repeat(13, minmax(0, 1fr))",
        14: "repeat(14, minmax(0, 1fr))",
        17: "repeat(17, minmax(0, 1fr))",
      },
      colors: {
        baseWhite: "#fefefe",
        gray100: "#F9F9F9",
        gray200: "#F0F0F0",
        gray300: "#e8e8e8",
        gray400: "#B4B4B4",
        gray500: "#828282",
        primary100: "#D9F8DE",
        primary1000: "#3BC346",
        blue300: "#002A90",
        success100: "#b7f4de",
        success300: "#199E6D",
        error: "#FC5530",
        baseWhiteDark: "#000009",
        gray100Dark: "#1a1a1a",
        gray200Dark: "#333333",
        gray300Dark: "#4d4d4d",
        gray400Dark: "#666666",
        gray500Dark: "#808080",
        primary100Dark: "#092A0C",
        primary1000Dark: "#57DB63",
        blue300Dark: "#E4EAF9",
        success100Dark: "#199E6D",
        success300Dark: "#B7F4DE",
        "theme-green": "#29BD35",
        "theme-red": "#FF0000",
        "theme-warning": "#FF9900",
      },
      height: {
        authMedia: "calc(100vh - 10rem)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".slider-readonly::-webkit-slider-thumb": {
          opacity: "0", // Hide the thumb
          pointerEvents: "none", // Disable interactions
        },
        ".slider-readonly::-moz-range-thumb": {
          opacity: "0", // Hide the thumb
          pointerEvents: "none", // Disable interactions
        },
        ".slider-readonly": {
          pointerEvents: "none", // Disable interactions on the slider
        },
      });
    },
  ],
};
