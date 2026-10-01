/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js}', './scripts/lib/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Orange d’accent du site : même teinte que le soulignement et les traits des titres (amber-500).
        accent: '#f59e0b',
        primary: {
          DEFAULT: '#206dba',
          50: '#e5f0fb',
          100: '#c9e0f7',
          200: '#9fc9f0',
          300: '#74b2e8',
          400: '#4b99dd',
          500: '#206dba',
          600: '#1c60a5',
          700: '#174f88',
          800: '#123f6b',
          900: '#0d2f4f',
          950: '#081f35',
        },
      },
    },
  },
};
