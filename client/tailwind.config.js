/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#FFFDF7',
            100: '#FFF9E5',
            200: '#FFF0B3',
            300: '#FFE680',
            400: '#FFD94D',
            500: '#FFC700',
            600: '#E6B300',
            700: '#B38A00',
            800: '#806300',
            900: '#4D3B00',
          },
          secondary: {
            50: '#F5F5F5',
            100: '#E6E6E6',
            200: '#CCCCCC',
            300: '#B3B3B3',
            400: '#999999',
            500: '#666666',
            600: '#4D4D4D',
            700: '#333333',
            800: '#1A1A1A',
            900: '#000000',
          },
        },
      },
    },
    plugins: [],
  }