/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#3C4EB0',
        secondary: '#D4FFF3',
        accent: '#F2C76E',
        background: '#FDFDFD',
        surface: '#FFFFFF',
        text: {
          primary: '#2C2C2C',
          secondary: '#666666',
          light: '#999999',
        },
        border: '#E5E5E5',
      },
    },
  },
  plugins: [],
}
