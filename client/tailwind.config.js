/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5f6fff',
          50: '#f0f4ff',
          100: '#e5edff',
          200: '#d0ddff',
          300: '#afc4ff',
          400: '#89a1ff',
          500: '#667dff',
          600: '#5f6fff',
          700: '#4f5fe6',
          800: '#3f4dcc',
          900: '#2f3b99',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
