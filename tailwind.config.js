/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%": { transform: "rotate(0deg)" },
          "5%": { transform: "rotate(0deg)" },
          "10%": { transform: "rotate(2.5deg)" },
          "20%": { transform: "rotate(-2.5deg)" },
          "25%": { transform: "rotate(0)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
      animation: {
        "wiggle-once": "wiggle 2s linear",
      },
    },
  },
  plugins: [],
};
