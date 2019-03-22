const path = require('path')

module.exports = {
  srcDir: path.resolve(__dirname),
  rootDir: path.resolve(__dirname, '..'),
  head: {
    title: 'Nuxt.js SVG Sprite Module',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },

  modules: [
    '../lib/module.js'
  ]
}
