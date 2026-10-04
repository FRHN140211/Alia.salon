module.exports = {
  content: ['./index.html', './script.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#FAF9F5',
        'surface-alt': '#F4F2EC',
        'surface-card': '#FFFFFF',
        'surface-container': '#EFECE3',
        'surface-tint': '#E8E4D8',
        primary: '#141714',
        'forest-deep': '#1D382B',
        'forest-tint': '#2A4D3B',
        'forest-soft': '#E8F0EA',
        'antique-gold': '#B8933E',
        'gold-deep': '#9C7A28',
        'gold-light': '#F7F2E4',
        'gold-subtle': 'rgba(184, 147, 62, 0.22)',
        'text-main': '#141714',
        'text-body': '#3A403C',
        'text-muted': '#6E746F',
        'border-subtle': '#E5E0D5',
        'border-gold': 'rgba(184, 147, 62, 0.35)'
      },
      fontFamily: {
        serif: ['EB Garamond', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Manrope', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        luxe: '0 12px 30px -8px rgba(26, 35, 28, 0.07)',
        'luxe-hover': '0 20px 40px -10px rgba(26, 35, 28, 0.12)',
        'gold-subtle': '0 6px 20px -3px rgba(184, 147, 62, 0.18)',
        pill: '0 4px 16px -2px rgba(184, 147, 62, 0.22)'
      }
    }
  },
  plugins: []
};
