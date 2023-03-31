import type { Config } from 'svgo'
import { optimize } from 'svgo'

export interface SVG {
  name: string
  sprite: string
  content: string
  defs?: string
}

export function useSvgFile (file: string, { defaultSprite = 'icons' } = {}) {
  if (file.startsWith('svg:')) {
    file = file.substring(4)
  }
  const paths = file.split(':')
  const name = paths.pop()!.replace(/\.svg$/, '').toLocaleLowerCase().replace(/[^a-z0-9-:]/g, '-')
  const sprite = paths.join('-')
  return {
    name,
    sprite: sprite || defaultSprite
  }
}

export function createSpritesManager (svgoOptions: Config = {}) {
  const sprites = {} as Record<string, Array<SVG>>

  const addSvg = async (svg: SVG) => {
    svg = await optimizeSVG(svg, svgoOptions)
      .then(extractDefs)
      .then(convertToSymbol)

    sprites[svg.sprite] = (sprites[svg.sprite] || []).filter(s => s.name !== svg.name)
    sprites[svg.sprite].push(svg)
  }

  const removeSvg = (sprite: string, name: string) => {
    sprites[sprite] = sprites[sprite] || []
    sprites[sprite] = sprites[sprite].filter(s => s.name !== name)

    if (sprites[sprite].length === 0) {
      delete sprites[sprite]
    }
  }

  const removeSprite = (sprite: string) => {
    delete sprites[sprite]
  }

  const generateSprite = (sprite: string) => {
    if (!sprites[sprite]) {
      return ''
    }
    const defs = sprites[sprite].map(svg => svg.defs || '').join('')
    const contents = sprites[sprite].map(svg => svg.content)
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
      `<defs>${defs}</defs>`,
      ...contents,
      '</svg>'
    ].join('\n')
  }

  return {
    sprites,
    addSvg,
    removeSvg,
    removeSprite,
    generateSprite
  }
}

function convertToSymbol (svg: SVG) {
  return {
    ...svg,
    content: svg.content
      .replace('<svg', `<symbol id="${svg.name}"`)
      .replace('</svg>', '</symbol>')
      .replace(/<defs>(.+)<\/defs>/, '')
  }
}

function extractDefs (svg: SVG) {
  return {
    ...svg,
    defs: svg.content.match(/<defs>(.+)<\/defs>/)?.[1] || ''
  }
}

async function optimizeSVG (svg: SVG, optimizeOptions: Config = {}) {
  const plugins: any[] = optimizeOptions.plugins || []
  const presetDefault = plugins.find(p => p.name === 'preset-default')

  presetDefault.params.overrides.cleanupIds = {
    ...presetDefault.params.overrides.cleanupIds,
    prefix: `${svg.name}-`
  }

  const $data = await optimize(svg.content, optimizeOptions)

  return {
    ...svg,
    content: $data.data
  }
}
