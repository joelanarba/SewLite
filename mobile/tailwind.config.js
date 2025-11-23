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
      spacing: {
        'container': '16px',
        'card': '20px',
        'section': '24px',
        'element': '12px',
        'tight': '8px',
      },
      fontSize: {
        'display': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'heading': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'title': ['22px', { lineHeight: '30px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}
