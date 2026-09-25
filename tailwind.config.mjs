import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2b4c3b',
        secondary: '#f5f3e9',
        whatsapp: '#25d366',
      },
      fontFamily: {
        heading: ['Italiana', ...defaultTheme.fontFamily.serif],
        body: ['Raleway', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
