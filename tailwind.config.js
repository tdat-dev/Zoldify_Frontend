/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./resources/**/*.php", "./public/**/*.php", "./app/**/*.php"],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
};
