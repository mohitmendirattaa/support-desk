/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Yeh paths bahut zaroori hain. Ensure karein ki yeh aapki React files ko point kar rahe hain.
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
