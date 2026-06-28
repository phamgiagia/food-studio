import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
          500: '#f97316', 600: '#ea580c', 700: '#c2410c',
        },
      },
    },
  },
  plugins: [],
};

export default config;
