/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow:  '#FFDE03',
          pink:    '#FF0266',
          cyan:    '#03DAC6',
          black:   '#050505',
          surface: '#121212',
          border:  '#2E2E2E',
        }
      },
      fontFamily: {
        sans:    ['Space Grotesk', 'sans-serif'],
        display: ['Bungee', 'cursive'],
        funky:   ['Bowlby One SC', 'cursive'],
        syne:    ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'neo-magenta': '4px 4px 0px 0px #FF0266',
        'neo-cyan':    '4px 4px 0px 0px #03DAC6',
        'neo-yellow':  '4px 4px 0px 0px #FFDE03',
        'neo-white':   '8px 8px 0px 0px #FFFFFF',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    }
  },
  plugins: [],
}
