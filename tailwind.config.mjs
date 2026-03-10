/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        parasBlue: "#019ADC",
        parasPink: "#E774AB",
        parasTeal: "#61B6BF",
        parasYellow: "#F6E274",
        parasWhite: "#FAFAFA",
        parasGray: "#D5E0E5",
      },
    },
  },
  plugins: [],
}

