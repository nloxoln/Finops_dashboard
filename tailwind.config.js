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
          DEFAULT: '#5B4FFF',
          light: '#E6E4FF',
        },
        blue: {
          DEFAULT: '#4A90E2',
        },
        green: {
          DEFAULT: '#50E3C2',
        },
        orange: {
          DEFAULT: '#F5A623',
        },
        pink: {
          DEFAULT: '#FF6B9D',
        },
        gray: {
          50: '#F7F7F7',
          100: '#E0E0E0',
          900: '#333333',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
