/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        peach: {
          50: '#FDF9F4',
          100: '#FBF0E5',
          200: '#F5DCC6',
          300: '#EEC9A7',
          400: '#E8A87C',
          500: '#D4956A',
          600: '#C07D52',
          700: '#9A6340',
          800: '#7A4E32',
          900: '#5A3A24',
        },
        cream: '#FDF9F4',
        warmgray: {
          100: '#F5F0EB',
          200: '#EDE5DB',
          300: '#D4C9BC',
          400: '#B8A99A',
          500: '#9A8A7A',
          600: '#7A6E62',
          700: '#5A4E42',
          800: '#4A3E34',
          900: '#3A2E24',
        },
        sage: {
          100: '#E8EDE4',
          200: '#D1DEC9',
          300: '#B8C4A0',
          400: '#8BA888',
          500: '#6E8E6A',
        },
      },
      fontFamily: {
        display: ['Quicksand', 'Noto Sans TC', 'sans-serif'],
        body: ['Noto Sans TC', 'sans-serif'],
      },
      borderRadius: {
        'bento': '24px',
      },
    },
  },
  plugins: [],
};
