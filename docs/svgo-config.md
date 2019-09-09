# How to customize SVGO config

```js
// file: nuxt.config.js
const path = require('path')
const cleanupIDs = require('svgo/plugins/cleanupIDs')
const removeAttrs = require('svgo/plugins/removeAttrs')
const removeDimensions = require('svgo/plugins/removeDimensions')
const removeViewBox = require('svgo/plugins/removeViewBox')
const inlineStyles = require('svgo/plugins/inlineStyles')
const inlineDefs = require('@nuxtjs/svg-sprite/lib/plugins/inlineDefs.js')

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
    inlineStyles,
    { inlineDefs } // NOTE: it's important to pass custom plugins as object.
  ]
}
module.exports = {
  head: {
    title: 'Custom Config',
  },

  modules: [
    '@nuxtjs/svg-sprite'
  ],
  svgSprite: {
    // pass costum config 
    svgoConfig () {
      return {
        plugins: defaultPlugins()
      }
    }
  }
}
```