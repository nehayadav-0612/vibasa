import type { Config } from 'tailwindcss';

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: '#1E7F5C',
        success: '#2ECC71',
        warning: '#F39C12',
        error: '#E74C3C',
        background: '#F8F9FA',
        text: '#1A1A1A',
        border: '#E0E0E0',
      },
    },
  },
  plugins: [],
};

export default config;
