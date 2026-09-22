import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090b',
        surface: '#101012',
        card: '#151517',
        cardAlt: '#19191c',
        border: '#26262b',
        accent: '#ff6a00',
        accent2: '#ff8a3d',
        muted: '#8a8a92',
        mutedDim: '#5f5f66'
      },
      borderRadius: {
        xl2: '18px'
      },
      maxWidth: {
        app: '560px'
      }
    }
  },
  plugins: []
};

export default config;
