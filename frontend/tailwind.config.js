/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a04100',
          container: '#f36f21',
          on: '#ffffff',
          'on-container': '#531e00',
          fixed: '#ffdbcc',
          'fixed-dim': '#ffb693',
        },
        'inverse-primary': '#ffb693',
        secondary: {
          DEFAULT: '#565e74',
          on: '#ffffff',
          container: '#dae2fd',
          'on-container': '#5c647a',
          fixed: '#dae2fd',
          'fixed-dim': '#bec6e0',
        },
        tertiary: {
          DEFAULT: '#494bd6',
          on: '#ffffff',
          container: '#878aff',
          'on-container': '#1000a4',
          fixed: '#e1e0ff',
          'fixed-dim': '#c0c1ff',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          bright: '#f8f9ff',
          'container-lowest': '#ffffff',
          'container-low': '#eff4ff',
          container: '#e5eeff',
          'container-high': '#dce9ff',
          'container-highest': '#d3e4fe',
          variant: '#d3e4fe',
          tint: '#a04100',
        },
        'on-surface': '#0b1c30',
        'on-surface-variant': '#584238',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        outline: '#8c7166',
        'outline-variant': '#e0c0b2',
        background: '#f8f9ff',
        'on-background': '#0b1c30',
        'neutral-base': '#f8fafc',
        'neutral-surface': '#ffffff',
        'neutral-border': '#e2e8f0',
        'neutral-divider': '#f1f5f9',
        error: {
          DEFAULT: '#ba1a1a',
          on: '#ffffff',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
        brand: {
          orange: '#f36f21',
          navy: '#0f172a',
        },
        status: {
          active: {
            bg: '#e6f4ea',
            text: '#137333',
          },
          disqualified: {
            bg: '#fce8e6',
            text: '#c5221f',
          },
          pending: {
            bg: '#fef7e0',
            text: '#b06000',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '1', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        gutter: '1.5rem',
        'margin-mobile': '1rem',
        'margin-desktop': '2.5rem',
      },
      boxShadow: {
        floating: '0px 10px 15px -3px rgba(0,0,0,0.05), 0px 4px 6px -4px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
