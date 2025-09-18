// Use CommonJS export so Next.js (without type: module) can load PostCSS config correctly
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
