/**
 * @file tailwind.config.js
 * @description Tailwind CSS v4 configuration for ListingBoost Pro
 * @modified 2025-07-22
 * @note Updated to Tailwind CSS v4 syntax for compatibility
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom animations for glassmorphic design
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce-gentle 2s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-gentle': {
          '0%, 100%': {
            transform: 'translateY(0)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-5px)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      // Custom colors for glassmorphic design
      colors: {
        glass: {
          50: 'rgba(255, 255, 255, 0.95)',
          100: 'rgba(255, 255, 255, 0.9)',
          200: 'rgba(255, 255, 255, 0.8)',
          300: 'rgba(255, 255, 255, 0.7)',
          400: 'rgba(255, 255, 255, 0.6)',
          500: 'rgba(255, 255, 255, 0.5)',
          600: 'rgba(255, 255, 255, 0.4)',
          700: 'rgba(255, 255, 255, 0.3)',
          800: 'rgba(255, 255, 255, 0.2)',
          900: 'rgba(255, 255, 255, 0.1)',
        }
      },
      // Custom backdrop blur values
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}