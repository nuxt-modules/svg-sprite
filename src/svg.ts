import { join } from 'path'
import Svgo from 'svgo'
import fs from 'fs-extra'
import cleanupIDs from 'svgo/plugins/cleanupIDs'
import removeAttrs from 'svgo/plugins/removeAttrs'
import removeDimensions from 'svgo/plugins/removeDimensions'
import removeViewBox from 'svgo/plugins/removeViewBox'
import inlineStyles from 'svgo/plugins/inlineStyles'
import Hookable from 'hookable'
import { SVGSprite, SVGSymbol } from './types'

import inlineDefs from './svgo-plugins/inlineDefs'
import { convertToSymbol, extractDefs, generateName, isSVGFile, readSVG, wrap, writeSVG } from './utils'

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

export default class SVGManager extends Hookable {
  sprites: { [key: string]: SVGSprite } = {}

  input: string

  output: string

  defaultSprite: string

  private svgo: Svgo

  constructor ({ svgoConfig, input, output, defaultSprite }) {
    super()

    if (!svgoConfig) { svgoConfig = { plugins: defaultPlugins() } }
    if (typeof svgoConfig === 'function') { svgoConfig = svgoConfig() }
    this.svgo = new Svgo(svgoConfig)

    this.input = input
    this.output = output
    this.defaultSprite = defaultSprite
  }

  async generateSprites () {
    const files = await fs.readdir(this.input)
    let hasDefaultSprite = false
    for (const file of files) {
      const source = join(this.input, file)
      if (isSVGFile(file)) {
        hasDefaultSprite = true
      }
      const stat = await fs.lstat(source)
      if (stat.isDirectory() || stat.isSymbolicLink()) {
        await this.createSprite(file, source)
      }
    }

    if (hasDefaultSprite) {
      await this.createSprite(this.defaultSprite, this.input, { defaultSprite: true })
    }

    await this.writeSprites()
  }

  async createSprite (name: string, source: string, { defaultSprite = false } = {}) {
    const files = await fs.readdir(source)

    if (!this.sprites[name]) {
      this.sprites[name] = {
        name,
        defaultSprite,
        symbols: {}
      }
    }
    for (const file of files) {
      const symbol = generateName(file)

      if (isSVGFile(file) && !this.sprites[name].symbols[symbol]) {
        await this.newSymbol(join(source, file), symbol, name)
      }
    }
  }

  async registerSymbol (symbol: SVGSymbol, sprite = '') {
    sprite = sprite || symbol.sprite || this.defaultSprite
    if (!this.sprites[sprite]) {
      this.sprites[sprite] = {
        name: sprite,
        symbols: {}
      }
    }
    this.sprites[sprite].symbols[symbol.name] = symbol
    this.callHook('svg-sprite:symbol-add', symbol)

    // update
    await this.writeSprite(sprite, this.output)
    await this.writeJsonInfo()
  }

  async unregisterSymbol (symbol, sprite = '') {
    sprite = sprite || this.defaultSprite

    if (this.sprites[sprite] && this.sprites[sprite].symbols[symbol.name]) {
      delete this.sprites[sprite].symbols[symbol]
      this.callHook('svg-sprite:symbol-remove', symbol)

      // update json
      await this.writeJsonInfo()
    }
  }

  async unregisterSprite (sprite) {
    if (this.sprites[sprite] && this.sprites[sprite]) {
      delete this.sprites[sprite]
      this.callHook('svg-sprite:sprite-remove', sprite)

      try { await fs.unlink(join(this.output, sprite + '.svg')) } catch (e) {}
      // update json
      await this.writeJsonInfo()
    }
  }

  async newSymbol (file, name, sprite = '') {
    const rawContent = await readSVG(file)
    const optimizeContent = await this.optimizeSVG(name, rawContent)
    const symbol = await convertToSymbol(name, optimizeContent)
    const defs = await extractDefs(optimizeContent)

    await this.registerSymbol({
      name,
      sprite,
      path: file,
      content: symbol,
      defs
    })
  }

  async writeSprites () {
    for (const sprite of Object.values(this.sprites)) {
      await this.writeSprite(sprite, this.output)
    }

    await this.writeJsonInfo()
  }

  /**
 * Export symbols and sprites list into `sprites.json` file inside `output` dir
 * @param {string} directory
 */
  async writeJsonInfo () {
    const json = Object.values(this.sprites).reduce(function (arr, sprite) {
      const spriteSymbols = []
      Object.values(sprite.symbols).forEach((symbol) => {
        spriteSymbols.push(symbol.name)
      })
      arr.push({
        name: sprite.name,
        defaultSprite: sprite.defaultSprite,
        symbols: spriteSymbols
      })
      return arr
    }, [])
    await fs.writeFile(join(this.output, 'sprites.json'), JSON.stringify(json, null, 2), { flag: 'w' })
    this.callHook('svg-sprite:update', this.sprites)
  }

  async writeSprite (sprite: SVGSprite | string, directory: string) {
    if (typeof sprite === 'string') {
      sprite = this.sprites[sprite]
    }
    if (!sprite) {
      return
    }

    const symbols = Object.values(sprite.symbols)
      .map(s => s.content)
      .join('\n')

    const defs = Object.values(sprite.symbols)
      .map(s => s.defs)
      .filter(d => Boolean(d))
      .join('\n')

    const svg = wrap(symbols, defs)

    await writeSVG(
      join(directory, `${sprite.name}.svg`),
      svg
    )
  }

  async optimizeSVG (name, content) {
    cleanupIDs.params.prefix = `${name}-`
    const $data = await this.svgo.optimize(content)
    return $data.data
  }
}
