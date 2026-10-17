/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          deep: '#183D32',
          DEFAULT: '#2F6B50',
          light: '#3D8565',
        },
        sage: {
          DEFAULT: '#A8BBA0',
          light: '#C4D4BF',
          dark: '#879C7E',
        },
        warm: {
          offwhite: '#F6F5F0',
          surface: '#FAF9F5',
        },
        charcoal: {
          DEFAULT: '#252B28',
          light: '#363D39',
        },
        muted: {
          gray: '#7B847E',
          light: '#A4ADA7',
        },
        soft: {
          amber: '#E8B65B',
          'amber-light': '#FDF4E3',
          red: '#D96C5F',
          'red-light': '#FBECE9',
          green: '#2F6B50',
          'green-light': '#E9F2ED',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(24, 61, 50, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'soft-md': '0 4px 18px rgba(24, 61, 50, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 30px rgba(24, 61, 50, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
