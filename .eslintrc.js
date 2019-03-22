module.exports = {
  root: true,
    parserOptions: {
      parser: 'babel-eslint',
      sourceType: 'module'
    },
    extends: [
      '@nuxtjs'
    ],
    globals: {
      page: true,
      browser: true,
      context: true,
      jestPuppeteer: true,
    },
}