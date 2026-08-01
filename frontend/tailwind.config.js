/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: { 850: '#1e293b', 900: '#0f172a', 950: '#020617' },
        cyan: { 450: '#22d3ee' },
        glass: 'rgba(255,255,255,0.06)'
      },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' }
    }
  },
  plugins: []
};
