import SelfTailwind from './tailwind-plugin/self.config';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        ficker: "ficker 1s linear infinite"
      },
      keyframes: {
        ficker: {
          "0%, 55%": { opacity: "1" },
          "75%, 100%": { opacity: "0" },
        }
      }
    },
  },
  plugins: [
    SelfTailwind
  ],
  corePlugins: {
    backgroundImage: false,
    fontSize: false,
    padding: false,
    margin: false
  }
};

