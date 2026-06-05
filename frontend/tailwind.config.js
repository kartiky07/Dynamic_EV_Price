/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#030712',
          900: '#0b0f19',
          800: '#111827',
          700: '#1f2937',
          600: '#374151',
          500: '#4b5563',
        },
        electric: {
          500: '#0ea5e9',
          600: '#0284c7',
          400: '#38bdf8',
        },
        neon: {
          500: '#10b981',
          600: '#059669',
          400: '#34d399',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(14, 165, 233, 0.15)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
