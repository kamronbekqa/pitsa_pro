/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#0f172a',
          sidebar: '#111827',
          card: '#1f2937',
          orange: {
            DEFAULT: '#ff7a00',
            hover: '#e56d00',
            light: 'rgba(255, 122, 0, 0.1)',
            glow: 'rgba(255, 122, 0, 0.25)',
          },
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 122, 0, 0.3)',
          text: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
          danger: '#ef4444',
          dangerHover: '#dc2626',
          success: '#22c55e',
          info: '#3b82f6',
        }
      },
      borderRadius: {
        'admin-sm': '8px',
        'admin-md': '12px',
        'admin-lg': '16px',
        'admin-xl': '24px',
      },
      boxShadow: {
        'admin-sm': '0 2px 8px rgba(0, 0, 0, 0.35)',
        'admin-md': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'admin-lg': '0 20px 40px rgba(0, 0, 0, 0.5)',
        'admin-glow': '0 0 15px rgba(255, 122, 0, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
