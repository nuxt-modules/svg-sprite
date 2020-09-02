import { sep, join } from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import chalk from 'chalk'

const logger = consola.withScope('@nuxtjs/svg-sprite')
const sprites = {}

export function generateName (name) {
  return name
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/[^a-z0-9-]/g, '-')
}

function registerSymbol (sprite, symbol) {
  sprites[sprite].symbols[symbol.name] = symbol
}

async function newIcon (svgMaster, file, sprite, name) {
  const rawContent = await svgMaster.readSVG(file)
  const optimizeContent = await svgMaster.optimizeSVG(name, rawContent)
  const symbol = await svgMaster.convertToSymbol(name, optimizeContent)
  const defs = await svgMaster.extractDefs(optimizeContent)

  await registerSymbol(sprite, {
    name,
    path: file,
    content: symbol,
    defs
  })
}

async function createSprite (svgMaster, name, source, { defaultSprite = false } = {}) {
  const files = await fs.readdir(source)

  if (!sprites[name]) {
    sprites[name] = {
      name,
      defaultSprite,
      symbols: {}
    }
  }
  for (const file of files) {
    const path = join(source, file)
    const iconName = generateName(file)

    if (svgMaster.isSVGFile(file) && !sprites[name].symbols[iconName]) {
      await newIcon(svgMaster, path, name, iconName)
    }
  }
}

async function writeSprites (svgMaster, directory) {
  for (const name in sprites) {
    await writeSprite(svgMaster, name, directory)
  }

  await writeJsonInfo(directory)
}

/**
 * Export symbols and sprites list into `sprites.json` file inside `output` dir
 * @param {string} directory
 */
async function writeJsonInfo (directory) {
  const json = Object.values(sprites).reduce(function (arr, sprite) {
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
  await fs.writeFile(directory + '/sprites.json', JSON.stringify(json, 0, 2), { flag: 'w' })
}

async function writeSprite (svgMaster, name, directory) {
  if (!sprites[name]) {
    return
  }

  const symbols = Object.values(sprites[name].symbols)
    .map(s => s.content)
    .join('\n')

  const defs = Object.values(sprites[name].symbols)
    .map(s => s.defs)
    .filter(d => Boolean(d))
    .join('\n')

  const svg = svgMaster.wrap(symbols, defs)

  await svgMaster.writeSVG(
    join(directory, `${name}.svg`),
    svg
  )
}

export async function addIcon (svgMaster, file, { input, output, defaultSprite }) {
  const path = file.replace(input + sep, '')
  const arr = path.split(sep)
  const sprite = arr.length === 2 ? arr[0] : defaultSprite
  const iconName = generateName(arr[arr.length - 1])

  if (!sprites[sprite]) {
    sprites[sprite] = {
      name: sprite,
      defaultSprite: sprite === defaultSprite,
      symbols: {}
    }
  }

  await newIcon(svgMaster, file, sprite, iconName)

  await writeSprite(svgMaster, sprite, output)
  // update json
  await writeJsonInfo(output)
  logger.log({
    type: 'added',
    message: `SVG icon ${chalk.bold(sprite + '/' + iconName)} added`,
    icon: chalk.green.bold('+')
  })
}

export async function invalidateIcon (svgMaster, file, { input, output, defaultSprite }) {
  const path = file.replace(input + sep, '')
  const arr = path.split(sep)
  const sprite = arr.length === 2 ? arr[0] : defaultSprite
  const iconName = generateName(arr[arr.length - 1])

  delete sprites[sprite].symbols[iconName]

  const spriteFile = join(output, sprite + '.svg')
  if (await fs.exists(spriteFile)) {
    await fs.unlink(spriteFile)
  }

  await writeSprite(svgMaster, sprite, output)
  // update json
  await writeJsonInfo(output)
  logger.log({
    type: 'removed',
    message: `SVG icon ${chalk.bold(sprite + '/' + iconName)} removed`,
    icon: chalk.red.bold('-')
  })
}

export async function invalidateSprite (svgMaster, file, { input, output }) {
  const arr = file.replace(input + sep, '').split(sep)
  const sprite = arr[arr.length - 1]

  delete sprites[sprite]

  const spriteFile = join(output, sprite + '.svg')
  if (await fs.exists(spriteFile)) {
    await fs.unlink(spriteFile)
  }
  // update json
  await writeJsonInfo(output)
}

export async function generateSprite (svgMaster, { input, output, defaultSprite }) {
  const files = await fs.readdir(input)
  let hasDefaultSprite = false

  for (const file of files) {
    const source = join(input, file)
    if (svgMaster.isSVGFile(file)) {
      hasDefaultSprite = true
    }
    const stat = await fs.lstat(source)
    if (stat.isDirectory()) {
      await createSprite(svgMaster, file, source)
    }
  }

  if (hasDefaultSprite) {
    await createSprite(svgMaster, defaultSprite, input, { defaultSprite: true })
  }

  await writeSprites(svgMaster, output)
}
