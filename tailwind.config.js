/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        mist: '#f4f6f8',
        brand: '#0d9488',
        signal: '#f97316'
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        panel: '0 18px 40px -28px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
};
