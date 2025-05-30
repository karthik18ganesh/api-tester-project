/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom animations for Phase 4 optimizations
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'ping-soft': 'pingSoft 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      
      // Custom keyframes
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        bounceSoft: {
          '0%, 100%': { 
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        pingSoft: {
          '75%, 100%': {
            transform: 'scale(1.05)',
            opacity: '0',
          },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      
      // Custom colors for performance indicators
      colors: {
        performance: {
          excellent: '#22c55e',
          good: '#84cc16',
          needs_improvement: '#f59e0b',
          poor: '#ef4444',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          pending: '#6b7280',
        },
      },
      
      // Custom spacing for better component layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom z-index layers
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // Custom transition timings
      transitionDuration: {
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      
      // Custom backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      
      // Custom box shadows for depth
      boxShadow: {
        'soft': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'strong': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.15)',
      },
      
      // Custom grid template columns for complex layouts
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(200px, 1fr))',
      },
      
      // Custom font families
      fontFamily: {
        'mono': ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      
      // Custom line heights for code blocks
      lineHeight: {
        'relaxed': '1.75',
        'loose': '2',
      },
    },
  },
  plugins: [
    // Add any custom plugins here if needed
    function({ addUtilities }) {
      const newUtilities = {
        // Custom utilities for performance indicators
        '.performance-indicator': {
          '@apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium': {},
        },
        '.performance-excellent': {
          '@apply bg-green-100 text-green-800': {},
        },
        '.performance-good': {
          '@apply bg-yellow-100 text-yellow-800': {},
        },
        '.performance-needs-improvement': {
          '@apply bg-orange-100 text-orange-800': {},
        },
        '.performance-poor': {
          '@apply bg-red-100 text-red-800': {},
        },
        
        // Custom utilities for skeleton loading
        '.skeleton': {
          '@apply bg-gray-200 animate-pulse rounded': {},
        },
        '.skeleton-shimmer': {
          '@apply relative overflow-hidden bg-gray-200 rounded': {},
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
            transform: 'translateX(-100%)',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
            animation: 'shimmer 1.5s linear infinite',
          },
        },
        
        // Custom utilities for smooth scrolling
        '.scroll-smooth-custom': {
          'scroll-behavior': 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
        
        // Custom utilities for virtual scrolling containers
        '.virtual-container': {
          '@apply relative overflow-auto': {},
          'scrollbar-width': 'thin',
          'scrollbar-color': '#e5e7eb #f9fafb',
        },
        '.virtual-container::-webkit-scrollbar': {
          width: '8px',
        },
        '.virtual-container::-webkit-scrollbar-track': {
          background: '#f9fafb',
        },
        '.virtual-container::-webkit-scrollbar-thumb': {
          'background-color': '#e5e7eb',
          'border-radius': '4px',
        },
        '.virtual-container::-webkit-scrollbar-thumb:hover': {
          'background-color': '#d1d5db',
        },
      }
      
      addUtilities(newUtilities);
    },
  ],
}
