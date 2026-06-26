/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c3aed',
          hover: '#8b5cf6',
        },
        background: '#e0e5ec',
        cards: '#e0e5ec',
        borders: '#d1d9e6',
        text: {
          DEFAULT: '#334155',
          secondary: '#64748B',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        'neu-flat': '-6px -6px 12px #ffffff, 6px 6px 12px #b8c5d6',
        'neu-pressed': 'inset -4px -4px 8px #ffffff, inset 4px 4px 8px #b8c5d6',
        'neu-sm': '-3px -3px 6px #ffffff, 3px 3px 6px #b8c5d6',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
}
