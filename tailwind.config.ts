import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Gameshow theme colors
        primary: {
          50: '#fef7ff',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
        },
        gameshow: {
          gold: '#ffd700',
          electric: '#00ffff',
          hot: '#ff1493',
          neon: '#39ff14',
          purple: '#8a2be2',
        },
        star: {
          filled: '#fbbf24',
          empty: '#d1d5db',
        }
      },
      fontFamily: {
        gameshow: ['Fredoka One', 'cursive'],
      },
      animation: {
        'bounce-in': 'bounceIn 0.6s ease-out',
        'star-glow': 'starGlow 1s ease-in-out infinite alternate',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        starGlow: {
          '0%': { filter: 'drop-shadow(0 0 5px #fbbf24)' },
          '100%': { filter: 'drop-shadow(0 0 20px #fbbf24)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
