/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        "primary-200": '#FFC107',
        "primary-100": '#FFECB3',
        "secondary-200": '#4CAF50',
        "secondary-100": '#C8E6C9'
      },
    },
  },
  plugins: [],
}

