/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terra: {
          50:  '#fdf3ed',
          100: '#fae3d0',
          200: '#f4c4a0',
          300: '#eda070',
          400: '#e57d45',
          500: '#c4651a',
          600: '#a85415',
          700: '#8c440f',
          800: '#70360b',
          900: '#572a08',
        },
        forest: {
          50:  '#eef5e6',
          100: '#d8eac4',
          200: '#b4d68e',
          300: '#8ec158',
          400: '#6aab2e',
          500: '#3d6b1f',
          600: '#2d5016',
          700: '#1f3a0f',
          800: '#142709',
          900: '#0a1604',
        },
        cream:  '#faf7f2',
        ivory:  '#f5f0e8',
        sand: {
          100: '#f5ede0',
          200: '#e8d8c0',
          300: '#d4c5a9',
          400: '#c0a880',
          500: '#a88b5a',
        },
        'warm-brown': '#5c3d2e',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
