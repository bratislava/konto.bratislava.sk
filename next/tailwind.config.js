const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    'pages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'frontend/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'media', // or 'class'
  theme: {
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      // TODO our typography system shouldn't have different bold and semibold - this needs clearing up, keeping just one variant of weight 600
      bold: '600',
    },

    // fontSize: {
    //   'btn-base': ['16px', '24px'],
    //   'btn-lg': ['20px', '32px'],

    //   'p-xs': ['12px', '18px'],
    //   'p-sm': ['14px', '20px'],
    //   'p-base': ['16px', '24px'],
    //   'p-md': ['20px', '28px'],

    //   'h-xs': ['16px', '24px'],
    //   'h-sm': ['18px', '26px'],
    //   'h-base': ['20px', '28px'],
    //   'h-md': ['24px', '32px'],
    //   'h-lg': ['28px', '36px'],
    //   'h-xl': ['32px', '40px'],
    //   'h-2xl': ['40px', '48px'],
    //   'h-3xl': ['56px', '64px'],
    // },
    extend: {
      spacing: {
        // 18: '4.5rem', // 72px
        // 66: '17.5rem', // 280px
        // 76: '19rem', // 304px
        // 88: '22rem', // 352px
        // 100: '25rem',
        // 104: '26rem', // 416px
        // 200: '50rem', // 800px
      },
    },
  },
  corePlugins: {
    container: false,
  },
  mode: 'jit',
}
