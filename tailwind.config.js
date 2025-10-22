/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#4f46e5',
        'secondary': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444',
        'light-bg': '#f8fafc',
        'dark-bg': '#0f172a',
        'card': '#ffffff',
        'card-dark': '#1e293b',
        'text-primary': '#111827',
        'text-secondary': '#6b7280',
      },
    },
  },
  plugins: [],
}
