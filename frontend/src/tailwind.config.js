/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Monorepo ise shared bileşenler için örnek:
    '../../packages/*/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: { extend: {} },
  plugins: [],
};