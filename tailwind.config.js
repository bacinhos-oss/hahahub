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
          surface: '#141414',
          pink:    '#EF4986',
          magenta: '#EF4986',
          yellow:  '#FFC80E',
          cyan:    '#19A596',
          teal:    '#19A596',
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
        'neo-magenta': '4px 4px 0px 0px #EF4986',
        'neo-cyan':    '4px 4px 0px 0px #19A596',
        'neo-yellow':  '4px 4px 0px 0px #FFC80E',
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
