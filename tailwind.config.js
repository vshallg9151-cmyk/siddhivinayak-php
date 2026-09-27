/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Deep navy / dark blue as primary brand color
          navy: '#0B192C',
          navyDark: '#060D17',
          navyLight: '#1B2A4A',
          navyMuted: '#24344D',

          // Saffron / warm amber as accent color
          saffron: '#F59E0B',
          saffronHover: '#D97706',
          saffronLight: '#FEF3C7',
          saffronDark: '#B45309',
          orange: '#EA580C',

          // Neutral backgrounds & card surfaces
          bgLight: '#F8FAFC',
          cardBg: '#FFFFFF',
          neutralBg: '#F1F5F9',
          borderLight: '#E2E8F0',

          // Typography colors (Dark charcoal)
          textDark: '#0F172A',
          charcoal: '#1E293B',
          slateGray: '#475569',
          muted: '#64748B',

          // Legacy aliases for backward compatibility with existing components
          blue: '#1E3A8A',
          blueHover: '#172554',
          gold: '#F59E0B',
          goldLight: '#FEF3C7',
          goldHover: '#D97706',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(11, 25, 44, 0.08), 0 0 1px 1px rgba(11, 25, 44, 0.04)',
        'luxury-hover': '0 20px 40px -15px rgba(11, 25, 44, 0.14), 0 0 1px 1px rgba(245, 158, 11, 0.25)',
        'luxury-saffron': '0 10px 25px -5px rgba(245, 158, 11, 0.35)',
        'luxury-gold': '0 10px 25px -5px rgba(245, 158, 11, 0.35)',
        'glass': '0 8px 32px 0 rgba(11, 25, 44, 0.35)',
        'pill': '0 12px 35px -8px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #0B192C 0%, #1B2A4A 100%)',
        'saffron-gradient': 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'blue-gradient': 'linear-gradient(135deg, #0B192C 0%, #1E3A8A 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0B192C 0%, #060D17 100%)',
        'subtle-light': 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
      }
    },
  },
  plugins: [],
}
