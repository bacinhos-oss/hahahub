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
          black:   '#050505',
          dark:    '#121212',
          pink:    '#FF0266',
          magenta: '#FF0266',
          yellow:  '#FFDE03',
          cyan:    '#03DAC6',
          teal:    '#03DAC6',
        },
        spectrum: {
          pink:   '#EF4986',
          orange: '#FBA21B',
          blue:   '#199BBF',
          green:  '#16A34A',
          red:    '#D02024',
          teal:   '#19A596',
          purple: '#833998',
        },
        spectrumLight: {
          pink:   '#F48FAD',
          orange: '#FFC80E',
          blue:   '#42C7F4',
          green:  '#6EBE45',
          red:    '#F4644E',
          teal:   '#6EC6A5',
          purple: '#B84C9B',
        },
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
        },
      },
    },
  },
  plugins: [],
}
