import Svgo from 'svgo'
import fs from 'fs-extra'
import cleanupIDs from 'svgo/plugins/cleanupIDs'
import removeAttrs from 'svgo/plugins/removeAttrs'
import removeDimensions from 'svgo/plugins/removeDimensions'
import removeViewBox from 'svgo/plugins/removeViewBox'
import inlineStyles from 'svgo/plugins/inlineStyles'
import inlineDefs from './plugins/inlineDefs'

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
    { inlineDefs }
  ]
}

function Svg (config) {
  if (config === null) {
    config = {
      plugins: defaultPlugins()
    }
  }
  this.svgOptimizer = new Svgo(config)
}

Svg.prototype.writeSVG = async function (path, content) {
  const result = await fs.writeFile(path, content, { flag: 'w' })
  return result
}

Svg.prototype.readSVG = async function (path) {
  const result = await fs.readFile(path)
  return result
}

Svg.prototype.optimizeSVG = async function (name, content) {
  cleanupIDs.params.prefix = `${name}-`
  const $data = await this.svgOptimizer.optimize(content)
  return $data.data
}

Svg.prototype.convertToSymbol = function (name, content) {
  const $data = content
    .replace('<svg', `<symbol id="i-${name}"`)
    .replace('</svg>', '</symbol>')
    .replace(/<defs>(.+)<\/defs>/, '')

  return $data
}

Svg.prototype.extractDefs = function (content) {
  const $data = content
    .match(/<defs>(.+)<\/defs>/)

  return $data ? $data[1] : ''
}

Svg.prototype.isSVGFile = function (file) {
  return file.match(/.*\.svg$/)
}

Svg.prototype.wrap = function (content, defs) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
        '<defs>\n' +
        defs +
        '\n</defs>\n' +
        content +
        '\n</svg>'
}

export default Svg
