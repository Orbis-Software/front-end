/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Inter"],
        accent: ["IBM Plex Sans"],
      },
      colors: {
        orbis: {
          primary: "#EC691A",
          primaryHover: "#D85F17",

          page: "#FAFAFA",
          card: "#FFFFFF",

          border: "#E5E5E5",

          text: "#262626",
          muted: "#737373",

          tabActive: "#D4D4D4",
          tabInactive: "#F5F5F5",
        },
      },
      borderColor: {
        DEFAULT: "#E5E5E5",
      },
    },
  },
  plugins: [],
};
