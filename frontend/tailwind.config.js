/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          50:  '#1A1A2E',
          100: '#16162A',
          200: '#121226',
          300: '#0F0F22',
          400: '#0C0C1E',
          500: '#0A0A1A',
          600: '#080816',
          700: '#060612',
          800: '#04040E',
          900: '#02020A',
          950: '#010106',
        },
        accent: {
          50:  '#FFF1F1',
          100: '#FFE0E0',
          200: '#FFC5C5',
          300: '#FF9C9C',
          400: '#FF6464',
          500: '#FF3333',
          600: '#E81414',
          700: '#C40D0D',
          800: '#A20F0F',
          900: '#861414',
          950: '#490404',
        },
        neon: {
          red: '#FF3333',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          amber: '#F59E0B',
          green: '#10B981',
          pink: '#EC4899',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'typing': 'typing 1.4s infinite',
        'glow-border': 'glowBorder 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 51, 51, 0.4)' },
          '50%': { boxShadow: '0 0 20px 6px rgba(255, 51, 51, 0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        typing: {
          '0%, 100%': { opacity: '0.2', transform: 'translateY(0)' },
          '50%': { opacity: '1', transform: 'translateY(-3px)' },
        },
        glowBorder: {
          '0%, 100%': { borderColor: 'rgba(255,51,51,0.3)' },
          '50%': { borderColor: 'rgba(255,51,51,0.6)' },
        },
      },
      maxWidth: {
        'mobile': '430px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
