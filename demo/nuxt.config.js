const path = require('path')
const cleanupIDs = require('svgo/plugins/cleanupIDs')
const removeAttrs = require('svgo/plugins/removeAttrs')
const removeDimensions = require('svgo/plugins/removeDimensions')
const removeViewBox = require('svgo/plugins/removeViewBox')
const inlineStyles = require('svgo/plugins/inlineStyles')

function defaultPlugins () {
  // Enable removeAttrs plugin
  // Remove id attribute to prevent conflict with our id
  removeAttrs.active = true
  removeAttrs.params.attrs = 'svg:id'

  // Disable removeViewBox plugin and enable removeDimensions
  // Keep viewBox and remove width & height attribute
  removeViewBox.active = false
  removeDimensions.active = true

  // Make all styles inline
  // By definition, a defs sprite is not usable as a CSS sprite
  inlineStyles.active = true
  inlineStyles.params.onlyMatchedOnce = false

  return [
    removeDimensions,
    cleanupIDs,
    removeAttrs,
    removeViewBox,
    inlineStyles
  ]
}
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
  ],
  svgSprite: {
    svgoConfig () {
      return {
        plugins: defaultPlugins()
      }
    }
  }
}
